import * as React from "react";
import {Panel} from "react-bootstrap"
let cytoscape = require("cytoscape");

export class PipelineGraph extends React.Component<any, any> {

    // cy = null;

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    componentDidUpdate = () => {
        let projects = [];

        if (this.props.projectsData && this.props.projectsData.projects) {
            projects = this.props.projectsData.projects;
        }

        let pipelineStages = [];

        if (this.props.data && this.props.data.pipelineStages) {
            pipelineStages = this.props.data.pipelineStages;
        }

        let tasks = [];

        if (this.props.taskDefinitionsData && this.props.taskDefinitionsData.taskDefinitions) {
            tasks = this.props.taskDefinitionsData.taskDefinitions;
        }

        let roots = [];
        let nodes = [];
        let edges = [];

        projects.forEach(project => {
            roots.push(project.id);
            nodes.push({data: {id: project.id, name: project.name, bgColor: "#6FB1FC"}});
        });

        pipelineStages.forEach(stage => {
            let task = tasks.filter(task => task.id === stage.task_id);
            let name = task.length > 0 ? task[0].name : stage.id.slice(0, 8);
            nodes.push({data: {id: stage.id, name: name, bgColor: "#86B342"}});
            let parentId = stage.previous_stage_id ? stage.previous_stage_id : stage.project_id;
            edges.push({data: {source: parentId, target: stage.id}})
        });

        let cy = cytoscape(
            {
                container: document.getElementById("cy"),
                boxSelectionEnabled: false,
                autounselectify: true,
                elements: {
                    nodes: nodes,
                    edges: edges
                },
                style: [ // the stylesheet for the graph
                    {
                        selector: "node",
                        style: {
                            "label": "data(name)",
                            "shape": "rectangle",
                            "width": "label",
                            "height": "label",
                            "text-valign": "center",
                            "color": "#fff",
                            "background-color": "data(bgColor)",
                            "padding": 15
                        }
                    },

                    {
                        selector: "edge",
                        style: {
                            "width": 10,
                            "curve-style": "bezier",
                            "line-color": "#acc",
                            "target-arrow-color": "#ccc",
                            "source-arrow-shape": "circle",
                            "target-arrow-shape": "triangle"
                        }
                    }
                ],
                layout: {
                    name: "breadthfirst",
                    directed: false,
                    padding: 10,
                    roots: roots
                }
            });

        // this.cy = cy;
    };

    componentWillUnmount = () => {
        // this.cy.destroy();
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
