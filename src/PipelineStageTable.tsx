import * as React from "react";
import {Table} from "react-bootstrap"

import {IPipelineStage} from "./QueryInterfaces";

interface IPipelineStageRowProps {
    pipelineStage: IPipelineStage;
}

class PipelineStageRow extends React.Component<IPipelineStageRowProps, any> {
    render() {
        let pipelineStage = this.props.pipelineStage;

        return (
            <tr key={"tr_" + pipelineStage.id}>
                <td>{pipelineStage.id.slice(0, 8)}</td>
                <td>{pipelineStage.name}</td>
                <td>{pipelineStage.description}</td>
                <td>{pipelineStage.project_id.slice(0, 8)}</td>
                <td>{pipelineStage.task_id.slice(0, 8)}</td>
                <td>{pipelineStage.src_path}</td>
                <td>{pipelineStage.dst_path}</td>
                <td>{pipelineStage.execution_order}</td>
                <td>{pipelineStage.function_type}</td>
            </tr>);
    }
}

interface IPipelineStageTable {
    pipelineStages: IPipelineStage[];
}

export class PipelineStageTable extends React.Component<IPipelineStageTable, any> {
    render() {
        let rows = this.props.pipelineStages.map(pipelineStage => (<PipelineStageRow pipelineStage={pipelineStage}/>));

        return (
            <Table striped condensed>
                <thead>
                <tr>
                    <td>ID</td>
                    <td>Name</td>
                    <td>Description</td>
                    <td>Project ID</td>
                    <td>Task ID</td>
                    <td>Source Path</td>
                    <td>Destination Path</td>
                    <td>Execution Order</td>
                    <td>Function Type</td>
                </tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </Table>
        );
    }
}
