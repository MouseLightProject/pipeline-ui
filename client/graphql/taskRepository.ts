import gql from "graphql-tag";

export const TaskRepositoryFragment = gql`fragment TaskRepositoryFields on TaskRepository {
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
    updated_at
    created_at
}`;

export const CreateTaskRepositoryMutation = gql`mutation CreateTaskRepository($taskRepository: TaskRepositoryInput) {
    createTaskRepository(taskRepository: $taskRepository) {
        taskRepository {
            ...TaskRepositoryFields
        }   
        error
    }
}
${TaskRepositoryFragment}
`;

export const UpdateTaskRepositoryMutation = gql`mutation UpdateTaskRepository($taskRepository: TaskRepositoryInput) {
    updateTaskRepository(taskRepository: $taskRepository) {
        taskRepository {
            ...TaskRepositoryFields
        }   
        error
    }
}
${TaskRepositoryFragment}
`;

export const DeleteTaskRepositoryMutation = gql`mutation DeleteTaskRepository($id: String!) {
    deleteTaskRepository(id: $id) {
        id
        error
    }
}`;
