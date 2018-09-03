import * as React from "react";
import {Menu, Header} from "semantic-ui-react"
import {Mutation} from "react-apollo";
import {toast} from "react-toastify";

import {AllProjectsId, ProjectMenu} from "../helpers/ProjectMenu";
import {IPipelineStage} from "../../models/pipelineStage";
import {calculateProjectBreadth} from "../../models/modelUtils";
import {IProject, IProjectInput} from "../../models/project";
import {PreferencesManager} from "../../util/preferencesManager";
import {themeHighlight} from "../../util/styleDefinitions";
import {UpdateProjectMutation} from "../../graphql/project";
import {toastError} from "../../util/Toasts";

const cytoscape = require("cytoscape");
require("../../util/graphMenu")(cytoscape);

function SetDifference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
    let difference: Set<T> = new Set<T>(setA);
    for (let elem of setB) {
        difference.delete(elem);
    }
    return difference;
}

interface IPipelineGraphProps {
    projects: IProject[];
}

interface IPipelineGraphState {
    projectId?: string;
}

export class PipelineGraph extends React.Component<IPipelineGraphProps, IPipelineGraphState> {
    private cy = null;
    private _updateProject = null;

    constructor(props) {
        super(props);

        this.state = {
            projectId: null
        };
    }

    private async onToggleIsProcessing(project: IProjectInput, isProcessing: boolean) {
        /*
        try {
            const result = await this.props.updateProject({id: project.id, is_processing: isProcessing});

            if (!result.data.updateProject.project) {
                toast.error(toastError("Update", result.data.updateProject.error), {autoClose: false});
            }
        } catch (error) {
            toast.error(toastError("Update", error), {autoClose: false});
        }*/

        if (this._updateProject) {
            this._updateProject({variables: {project: {id: project.id, is_processing: isProcessing}}});
        }
    }

    private onProjectSelectionChange = (projectId: any) => {
        this.cy.elements().remove();

        PreferencesManager.Instance.PreferredProjectId = projectId;

        this.setState({projectId: projectId}, null);
    };

    private onResetView = () => {
        this.cy.fit([], 30);
        this.cy.center();
    };

    private calculateWaiting(project: IProject): number {
        let sum = 0;

        return project.stages.reduce((sum, stage) => {
            return sum + (stage.tile_status === null ? 0 : stage.tile_status.queued);
        }, sum);
    }

