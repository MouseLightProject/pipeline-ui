import * as React from "react";
import gql from "graphql-tag";
import {graphql, InjectedGraphQLProps} from "react-apollo";

import {Loading} from "../../Loading";
import {TaskRepositoryPanel} from "./repository/TaskRepositoryPanel";
import {ITaskRepository} from "../../models/taskRepository";
import {TaskDefinitionsPanel} from "./definitions/TaskDefinitionsPanel";
import {ITaskDefinition} from "../../models/taskDefinition";
import {contentStyles} from "../../util/styleDefinitions";

const styles = contentStyles;

const TaskQuery = gql`query {
  taskRepositories {
    id
    name
    description
    location
    task_definitions {
      id
      name
      description
      pipeline_stages {
        id
        name
      }
    }
  }
  taskDefinitions {
    id
    name
    description
    script
    interpreter
    work_units
    args
    script_status
    task_repository {
      id
      name
      description
      location
    }
    pipeline_stages {
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
    public render() {
        const loading = !this.props.data || this.props.data.loading;

        if (loading) {
            return (<Loading/>);
        }

        if (this.props.data.error) {
            return (<span>{this.props.data.error}</span>);
        }

        return (
            <div style={styles.body}>
                <TaskRepositoryPanel taskRepositories={this.props.data.taskRepositories}/>
                <TaskDefinitionsPanel taskDefinitions={this.props.data.taskDefinitions}
                                      taskRepositories={this.props.data.taskRepositories}/>
            </div>
        );
    }
}
