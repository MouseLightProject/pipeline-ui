import * as React from "react";
import {Table} from "react-bootstrap"
import {toast} from "react-toastify";

import {ITaskRepository} from "../../../models/taskRepository";
import {TaskRepositoryRow} from "./TaskRepositoryRow";

interface ITaskRepositoryTableProps {
    style: any;
    taskRepositories: ITaskRepository[];
}

interface ITaskRepositoryTableState {
}

export class TaskRepositoryTable extends React.Component<ITaskRepositoryTableProps, ITaskRepositoryTableState> {
    public render() {
        let rows = [];

        if (this.props.taskRepositories) {
            const sorted = this.props.taskRepositories.slice().sort((a, b) => a.name.localeCompare(b.name));

            rows = sorted.map(taskRepository => (
                <TaskRepositoryRow key={"tr_task" + taskRepository.id} taskRepository={taskRepository}/>));
        }

        return (
            <Table condensed style={{marginBottom: "0"}}>
                <thead>
                <tr>
                    <th style={{width: "30px"}}/>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Description</th>
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
