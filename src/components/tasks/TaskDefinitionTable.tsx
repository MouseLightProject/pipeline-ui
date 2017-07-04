import * as React from "react";
import {Table} from "react-bootstrap"

import {ITaskDefinition} from "../../models/QueryInterfaces";

interface ITaskDefinitionRowProps {
    taskDefinition: ITaskDefinition;
}

class TaskDefinitionRow extends React.Component<ITaskDefinitionRowProps, any> {
    render() {
        let taskDefinition = this.props.taskDefinition;

        return (
            <tr>
                <td>{taskDefinition.name}</td>
                <td>{taskDefinition.script}</td>
                <td>{taskDefinition.description}</td>
            </tr>
        );
    }
}

interface ITaskDefinitionsTable {
    taskDefinitions: ITaskDefinition[];
}

export class TaskDefinitionsTable extends React.Component<ITaskDefinitionsTable, any> {
    render() {
        let rows = [];

        if (this.props.taskDefinitions) {
            rows = this.props.taskDefinitions.map(taskDefinition => (
                <TaskDefinitionRow key={"tr_repo" + taskDefinition.id} taskDefinition={taskDefinition}/>));
        }

        return (
            <Table condensed>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Script</th>
                    <th>Description</th>
                </tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </Table>
        );
    }
}
