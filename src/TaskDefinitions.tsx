import * as React from "react";
import {Panel} from "react-bootstrap"

import {TaskDefinitionsTable} from "./TaskDefinitionTable";
import {Loading} from "./Loading";
import gql from "graphql-tag";
import {graphql} from "react-apollo";

export class TaskDefinitions extends React.Component<any, any> {
    render() {
        return (
            <TaskPanelQuery/>
        );
    }
}

class TaskPanel extends React.Component<any, any> {
    render() {
        const loading = !this.props.data || this.props.data.loading;

        const tasks = !loading ? this.props.data.taskDefinitions : [];

        return (
            <Panel collapsible defaultExpanded header="Task Definitions" bsStyle="primary">
                {loading ? <Loading/> : <TaskDefinitionsTable taskDefinitions={tasks}/>}
            </Panel>
        );
    }
}

const TaskQuery = gql`query { 
    taskDefinitions {
      id
      name
      description
      script
      interpreter
    }
}`;

const TaskPanelQuery = graphql(TaskQuery, {
    options: {
        pollInterval: 5 * 1000
    }
})(TaskPanel);
