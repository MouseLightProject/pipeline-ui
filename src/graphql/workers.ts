import gql from "graphql-tag";

export const WorkerQuery = gql`query { 
    pipelineWorkers {
      id
      name
      machine_id
      work_unit_capacity
      last_seen
      task_load
      status
      is_in_scheduler_pool
      is_cluster_proxy
    }
}`;

export const UpdateWorkerMutation = gql`mutation UpdateWorker($worker: PipelineWorkerInput) {
    updateWorker(worker: $worker) {
        worker {
      id
      name
      machine_id
      work_unit_capacity
      last_seen
      task_load
      status
      is_in_scheduler_pool
      is_cluster_proxy
        }   
        error
    }
}`;

export const SetWorkerInPoolMutation = gql`
  mutation SetPipelineStageStatusMutation($id: String!, $shouldBeInSchedulerPool: Boolean!) {
    setWorkerAvailability(id:$id, shouldBeInSchedulerPool:$shouldBeInSchedulerPool) {
      id
      is_in_scheduler_pool
    }
  }
`;
