import * as React from "react";
import {graphql, InjectedGraphQLProps} from "react-apollo";

import {Loading} from "../../Loading";
import {TaskRepositoryPanel} from "./repository/TaskRepositoryPanel";
import {ITaskRepository} from "../../models/taskRepository";
import {TaskDefinitionsPanel} from "./definitions/TaskDefinitionsPanel";
import {ITaskDefinition} from "../../models/taskDefinition";
import {contentStyles} from "../../util/styleDefinitions";
import {TaskQuery} from "../../graphql/taskDefinition";

const styles = contentStyles;

interface ITaskQueryProps {
    taskDefinitions: ITaskDefinition[];
    taskRepositories: ITaskRepository[];
    pipelineVolume: string;
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
                <TaskRepositoryPanel taskRepositories={this.props.data.taskRepositories} pipelineVolume={this.props.data.pipelineVolume}/>
                <TaskDefinitionsPanel taskDefinitions={this.props.data.taskDefinitions}
                                      taskRepositories={this.props.data.taskRepositories}/>
            </div>
        );
    }
}
