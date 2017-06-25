import * as React from "react";
import {NavItem} from "react-bootstrap"
import {AllProjectsId} from "./helpers/ProjectMenu";
import {pollingIntervalSeconds} from "./GraphQLComponents";
import {IProject, IPipelineStage} from "./QueryInterfaces";
import {ProjectMenuNavbar} from "./helpers/ProjectMenuNavbar";
import {calculateProjectBreadth} from "./helpers/modelUtils";
import gql from "graphql-tag";
import {graphql} from "react-apollo";
let cytoscape = require("cytoscape");

function SetDifference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
    let difference: Set<T> = new Set<T>(setA);
    for (let elem of setB) {
        difference.delete(elem);
    }
    return difference;
}

interface IPipelineGraphState {
    projectId?: string;
}

const pipelineGraphQuery = gql`query {
  projects {
    id
    name
    description
    root_path
    sample_number
    sample_x_min
    sample_x_max
    sample_y_min
    sample_y_max
    sample_z_min
    sample_z_max
    region_x_min
    region_x_max
    region_y_min
    region_y_max
    region_z_min
    region_z_max
    is_processing
    stages {
      id
      name
      depth
      previous_stage_id
      task_id
      task {
        id
        name
      }
      performance {
        id
        num_in_process
        num_ready_to_process
        num_execute
        num_complete
        num_error
        num_cancel
        cpu_average
        cpu_high
        cpu_low
        memory_average
        memory_high
        memory_low
        duration_average
        duration_high
        duration_low
      }
    }
  }
}`;

@graphql(pipelineGraphQuery, {
    options: {
        pollInterval: pollingIntervalSeconds * 1000
    }
})
export class PipelineGraph extends React.Component<any, IPipelineGraphState> {

    protected cy = null;

    constructor(props) {
        super(props);

        this.state = {
            projectId: AllProjectsId
        };
    }

    private onProjectSelectionChange = (projectId: any) => {
        this.cy.elements().remove();

        this.setState({projectId: projectId}, null);
    };

    private onResetView = () => {
        if (this.props.data.refetch) {
            this.props.data.refetch().then(() => {
                this.cy.fit([], 30);
                this.cy.center();
            });
        } else {
            this.cy.fit([], 30);
            this.cy.center();
        }
    };

    private calculateWaiting(project: IProject): number {
        let sum = 0;

        return project.stages.reduce((sum, stage) => {
            return sum + (stage.performance === null ? 0 : stage.performance.num_ready_to_process);
        }, sum);
    }

    private assembleStage(stage: IPipelineStage, project: IProject, breadth: number, nodes, edges, waitingCount) {
        let name = stage.name;

        if (!name || name.length === 0) {
            name = stage.task ? stage.task.name : stage.id.slice(0, 8);
        }

        let simpleName = name;

        if (stage.performance !== null) {
            if (stage.is_processing) {
                name = name + "\n" + `${stage.performance.num_in_process} processing`;
                name = name + "\n" + `${stage.performance.num_ready_to_process} waiting`;
                name = name + "\n" + `${stage.performance.num_complete} complete`;
                name = name + "\n" + `${stage.performance.num_error} with errors`;
            } else {
                name = name + "\n(paused)";
                name = name + "\n" + `${stage.performance.num_in_process} processing`;
                name = name + "\n" + `${stage.performance.num_ready_to_process} waiting`;
                name = name + "\n" + `${stage.performance.num_complete} complete`;
                name = name + "\n" + `${stage.performance.num_error} with errors`;
            }
        }

        let ele = null;

        let collection = this.cy.getElementById(stage.id);

        if (collection.length > 0) {
            ele = collection[0];
        }

        let totalProcessed = stage.performance.num_in_process + stage.performance.num_ready_to_process + stage.performance.num_complete + stage.performance.num_error;

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
                    numInProcess: stage.performance.num_in_process / totalProcessed,
                    numReadyToProcess: stage.performance.num_ready_to_process / totalProcessed,
                    numComplete: stage.performance.num_complete / totalProcessed,
                    numError: stage.performance.num_error / totalProcessed,
                    queueWeight: stage.performance.num_ready_to_process / waitingCount,
                    bgColor: stage.is_processing ? "#86B342" : "#FF0000",
                    shape: "rectangle"
                }
            });
        } else {
            ele.data("name", name);
            ele.data("shortName", simpleName);
            ele.data("breadth", breadth);
            ele.data("numInProcess", stage.performance.num_in_process / totalProcessed);
            ele.data("numReadyToProcess", stage.performance.num_ready_to_process / totalProcessed);
            ele.data("numComplete", stage.performance.num_complete / totalProcessed);
            ele.data("numError", stage.performance.num_error / totalProcessed);
            ele.data("queueWeight", stage.performance.num_ready_to_process / waitingCount);
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
                    name: project.name,
                    isProject: 1,
                    depth: 0,
                    breadth: breadth,
                    bgColor: project.is_processing ? "#86B342" : "#FF0000",
                    shape: "roundrectangle"
                }
            });
        } else {
            ele.data("name", project.name);
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

        projects.forEach((project, index) => {
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

        this.cy.on("vclick", "node", {}, (evt) => {
            const node = evt.cyTarget;

            node.data("isPie", node.data("isPie") === 1 ? 0 : 1);
        });

        setTimeout(() => this.onResetView(), 250);
    };

    public componentWillUnmount() {
        this.cy.destroy();
        this.cy = null;
    };

    public render() {
        const divStyle = {
            height: "100%"
        };

        const test = {
            height: "100%"
        };

        const loading = !this.props.data || this.props.data.loading;

        const projects = !loading ? this.props.data.projects : [];

        this.update(projects);

        return (
            <div style={test}>
                <ProjectMenuNavbar keyPrefix="pipelineGraph" projects={projects}
                                   selectedProjectId={this.state.projectId}
                                   onProjectSelectionChange={this.onProjectSelectionChange} includeAllProjects={true}>
                    <NavItem onClick={this.onResetView}>Reset view</NavItem>
                </ProjectMenuNavbar>
                <div id="cy" style={divStyle}/>
            </div>
        );
    }
}

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

