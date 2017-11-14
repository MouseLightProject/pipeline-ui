import * as React from "react";
import {Table} from "react-bootstrap";

import {ITaskDefinition} from "../../../models/taskDefinition";
import {TaskDefinitionRow} from "./TaskDefinitionRow";
import {ITaskRepository} from "../../../models/taskRepository";

interface ITaskDefinitionsTableProps {
    style: any;
    taskDefinitions: ITaskDefinition[];
    taskRepositories: ITaskRepository[];
}

interface ITaskDefinitionsTableState {
}

export class TaskDefinitionsTable extends React.Component<ITaskDefinitionsTableProps, ITaskDefinitionsTableState> {
    public render() {
        let rows = [];

        if (this.props.taskDefinitions) {
            const sorted = this.props.taskDefinitions.slice().sort((a, b) => a.name.localeCompare(b.name));

            rows = sorted.map(taskDefinition => (
                <TaskDefinitionRow key={"tr_task" + taskDefinition.id} taskDefinition={taskDefinition} taskRepositories={this.props.taskRepositories}/>));
        }

        return (
            <Table condensed style={{marginBottom: "0"}}>
                <thead>
                <tr>
                    <th style={{width: "30px"}}/>
                    <th>Name</th>
                    <th/>
                    <th>Script</th>
                    <th>Repository</th>
                    <th>Work Units</th>
                    <th/>
                    <th>Arguments</th>
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
