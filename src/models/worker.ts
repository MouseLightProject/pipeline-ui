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
    machine_id?: string;
    work_unit_capacity?: number;
    last_seen?: number;
    task_load?: number;
    status?: number;
    is_in_scheduler_pool?: boolean;
    is_cluster_proxy?: boolean;
}
