import * as React from "react";
import {Table} from "react-bootstrap"

import {ITaskExecution} from "../../../models/taskExecution";
import {TaskExecutionRow} from "./TaskExecutionRow";

interface IExecutedTasksTableProps {
    executedTasks: ITaskExecution[];
}

interface IExecutedTasksTableState {
}

export class TaskExecutionsTable extends React.Component<IExecutedTasksTableProps, IExecutedTasksTableState> {
    render() {
        let rows = this.props.executedTasks.map(executedTask => {
               return (<TaskExecutionRow key={"tr_" + executedTask.id} taskExecution={executedTask}/>);
        });

        return (
            <div>
                <Table striped condensed>
                    <thead>
                    <tr>
                        <th>Tile</th>
                        <th>Status</th>
                        <th>PM Status</th>
                        <th>Exit Result (Code)</th>
                        <th>Duration</th>
                        <th className="text-right">Max<br/> CPU | Memory</th>
                        <th className="text-center">Work Units</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows}
                    </tbody>
                </Table>
            </div>
        );
    }
}
