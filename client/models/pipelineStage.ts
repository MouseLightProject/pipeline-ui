import {ITaskDefinition} from "./taskDefinition";
import {IProject} from "./project";

export interface IPipelineStageTileStatus {
    incomplete: number;
    queued: number;
    processing: number;
    complete: number;
    failed: number;
    canceled: number;
}

export interface IPipelinePerformance {
    id: string;
    pipeline_stage_id: string;
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
    tile_status?: IPipelineStageTileStatus;
    performance?: IPipelinePerformance;
    previous_stage_id?: string;
    previous_stage?: IPipelineStage;
    child_stages?: IPipelineStage[];
    dst_path?: string;
    depth?: number;
    is_processing?: boolean;
    function_type?: number;
}
