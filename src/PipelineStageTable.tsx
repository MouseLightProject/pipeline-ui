import * as React from "react";
import {Table, Button, Glyphicon} from "react-bootstrap"

import {IPipelineStage} from "./models/QueryInterfaces";
import {AllProjectsId} from "./components/helpers/ProjectMenu";

const previousStageIsAcquisitionRoot = "(acquisition root)";

interface IPipelineStageRowProps {
    pipelineStage: IPipelineStage;

    updateStatusCallback(id: string, shouldBeActive: boolean): void;
    deleteCallback(id: string): void;
}

class PipelineStageRow extends React.Component<IPipelineStageRowProps, any> {
    onDelete = () => {
        this.props.deleteCallback(this.props.pipelineStage.id);
    };

    onActiveClick = () => {
        this.props.updateStatusCallback(this.props.pipelineStage.id, !this.props.pipelineStage.is_processing);
    };

    formatPerformance = (performance) => {
        if (performance === null) {
            return "";
        }

        return `${performance.num_in_process} | ${performance.num_ready_to_process}`
    };

    getActivateText = isActive => isActive ? "Stop" : "Start";

    getActivateGlyph = isActive => isActive ? "stop" : "play";

    getActivateStyle = isActive => isActive ? "info" : "success";

    render() {
        let pipelineStage = this.props.pipelineStage;

        return (
            <tr>
                <td><Button bsSize="xs" bsStyle={this.getActivateStyle(pipelineStage.is_processing)}
                            onClick={this.onActiveClick}><Glyphicon
                    glyph={this.getActivateGlyph(pipelineStage.is_processing)}/>&nbsp;{this.getActivateText(pipelineStage.is_processing)}
                </Button></td>
                <td>{pipelineStage.name}</td>
                <td>{pipelineStage.project.name}</td>
                <td>{pipelineStage.task.name}</td>
                <td>{pipelineStage.previous_stage ? pipelineStage.previous_stage.name : previousStageIsAcquisitionRoot}</td>
                <td>{pipelineStage.dst_path}</td>
                <td>{this.formatPerformance(pipelineStage.performance)}</td>
                <td><Button bsSize="xs" bsStyle="warning" onClick={this.onDelete}><Glyphicon glyph="trash"/>
                    &nbsp;Remove</Button></td>
            </tr>);
    }
}

interface IPipelineStageTable {
    pipelineStages: IPipelineStage[];
    selectedProjectId: string;

    updateStatusCallback(id: string, shouldBeActive: boolean): void;
    deleteCallback(id: string): void;
}

export class PipelineStageTable extends React.Component<IPipelineStageTable, any> {
    render() {
        let stages = this.props.pipelineStages;

        if (this.props.selectedProjectId !== AllProjectsId) {
            stages = stages.filter((stage) => stage.project.id === this.props.selectedProjectId);
        }

        let rows = stages.map(pipelineStage => (
            <PipelineStageRow key={"tr_pipeline" + pipelineStage.id} pipelineStage={pipelineStage}
                              updateStatusCallback={this.props.updateStatusCallback}
                              deleteCallback={this.props.deleteCallback}/>));

        return (
            <Table condensed>
                <thead>
                <tr>
                    <th>Active</th>
                    <th>Name</th>
                    <th>Project</th>
                    <th>Task</th>
                    <th>Previous Stage</th>
                    <th>Destination Path</th>
                    <th>Queue</th>
                    <th/>
                </tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </Table>
        );
    }
}
