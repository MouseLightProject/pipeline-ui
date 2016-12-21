import * as React from "react";
import {PageHeader} from "react-bootstrap";

import {PipelineStages} from "./PipelineStages";
import {Projects} from "./Projects";
import {TaskDefinitions} from "./TaskDefinitions";
import {PipelineGraph} from "./PipelineGraph";
import {Workers} from "./Workers";

export class BodyContainer extends React.Component<any, any> {
    render() {
        let divStyle = {
            margin: "20px"
        };

        let pipelineStages = [];

        if (this.props.data && this.props.data.pipelineStages) {
            pipelineStages = this.props.data.pipelineStages;
        }

        let tasks = [];

        if (this.props.data && this.props.data.taskDefinitions) {
            tasks = this.props.data.taskDefinitions;
        }

        let projects = [];

        if (this.props.data && this.props.data.projects) {
            projects = this.props.data.projects;
        }

        let pipelinesForProject = [];

        if (this.props.data && this.props.data.pipelineStagesForProject) {
            pipelinesForProject = this.props.data.pipelineStagesForProject;
        }

        let workers = [];

        if (this.props.data && this.props.data.pipelineWorkers) {
            workers = this.props.data.pipelineWorkers;
        }

        let loading = false;

        if (this.props.data) {
            loading = this.props.data.loading;
        }

        return (
            <div style={divStyle}>
                <PageHeader>Mouse Light Acquisition Dashboard
                    <small> Pipeline Server</small>
                </PageHeader>
                <PipelineGraph loading={loading} projects={projects} pipelineStages={pipelineStages} tasks={tasks}/>
                <Projects loading={loading} projects={projects}/>
                <PipelineStages loading={loading} projects={projects} pipelineStages={pipelineStages} tasks={tasks} pipelinesForProjectId={pipelinesForProject}
                                         onPipelinesForProjectIdChanged={this.props.onPipelinesForProjectIdChanged}/>
                <Workers loading={loading} workers={workers}/>
                <TaskDefinitions loading={loading} tasks={tasks}/>
            </div>
        )
    }
}
