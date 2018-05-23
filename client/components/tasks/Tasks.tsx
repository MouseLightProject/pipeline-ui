import * as React from "react";
import {Container} from "semantic-ui-react";

import {TaskRepositoryPanel} from "./repository/TaskRepositoryPanel";
import {ITaskRepository} from "../../models/taskRepository";
import {TaskDefinitionsPanel} from "./definitions/TaskDefinitionsPanel";
import {ITaskDefinition} from "../../models/taskDefinition";

interface ITaskDefinitionPanelProps {
    taskDefinitions: ITaskDefinition[];
    taskRepositories: ITaskRepository[];
    pipelineVolume: string;
}

export const TasksPanel = (props: ITaskDefinitionPanelProps) => (
    <Container fluid style={{display: "flex", flexDirection: "column"}}>
        <TaskRepositoryPanel taskRepositories={props.taskRepositories}
                             pipelineVolume={props.pipelineVolume}/>
        <TaskDefinitionsPanel taskDefinitions={props.taskDefinitions}
                              taskRepositories={props.taskRepositories}/>
    </Container>
);
