import * as React from "react";
import gql from "graphql-tag";
import {graphql, InjectedGraphQLProps} from "react-apollo";

import {ITaskDefinition} from "../../models/QueryInterfaces";
import {Loading} from "../../Loading";
import {TaskRepositoryPanel} from "./TaskRepositoryPanel";
import {ITaskRepository} from "../../models/taskRepository";
import {TaskDefinitionsPanel} from "./TaskDefinitionsPanel";
import {TasksHelpPanel} from "./TasksHelpPanel";

const styles = {
    content: {
        padding: "10px"
    }
};

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
    public render() {
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
                <TaskDefinitionsPanel taskDefinitions={this.props.data.taskDefinitions}/>
                <TasksHelpPanel/>
            </div>
        );
    }
}
