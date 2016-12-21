import * as React from "react";
import {Table, Button, Glyphicon} from "react-bootstrap"

import {IPipelineStage} from "./QueryInterfaces";

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
        this.props.updateStatusCallback(this.props.pipelineStage.id, !this.props.pipelineStage.is_active);
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
                <td><Button bsSize="xs" bsStyle={this.getActivateStyle(pipelineStage.is_active)} onClick={this.onActiveClick}><Glyphicon glyph={this.getActivateGlyph(pipelineStage.is_active)} /> {this.getActivateText(pipelineStage.is_active)}</Button></td>
                <td>{pipelineStage.id.slice(0, 8)}</td>
                <td>{pipelineStage.project_id.slice(0, 8)}</td>
                <td>{pipelineStage.task.id.slice(0, 8)}</td>
                <td>{pipelineStage.previous_stage_id ? pipelineStage.previous_stage_id.slice(0, 8) : previousStageIsAcquisitionRoot}</td>
                <td>{pipelineStage.dst_path}</td>
                <td>{this.formatPerformance(pipelineStage.performance)}</td>
                <td><Button bsSize="xs" bsStyle="warning" onClick={this.onDelete}><Glyphicon glyph="trash" /> Remove</Button></td>
            </tr>);
    }
}

interface IPipelineStageTable {
    pipelineStages: IPipelineStage[];

    updateStatusCallback(id: string, shouldBeActive: boolean): void;
    deleteCallback(id: string): void;
}

export class PipelineStageTable extends React.Component<IPipelineStageTable, any> {
    render() {
        let rows = this.props.pipelineStages.map(pipelineStage => (
            <PipelineStageRow key={"tr_pipeline" + pipelineStage.id} pipelineStage={pipelineStage} updateStatusCallback={this.props.updateStatusCallback}
                              deleteCallback={this.props.deleteCallback}/>));
        return (
            <Table condensed>
                <thead>
                <tr>
                    <th>Active</th>
                    <th>ID</th>
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
