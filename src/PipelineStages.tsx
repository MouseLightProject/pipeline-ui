import * as React from "react";
import {Panel} from "react-bootstrap"
let cytoscape = require("cytoscape");

import {PipelineStageTable} from "./PipelineStageTable";
import {Loading} from "./Loading";
import {PipelineStageCreateComponent} from "./PipelineStageCreateComponent";

export class PipelineStages extends React.Component<any, any> {
    onCreateProject = (project_id, task_id, previous_stage_id, dst_path) => {
        this.props.createMutation(project_id, task_id, previous_stage_id, dst_path)
        .then(() => {
            this.props.data.refetch();
            this.props.pipelinesForProjectData.refetch();
        }).catch((err) => {
            console.log(err);
        });
    };

    onSetProjectStatus = (id: string, shouldBeActive: boolean) => {
        this.props.setStatusMutation(id, shouldBeActive)
        .then(() => {
            this.props.data.refetch();
        }).catch((err) => {
            console.log(err);
        });
    };

    onDeleteProject = (id: string) => {
        this.props.deleteMutation(id)
        .then(() => {
            this.props.data.refetch();
        }).catch((err) => {
            console.log(err);
        });
    };

    // cy = null;
/*
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
            nodes.push({data: {id: project.id, name: project.name, bgColor:"#6FB1FC"}});
        });

        pipelineStages.forEach(stage => {
            let task = tasks.filter(task => task.id === stage.task_id);
            let name = task.length > 0 ? task[0].name : stage.id.slice(0, 8);
            nodes.push({data: {id: stage.id, name: name, bgColor:"#86B342"}});
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
                            "background-color":"data(bgColor)",
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
*/
    render() {
        let pipelineStages = [];

        if (this.props.data && this.props.data.pipelineStages) {
            pipelineStages = this.props.data.pipelineStages;
        }

        let projects = [];

        if (this.props.projectsData && this.props.projectsData.projects) {
            projects = this.props.projectsData.projects;
        }

        let tasks = [];

        if (this.props.taskDefinitionsData && this.props.taskDefinitionsData.taskDefinitions) {
            tasks = this.props.taskDefinitionsData.taskDefinitions;
        }

        let pipelinesForProject = [];

        if (this.props.pipelinesForProjectData && this.props.pipelinesForProjectData.pipelineStagesForProject) {
            pipelinesForProject = this.props.pipelinesForProjectData.pipelineStagesForProject;
        }

        return (
            <div>
                {this.props.data.loading ? <Loading/> :
                    <TablePanel tasks={tasks} projects={projects} pipelineStages={pipelineStages}
                                pipelinesForProject={pipelinesForProject}
                                createCallback={this.onCreateProject} updateStatusCallback={this.onSetProjectStatus}
                                deleteCallback={this.onDeleteProject}
                                onPipelinesForProjectIdChanged={this.props.onPipelinesForProjectIdChanged}/>}
            </div>
        );
    }
}

class TablePanel extends React.Component<any, any> {
    render() {
        return (
            <div>
                <Panel collapsible defaultExpanded header="Pipeline Stages" bsStyle="primary">
                    <PipelineStageTable pipelineStages={this.props.pipelineStages}
                                        updateStatusCallback={this.props.updateStatusCallback}
                                        deleteCallback={this.props.deleteCallback}/>
                </Panel>
                <PipelineStageCreateComponent tasks={this.props.tasks} projects={this.props.projects}
                                              pipelinesForProject={this.props.pipelinesForProject}
                                              createCallback={this.props.createCallback}
                                              onPipelinesForProjectIdChanged={this.props.onPipelinesForProjectIdChanged}/>
            </div>
        );
    }
}