    private assembleStage(stage: IPipelineStage, project: IProject, breadth: number, nodes, edges, waitingCount) {
        let name = stage.name;

        if (!name || name.length === 0) {
            name = stage.task ? stage.task.name : stage.id.slice(0, 8);
        }

        let simpleName = name;

        const tileStatus = stage.tile_status || {
            incomplete: 0,
            queued: 0,
            processing: 0,
            complete: 0,
            failed: 0,
            canceled: 0
        };

        let totalKnown = tileStatus.incomplete + tileStatus.processing + tileStatus.queued + tileStatus.complete + tileStatus.failed + tileStatus.canceled;

        if (stage.is_processing) {
            name = name + "\n" + `${totalKnown} tiles`;
            name = name + "\n" + `${tileStatus.incomplete} not ready`;
            name = name + "\n" + `${tileStatus.queued} queued`;
            name = name + "\n" + `${tileStatus.processing} processing`;
            name = name + "\n" + `${tileStatus.canceled} canceled`;
            name = name + "\n" + `${tileStatus.complete} complete`;
            name = name + "\n" + `${tileStatus.failed} failed`;
        } else {
            name = name + "\n(paused)";
            name = name + "\n" + `${totalKnown} tiles`;
            name = name + "\n" + `${tileStatus.incomplete} not ready`;
            name = name + "\n" + `${tileStatus.queued} queued`;
            name = name + "\n" + `${tileStatus.processing} processing`;
            name = name + "\n" + `${tileStatus.canceled} canceled`;
            name = name + "\n" + `${tileStatus.complete} complete`;
            name = name + "\n" + `${tileStatus.failed} failed`;
        }

        let ele = null;

        let collection = this.cy.getElementById(stage.id);

        if (collection.length > 0) {
            ele = collection[0];
        }

        if (ele === null) {
            nodes.push({
                data: {
                    group: "nodes",
                    id: stage.id,
                    name: name,
                    isProject: 0,
                    depth: stage.depth,
                    breadth: breadth,
                    isPie: 1,
                    shortName: simpleName,
                    numIncomplete: tileStatus.incomplete / totalKnown,
                    numInProcess: tileStatus.processing / totalKnown,
                    numReadyToProcess: tileStatus.queued / totalKnown,
                    numComplete: tileStatus.complete / totalKnown,
                    numError: tileStatus.failed / totalKnown,
                    numCanceled: tileStatus.canceled / totalKnown,
                    queueWeight: tileStatus.queued / waitingCount,
                    bgColor: stage.is_processing ? "#86B342" : "#FF0000",
                    shape: "rectangle"
                }
            });
        } else {
            ele.data("name", name);
            ele.data("shortName", simpleName);
            ele.data("breadth", breadth);
            ele.data("numIncomplete", tileStatus.incomplete / totalKnown);
            ele.data("numInProcess", tileStatus.processing / totalKnown);
            ele.data("numReadyToProcess", tileStatus.queued / totalKnown);
            ele.data("numComplete", tileStatus.complete / totalKnown);
            ele.data("numError", tileStatus.failed / totalKnown);
            ele.data("numCanceled", tileStatus.canceled / totalKnown);
            ele.data("queueWeight", tileStatus.queued / waitingCount);
            ele.data("bgColor", stage.is_processing ? "#86B342" : "#FF0000");
        }

        let parentId = stage.previous_stage_id ? stage.previous_stage_id : project.id;

        let elementId = `${parentId}_${stage.id}`;

        ele = null;

        collection = this.cy.getElementById(elementId);

        if (collection.length > 0) {
            ele = collection[0];
        }

        if (ele === null) {
            edges.push({data: {group: "edges", id: elementId, source: parentId, target: stage.id}})
        }

        return stage.id;
    }

    private assembleProject(project: IProject, breadthOffset: number, maxBreadth: number, nodes, edges) {
        if (this.state.projectId !== AllProjectsId && this.state.projectId !== project.id) {
            return [];
        }

        let ele = null;

        let collection = this.cy.getElementById(project.id);

        if (collection.length > 0) {
            ele = collection[0];
        }

        const breadth = breadthOffset + Math.ceil(maxBreadth / 2) - 1;

        if (ele === null) {
            nodes.push({
                data: {
                    group: "nodes",
                    id: project.id,
                    project,
                    name: project.name,
                    is_processing: project.is_processing,
                    isProject: 1,
                    depth: 0,
                    breadth: breadth,
                    bgColor: project.is_processing ? "#86B342" : "#FF0000",
                    shape: "roundrectangle"
                }
            });
        } else {
            ele.data("name", project.name);
            ele.data("is_processing", project.is_processing);
            ele.data("bgColor", project.is_processing ? "#86B342" : "#FF0000");
            ele.data("breadth", breadth);
        }

        const waiting = this.calculateWaiting(project);

        const stages = project.stages.slice();

        stages.sort((a, b) => {
            return a.depth - b.depth;
        });

        const parentCount = new Map<string, number>();

        return stages.map(stage => {
            const key = stage.previous_stage_id || project.id;

            if (!parentCount.has(key)) {
                parentCount.set(key, breadthOffset);
            } else {
                parentCount.set(key, parentCount.get(key) + 1);
            }

            parentCount.set(stage.id, parentCount.get(key) - 1);

            return this.assembleStage(stage, project, parentCount.get(key), nodes, edges, waiting);
        });
    }

