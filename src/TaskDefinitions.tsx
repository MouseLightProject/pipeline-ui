import * as React from "react";
import {Panel} from "react-bootstrap"

import {TaskDefinitionsTable} from "./TaskDefinitionTable";
import {StartTaskComponent} from "./StartTaskContainer";
import {Loading} from "./Loading";

export class TaskDefinitions extends React.Component<any, any> {
    render() {
        let taskDefinitions = [];

        if (this.props.data && this.props.data.taskDefinitions) {
            taskDefinitions = this.props.data.taskDefinitions;
        }

        return (
            <div>
                {this.props.data.loading ? <Loading/> : <TablePanel taskDefinitions={taskDefinitions}/>}
            </div>
        );
    }
}

class TablePanel extends React.Component<any, any> {
    render() {
        return (
            <div>
                <Panel collapsible defaultExpanded header="Task Definitions">
                    <TaskDefinitionsTable taskDefinitions={this.props.taskDefinitions}/>
                </Panel>
                <StartTaskComponent taskDefinitions={this.props.taskDefinitions}/>
            </div>
        );
    }
}