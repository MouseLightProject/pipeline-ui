import gql from "graphql-tag";

export const TaskDefinitionFragment = gql`fragment TaskDefinitionFields on TaskDefinition {
    id
    name
    description
    script
    interpreter
    local_work_units
    cluster_work_units
    script_args
    cluster_args
    expected_exit_code
    log_prefix
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
    created_at
    updated_at
}`;

export const CreateTaskDefinitionMutation = gql`mutation CreateTaskDefinition($taskDefinition: TaskDefinitionInput) {
    createTaskDefinition(taskDefinition: $taskDefinition) {
        taskDefinition {
            ...TaskDefinitionFields
        }   
        error
    }
}
${TaskDefinitionFragment}
`;

export const UpdateTaskDefinitionMutation = gql`mutation UpdateTaskDefinition($taskDefinition: TaskDefinitionInput) {
    updateTaskDefinition(taskDefinition: $taskDefinition) {
        taskDefinition {
            ...TaskDefinitionFields
        }   
        error
    }
}
${TaskDefinitionFragment}
`;

export const DuplicateTaskMutation = gql`
  mutation DuplicateTaskMutation($id: String) {
    duplicateTaskDefinition(id: $id) {
        taskDefinition {
            ...TaskDefinitionFields
        }   
        error
    }
  }
${TaskDefinitionFragment}
`;

export const DeleteTaskDefinitionMutation = gql`mutation DeleteTaskDefinition($id: String!) {
    deleteTaskDefinition(id: $id) {
        id
        error
    }
}`;

export const ScriptContentsQuery = gql`query ScriptContents($task_definition_id: String) {
    scriptContents(task_definition_id: $task_definition_id)
}`;