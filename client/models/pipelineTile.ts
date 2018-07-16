import {TilePipelineStatus} from "./tilePipelineStatus";

export interface IPipelineTile {
    relative_path?: string;
    tile_name?: string;
    prev_stage_status?: TilePipelineStatus;
    this_stage_status?: TilePipelineStatus;
    x?: number;
    y?: number;
    z?: number;
    lat_x?: number;
    lat_y?: number;
    lat_z?: number;
    cut_offset?: number;
    z_offset?: number;
    delta_z?: number;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
}