    private update(projects) {
        if (!this.cy || !projects) {
            return;
        }

        let totalBreadth = 0;

        // List of elements all elements that should be in the graph.
        let currentNodeIds = new Set<string>();

        // List of elements not already in the graph.
        let nodes = [];
        let edges = [];

        projects.forEach(project => {
            if (this.state.projectId !== AllProjectsId && this.state.projectId !== project.id) {
                return;
            }

            const breadth = calculateProjectBreadth(project);

            const maxBreadth = Math.max(...breadth);

            const stage_ids = this.assembleProject(project, totalBreadth, maxBreadth, nodes, edges);

            totalBreadth += maxBreadth;

            currentNodeIds.add(project.id);

            stage_ids.forEach(id => currentNodeIds.add(id));
        });

        // Have set of all that should be in and all that need to be added.  Need the set in the graph that no longer
        // should be.
        let nodesToRemove: Set<string> = SetDifference(new Set<string>(this.cy.nodes().map(n => n.data("id"))), currentNodeIds);

        // By default assume we should maintain the zoom/pan.  Exceptions are
        //   There are no existing nodes - reset view to include any nodes/elements
        //   Nodes are being removed/added - assume the user wants to see.
        let freezeViewPort = this.cy.nodes().length > 0;

        if (nodesToRemove.size > 0) {
            nodesToRemove.forEach(n => {
                this.cy.remove(`node[id = "${n}"]`);
            });
            freezeViewPort = false;
        }

        this.cy.nodes().lock();

        if (nodes.length > 0) {
            freezeViewPort = false;
            this.cy.add(nodes);
        }

        if (edges.length > 0) {
            freezeViewPort = false;
            this.cy.add(edges);
        }

        let pan = this.cy.pan();
        let zoom = this.cy.zoom();

        this.cy.layout({
            name: "grid",
            rows: totalBreadth,
            position: (node) => {
                let data = node.json().data;
                return {
                    row: data.breadth,
                    col: data.depth
                }
            }
        });

        this.cy.nodes().unlock();

        if (freezeViewPort) {
            this.cy.viewport({pan: pan, zoom: zoom});
        }
    };

    public componentDidMount() {
        this.cy = cytoscape(
            {
                container: document.getElementById("cy"),
                boxSelectionEnabled: false,
                autounselectify: true,
                elements: {nodes: [], edges: []},
                style: [ // the stylesheet for the graph
                    {
                        selector: "node[isProject = 0][isPie = 1]",
                        style: pieStyle
                    },
                    {
                        selector: "node[isProject = 0][isPie = 0]",
                        style: squareNodeLabelStyle
                    },
                    {
                        selector: "node[isProject = 1]",
                        style: projectLabelStyle
                    },
                    {
                        selector: "edge",
                        style: {
                            "width": 5,
                            "curve-style": "bezier",
                            "line-color": "#acc",
                            "target-arrow-color": "#ccc",
                            "source-arrow-shape": "circle",
                            "target-arrow-shape": "triangle",
                            "edge-text-rotation": "autorotate"
                        }
                    }
                ],
                layout: {
                    name: "breadthfirst",
                    directed: false,
                    padding: 10,
                    spacingFactor: 1,
                    roots: []
                }
            });
        /*
                this.cy.cxtmenu({
                    menuRadius: 120,
                    selector: "node[isProject = 0]",
                    commands: [
                        {
                            content: "Pause/Resume",
                            select: function () {
                                console.log("bg1");
                            },
                            enabled: (ele) => {
                                return false;
                            }
                        },
                        {
                            content: "Resubmit Canceled",
                            select: function () {
                                console.log("bg2");
                            }
                        },
                        {
                            content: "Resubmit Failed",
                            select: function () {
                                console.log("bg2");
                            }
                        },
                        {
                            content: "Resubmit All",
                            select: function () {
                                console.log("bg2");
                            }
                        }
                    ]
                });
        */
        this.cy.cxtmenu({
            menuRadius: 100,
            selector: "node[isProject = 1]",
            commands: [
                {
                    content: "Pause",
                    select: async (ele) => {
                        await this.onToggleIsProcessing(ele.data("project"), false);
                    },
                    enabled: (ele) => {
                        return ele.data("is_processing");
                    }
                }, {
                    content: "Resume",
                    select: async (ele) => {
                        await this.onToggleIsProcessing(ele.data("project"), true);
                    },
                    enabled: (ele) => {
                        return !ele.data("is_processing");
                    }
                }

            ]
        });

        this.cy.on("vclick", "node", {}, (evt) => {
            const node = evt.cyTarget;

            node.data("isPie", node.data("isPie") === 1 ? 0 : 1);
        });

        // Force a render now that cy is mounted.
        this.setState({
            projectId: PreferencesManager.Instance.PreferredProjectId
        });
    };

