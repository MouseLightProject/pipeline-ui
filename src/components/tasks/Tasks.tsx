import * as React from "react";
import {Panel} from "react-bootstrap"
import gql from "graphql-tag";
import {graphql, InjectedGraphQLProps} from "react-apollo";

import {ITaskDefinition} from "../../models/QueryInterfaces";
import {Loading} from "../../Loading";
import {TaskDefinitionsTable} from "./TaskDefinitionTable";
import {TaskDefinitionHelp} from "./TasksHelp";
import {TaskRepositoryPanel} from "./TaskRepositoryPanel";
import {ITaskRepository} from "../../models/taskRepository";

const TaskQuery = gql`query {
  taskRepositories {
    id
    name
    description
    location
    taskDefinitions {
      id
      name
      description
    }
  }
  taskDefinitions {
    id
    name
    description
    script
    interpreter
    taskRepository {
      id
      name
    }
  }
}`;

interface ITaskQueryProps {
    taskDefinitions: ITaskDefinition[];
    taskRepositories: ITaskRepository[];
}

interface ITaskDefinitionPanelProps extends InjectedGraphQLProps<ITaskQueryProps> {
}

interface ITaskDefinitionPanelState {
}

@graphql(TaskQuery, {
    options: {
        pollInterval: 5 * 1000
    }
})
export class TasksPanel extends React.Component<ITaskDefinitionPanelProps, ITaskDefinitionPanelState> {
    render() {
        const loading = !this.props.data || this.props.data.loading;

        if (loading) {
            return (<Loading/>);
        }

        if (this.props.data.error) {
            return (<span>{this.props.data.error}</span>);
        }

        return (
            <div style={styles.content}>
                <TaskRepositoryPanel taskRepositories={this.props.data.taskRepositories}/>
                <Panel collapsible defaultExpanded header="Task Definitions" bsStyle="primary">
                    <TaskDefinitionsTable taskDefinitions={this.props.data.taskDefinitions }/>
                </Panel>
                <Panel collapsible defaultExpanded={false} header="Help" bsStyle="info">
                    <TaskDefinitionHelp/>
                </Panel>
            </div>
        );
    }
}

const styles = {
    content: {
        padding: "10px"
    }
};
