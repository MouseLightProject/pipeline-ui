import {ITaskDefinition} from "./taskDefinition";
import {IProject} from "./project";

export enum TilePipelineStatus {
    DoesNotExist = 0,
    Waiting = 1,
    Queued = 2,
    Processing = 3,
    Complete = 4,
    Failed = 5
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
    name?: string;
    description?: string;
    project_id?: string;
    project?: IProject
    task_id?: string;
    task?: ITaskDefinition;
    performance?: IPipelinePerformance;
    previous_stage_id?: string;
    previous_stage?: IPipelineStage;
    child_stages?: IPipelineStage[];
    dst_path?: string;
    depth?: number;
    is_processing?: boolean;
    function_type?: number;
}
