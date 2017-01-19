import * as React from "react";
import {Panel} from "react-bootstrap"
let cytoscape = require("cytoscape");

function SetDifference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
    let difference: Set<T> = new Set<T>(setA);
    for (let elem of setB) {
        difference.delete(elem);
    }
    return difference;
}

export class PipelineGraph extends React.Component<any, any> {

    protected cy = null;

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    componentDidUpdate = () => {
        let projects = this.props.projects;

        let pipelineStages = this.props.pipelineStages;

        let tasks = this.props.tasks;

        // List of elements all elements that should be in the graph.
        let currentRootIds = new Set<string>();
        let currentNodeIds = new Set<string>();

        // List of elements not already in the graph.
        let nodes = [];
        let edges = [];

        projects.forEach(project => {
            let ele = null;

            let collection = this.cy.getElementById(project.id);

            if (collection.length > 0) {
                ele = collection[0];
            }

            if (ele === null) {

                nodes.push({
                    data: {
                        group: "nodes",
                        id: project.id,
                        name: project.name,
                        isProject: 1,
                        bgColor: project.is_processing ? "#86B342" : "#FF0000",
                        shape: "roundrectangle"
                    }
                });
            } else {
                ele.data("name", project.name);
                ele.data("bgColor", project.is_processing ? "#86B342" : "#FF0000");
            }

            currentNodeIds.add(project.id);
            currentRootIds.add(project.id);
        });

        let waiting = pipelineStages.map(stage => stage.performance === null ? 0 : stage.performance.num_ready_to_process);

        let maxWaiting = Math.max(...waiting);

        pipelineStages.forEach(stage => {
            let name = stage.name;

            if (!name || name.length === 0) {
                let task = tasks.filter(task => task.id === stage.task.id);

                name = task.length > 0 ? task[0].name : stage.id.slice(0, 8);
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
                        isPie: 1,
                        shortName: simpleName,
                        numInProcess: stage.performance.num_in_process / totalProcessed,
                        numReadyToProcess: stage.performance.num_ready_to_process / totalProcessed,
                        numComplete: stage.performance.num_complete / totalProcessed,
                        numError: stage.performance.num_error / totalProcessed,
                        queueWeight: stage.performance.num_ready_to_process / maxWaiting,
                        bgColor: stage.is_processing ? "#86B342" : "#FF0000",
                        shape: "rectangle"
                    }
                });
            } else {
                ele.data("name", name);
                ele.data("shortName", simpleName);
                ele.data("numInProcess", stage.performance.num_in_process / totalProcessed);
                ele.data("numReadyToProcess", stage.performance.num_ready_to_process / totalProcessed);
                ele.data("numComplete", stage.performance.num_complete / totalProcessed);
                ele.data("numError", stage.performance.num_error / totalProcessed);
                ele.data("queueWeight", stage.performance.num_ready_to_process / maxWaiting);
                ele.data("bgColor", stage.is_processing ? "#86B342" : "#FF0000");
            }

            currentNodeIds.add(stage.id);

            let parentId = stage.previous_stage_id ? stage.previous_stage_id : stage.project_id;

            let elementId = `${parentId}_${stage.id}`;

            ele = null;

            collection = this.cy.getElementById(elementId);

            if (collection.length > 0) {
                ele = collection[0];
            }

            if (ele === null) {
                edges.push({data: {group: "edges", id: elementId, source: parentId, target: stage.id}})
            }
        });

        // Have set of all that should be in and all that need to be added.  Need the set in the graph that no longer
        // should be.
        let nodesToRemove: Set<string> = SetDifference(new Set<string>(this.cy.nodes().map(n => n.data("id"))), currentNodeIds);

        let freezeViewPort = true;

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
            name: "breadthfirst",
            directed: true,
            spacingFactor: 1,
            animate: false,
            padding: 10,
            roots: currentRootIds
        });

        this.cy.nodes().unlock();

        if (freezeViewPort) {
            this.cy.viewport({pan: pan, zoom: zoom});
        }
    };

    componentDidMount = () => {
        let pieStyle = {
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

        let projectLabelStyle = {
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

        let squareNodeLabelStyle = {
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
                    roots: []
                }
            });

        this.cy.on("vclick", "node", {}, (evt) => {
            let node = evt.cyTarget;

            node.data("isPie", node.data("isPie") === 1 ? 0 : 1);
        });
    };

    componentWillUnmount = () => {
        this.cy.destroy();
    };

    render() {
        let divStyle = {
            minWidth: "200px",
            minHeight: "600px"
        };

        return (
            <Panel collapsible defaultExpanded header="Pipeline Graph" bsStyle="info">
                <div id="cy" width="600" height="600" style={divStyle}/>
            </Panel>
        );
    }
}
