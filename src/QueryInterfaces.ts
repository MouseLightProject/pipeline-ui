export enum TilePipelineStatus {
    DoesNotExist = 0,
    Waiting = 1,
    Queued = 2,
    Processing = 3,
    Complete = 4,
    Failed = 5
}
export interface ITaskDefinition {
    id: string;
    name: string;
    script: string;
    interpreter: string;
    description: string;
}

export interface IPipelinePerformance {
    id: string;
    pipeline_stage_id: string;
    num_in_process: number;
    num_ready_to_process: number;
    num_execute: number;
    num_complete: number;
    num_error: number;
    num_cancel: number;
    cpu_average: number;
    cpu_high: number;
    cpu_low: number;
    memory_average: number;
    memory_high: number;
    memory_low: number;
    duration_average: number;
    duration_high: number;
    duration_low: number;
}

export interface IPipelineStage {
    id: string;
    name: string;
    description: string;
    project_id: string;
    task: ITaskDefinition;
    performance: IPipelinePerformance;
    previous_stage_id: string;
    dst_path: string;
    depth: number;
    is_processing: boolean;
    function_type: number;
}

export interface IProject {
    id: string;
    name: string;
    description: string;
    root_path: string;
    sample_number: number,
    sample_x_min: number;
    sample_x_max: number;
    sample_y_min: number;
    sample_y_max: number;
    sample_z_min: number;
    sample_z_max: number;
    region_x_min: number;
    region_x_max: number;
    region_y_min: number;
    region_y_max: number;
    region_z_min: number;
    region_z_max: number;
    is_processing: boolean;
    stages: IPipelineStage[];
}

export interface IWorker {
    id: string;
    name: string;
    description: string;
    machine_id: string;
    work_unit_capacity: number;
    last_seen: string;
    task_load: number;
    status: number;
}
