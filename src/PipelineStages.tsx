import * as React from "react";
import {Panel} from "react-bootstrap"

import {PipelineStageTable} from "./PipelineStageTable";
import {Loading} from "./Loading";
import {PipelineStageCreateWithQuery} from "./PipelineStageCreateComponent";

export class PipelineStages extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {pipelinesForProjectId: ""};
    }

    onPipelinesForProjectIdChanged = (id: string) => {
        this.setState({pipelinesForProjectId: id}, null);
    };

    onSetProjectStatus = (id: string, shouldBeActive: boolean) => {
        this.props.setStatusMutation(id, shouldBeActive)
        .then(() => {
            this.props.refetch();
        }).catch((err) => {
            console.log(err);
        });
    };

    onDeleteProject = (id: string) => {
        this.props.deleteMutation(id)
        .then(() => {
            this.props.refetch();
        }).catch((err) => {
            console.log(err);
        });
    };

    render() {
        let projects = this.props.projects;

        let pipelineStages = this.props.pipelineStages;

        let tasks = this.props.tasks;

        return (
            <div>
                {this.props.loading ? <Loading/> :
                    <TablePanel tasks={tasks} projects={projects} pipelineStages={pipelineStages}
                                pipelinesForProjectId={this.state.pipelinesForProjectId}
                                refetch={this.props.refetch}
                                updateStatusCallback={this.onSetProjectStatus}
                                deleteCallback={this.onDeleteProject}
                                onPipelinesForProjectIdChanged={this.onPipelinesForProjectIdChanged}/>}
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
                <PipelineStageCreateWithQuery tasks={this.props.tasks} projects={this.props.projects}
                                              pipelinesForProjectId={this.props.pipelinesForProjectId}
                                              refetch={this.props.refetch}
                                              onPipelinesForProjectIdChanged={this.props.onPipelinesForProjectIdChanged}/>
            </div>
        );
    }
}