import * as React from "react";
import {Panel} from "react-bootstrap"

import {TaskDefinitionsTable} from "./TaskDefinitionTable";
import {TaskStartComponent} from "./TaskStartComponent";
import {Loading} from "./Loading";

export class TaskDefinitions extends React.Component<any, any> {
    onStartTask = (taskDefinitionId: string, scriptArgs: string[]) =>  {
        this.props.startTaskMutation(taskDefinitionId, scriptArgs)
        .then(() => {
            //this.props.data.refetch();
        }).catch((error) => {
            console.log("there was an error sending the query", error);
        });
    };

    render() {
        return (
            <div>
                {this.props.loading ? <Loading/> : <TablePanel taskDefinitions={this.props.tasks} startTask={this.onStartTask}/>}
            </div>
        );
    }
}

class TablePanel extends React.Component<any, any> {
    render() {
        return (
            <div>
                <Panel collapsible defaultExpanded header="Task Definitions" bsStyle="primary">
                    <TaskDefinitionsTable taskDefinitions={this.props.taskDefinitions}/>
                </Panel>
                <TaskStartComponent taskDefinitions={this.props.taskDefinitions} startTask={this.props.startTask}/>
            </div>
        );
    }
}