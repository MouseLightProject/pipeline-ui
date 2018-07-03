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

export interface IPipelineStage {
    id: string;
    name?: string;
    description?: string;
    project_id?: string;
    project?: IProject
    task_id?: string;
    task?: ITaskDefinition;
    tile_status?: IPipelineStageTileStatus;
    previous_stage_id?: string;
    previous_stage?: IPipelineStage;
    child_stages?: IPipelineStage[];
    dst_path?: string;
    depth?: number;
    is_processing?: boolean;
    function_type?: number;
    created_at?: number;
    updated_at?: number;
}
