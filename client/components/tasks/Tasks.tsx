import * as React from "react";
import {graphql} from "react-apollo";
import {Container, Loader} from "semantic-ui-react";

import {TaskRepositoryPanel} from "./repository/TaskRepositoryPanel";
import {ITaskRepository} from "../../models/taskRepository";
import {TaskDefinitionsPanel} from "./definitions/TaskDefinitionsPanel";
import {ITaskDefinition} from "../../models/taskDefinition";
import {TaskQuery} from "../../graphql/taskDefinition";

interface ITaskQueryProps {
    taskDefinitions: ITaskDefinition[];
    taskRepositories: ITaskRepository[];
    pipelineVolume: string;
}

interface ITaskDefinitionPanelProps {
    data?: any
}

interface ITaskDefinitionPanelState {
}

class _TasksPanel extends React.Component<ITaskDefinitionPanelProps, ITaskDefinitionPanelState> {
    public render() {
        const isLoading = !this.props.data || this.props.data.loading;

        if (isLoading) {
            return (
                <div style={{display: "flex", height: "100%", alignItems: "center"}}>
                    <Loader active inline="centered">Loading</Loader>
                </div>
            );
        }

        if (this.props.data.error) {
            return (<span>{this.props.data.error}</span>);
        }

        return (
            <Container fluid style={{display: "flex", flexDirection: "column"}}>
                <TaskRepositoryPanel taskRepositories={this.props.data.taskRepositories}
                                     pipelineVolume={this.props.data.pipelineVolume}/>
                <TaskDefinitionsPanel taskDefinitions={this.props.data.taskDefinitions}
                                      taskRepositories={this.props.data.taskRepositories}/>
            </Container>
        );
    }
}

export const TasksPanel = graphql<ITaskDefinitionPanelProps, ITaskDefinitionPanelState>(TaskQuery, {
    options: {
        pollInterval: 5 * 1000
    }
})(_TasksPanel);
