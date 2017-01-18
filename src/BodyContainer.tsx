import * as React from "react";
import {PageHeader} from "react-bootstrap";

import {Workers} from "./Workers";
import {
    ProjectsWithQuery, PipelineStagesWithQuery, TaskDefinitionsWithQuery,
    PipelineGraphWithQuery
} from "./GraphQLComponents";
import {PipelineTileMapWithQuery} from "./PipelineTileMap";

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

        let workers = [];

        if (this.props.data && this.props.data.pipelineWorkers) {
            workers = this.props.data.pipelineWorkers;
        }

        let loading = false;

        if (this.props.data) {
            loading = this.props.data.loading;
        }

        let refetch =  null;

        if (this.props.data && this.props.data.refetch) {
            refetch = this.props.data.refetch;
        }

        return (
            <div style={divStyle}>
                <PageHeader>Mouse Light Acquisition Dashboard
                    <small> Pipeline Server</small>
                </PageHeader>
                <PipelineGraphWithQuery loading={loading} refetch={refetch} projects={projects} pipelineStages={pipelineStages} tasks={tasks}/>
                <PipelineTileMapWithQuery loading={loading} projects={projects} pipelineStages={pipelineStages} project_id="44e49773-1c19-494b-b283-54466b94b70f" plane="388"/>
                <ProjectsWithQuery loading={loading} refetch={refetch} projects={projects}/>
                <PipelineStagesWithQuery loading={loading} refetch={refetch} projects={projects} pipelineStages={pipelineStages} tasks={tasks}/>
                <Workers loading={loading} refetch={refetch} workers={workers}/>
                <TaskDefinitionsWithQuery loading={loading} refetch={refetch} tasks={tasks}/>
            </div>
        )
    }
}