    public componentWillUnmount() {
        this.cy.destroy();
        this.cy = null;
    };

    public render() {
        this.update(this.props.projects);

        return (
            <div style={test}>
                <Menu style={{borderTop: "none", borderLeft: "none", borderRight: "none", borderRadius: 0, boxShadow: "none"}}>
                    <Menu.Header>
                        <div style={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            paddingLeft: "10px",
                            paddingRight: "10px",
                            paddingTop: "4px"
                        }}>
                            <Header style={{color: themeHighlight}}>
                                Pipeline Graphs
                            </Header>
                        </div>
                    </Menu.Header>
                    <Menu.Item style={{padding: 0}}/>
                    <ProjectMenu keyPrefix="pipelineGraph"
                                 projects={this.props.projects}
                                 selectedProjectId={this.state.projectId}
                                 onProjectSelectionChange={this.onProjectSelectionChange}
                                 includeAllProjects={true}>
                    </ProjectMenu>
                    <Menu.Menu position="right">
                        <Menu.Item onClick={this.onResetView}>Reset view</Menu.Item>
                    </Menu.Menu>
                </Menu>
                <Mutation mutation={UpdateProjectMutation}>
                    {(updateProject: Function) => {
                        this._updateProject = updateProject;
                        return (
                            <div id="cy" style={divStyle}/>
                        )
                    }
                    }
                </Mutation>
            </div>
        );
    }
}

/*
export const PipelineGraph = graphql<any, any>(UpdateProjectMutation, {
    props: ({mutate}) => ({
        updateProject: (project: IProjectInput) => mutate({
            variables: {project}
        })
    })
})(_PipelineGraph);
*/
const divStyle = {
    height: "100%",
    width: "100%"
};

const test = {
    height: "100%",
    width: "100%"
};

const pieStyle = {
    "width": "mapData(queueWeight, 0, 1, 50, 250)",
    "height": "mapData(queueWeight, 0, 1, 50, 250)",
    "content": "data(shortName)",
    "pie-size": "90%",
    "background-color": "data(bgColor)",
    "pie-1-background-color": "#74E883",
    "pie-1-background-size": "mapData(numInProcess, 0, 1, 0, 100)",
    "pie-2-background-color": "#E8E800",
    "pie-2-background-size": "mapData(numReadyToProcess, 0, 1, 0, 100)",
    "pie-3-background-color": "#74CBE8",
    "pie-3-background-size": "mapData(numComplete, 0, 1, 0, 100)",
    "pie-4-background-color": "#E8747C",
    "pie-4-background-size": "mapData(numError, 0, 1, 0, 100)"
};

const projectLabelStyle = {
    "label": "data(name)",
    "shape": "data(shape)",
    "width": "label",
    "height": "label",
    "text-wrap": "wrap",
    "text-valign": "center",
    "color": "#fff",
    "background-color": "data(bgColor)",
    "padding": 10
};

const squareNodeLabelStyle = {
    "label": "data(name)",
    "shape": "data(shape)",
    "width": "label",
    "height": "label",
    "text-wrap": "wrap",
    "text-valign": "center",
    "border-width": "mapData(queueWeight, 0, 1, 0, 20)",
    "border-color": "#E8E800",
    "color": "#fff",
    "background-color": "data(bgColor)",
    "padding": 20
};

