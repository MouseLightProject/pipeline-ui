import * as React from "react";
import {Table} from "react-bootstrap"

import {ITaskDefinition} from "./QueryInterfaces";

interface ITaskDefinitionRowProps {
    taskDefinition: ITaskDefinition;
}

class TaskDefinitionRow extends React.Component<ITaskDefinitionRowProps, any> {
    render() {
        let taskDefinition = this.props.taskDefinition;

        return (
            <tr>
                <td>{taskDefinition.id.slice(0, 8)}</td>
                <td>{taskDefinition.name}</td>
                <td>{taskDefinition.script}</td>
                <td>{taskDefinition.interpreter}</td>
                <td>{taskDefinition.description}</td>
            </tr>);
    }
}

interface ITaskDefinitionsTable {
    taskDefinitions: ITaskDefinition[];
}

export class TaskDefinitionsTable extends React.Component<ITaskDefinitionsTable, any> {
    render() {
        let rows = this.props.taskDefinitions.map(taskDefinition => (
            <TaskDefinitionRow key={"tr_task" + taskDefinition.id}
                               taskDefinition={taskDefinition}/>));

        return (
            <Table condensed>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Script</th>
                    <th>Interpreter</th>
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
