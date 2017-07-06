import gql from "graphql-tag";

export const CreateTaskDefinitionMutation = gql`mutation CreateTaskDefinition($taskDefinition: TaskDefinitionInput) {
    createTaskDefinition(taskDefinition: $taskDefinition) {
        taskDefinition {
            id
            name
            description
            script
            interpreter
            args
            work_units
            task_repository {
              id
              name
            }
            created_at
            updated_at
        }   
        error
    }
}`;

export const UpdateTaskDefinitionMutation = gql`mutation UpdateTaskDefinition($taskDefinition: TaskDefinitionInput) {
    updateTaskDefinition(taskDefinition: $taskDefinition) {
        taskDefinition {
            id
            name
            description
            script
            interpreter
            args
            work_units
            task_repository {
              id
              name
            }
            created_at
            updated_at
        }   
        error
    }
}`;

export const DeleteTaskDefinitionMutation = gql`mutation DeleteTaskDefinition($taskDefinition: TaskDefinitionInput) {
    deleteTaskDefinition(taskDefinition: $taskDefinition) {
        id
        error
    }
}`;

export const ScriptContentsQuery = gql`query ScriptContents($task_definition_id: String) {
    scriptContents(task_definition_id: $task_definition_id)
}`;