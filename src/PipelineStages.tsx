import * as React from "react";
import {Panel} from "react-bootstrap"

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

    render() {
        // console.log(this.props.pipelinesForProjectData.pipelineStagesForProject);

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