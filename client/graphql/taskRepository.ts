import gql from "graphql-tag";

export const CreateTaskRepositoryMutation = gql`mutation CreateTaskRepository($taskRepository: TaskRepositoryInput) {
    createTaskRepository(taskRepository: $taskRepository) {
        taskRepository {
            id
            name
            location
            description
            updated_at
            created_at
        }   
        error
    }
}`;

export const UpdateTaskRepositoryMutation = gql`mutation UpdateTaskRepository($taskRepository: TaskRepositoryInput) {
    updateTaskRepository(taskRepository: $taskRepository) {
        taskRepository {
            id
            name
            location
            description
            updated_at
            created_at
        }   
        error
    }
}`;

export const DeleteTaskRepositoryMutation = gql`mutation DeleteTaskRepository($taskRepository: TaskRepositoryInput) {
    deleteTaskRepository(taskRepository: $taskRepository) {
        id
        error
    }
}`;
