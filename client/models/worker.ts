export enum PipelineWorkerStatus {
    Unavailable = 0,
    Connected,
    Idle,
    Processing
}

export interface IWorker {
    id?: string;
    name?: string;
    description?: string;
    worker_id?: string;
    local_work_capacity?: number;
    cluster_work_capacity?: number;
    last_seen?: number;
    local_task_load?: number;
    cluster_task_load?: number;
    status?: PipelineWorkerStatus;
    is_in_scheduler_pool?: boolean;
}
