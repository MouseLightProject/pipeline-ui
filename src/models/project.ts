import {IPipelineStage} from "./pipelineStage";

export interface IProject {
    id?: string;
    name?: string;
    description?: string;
    root_path?: string;
    dashboard_json_status?: boolean;
    sample_number?: number;
    sample_x_min?: number;
    sample_x_max?: number;
    sample_y_min?: number;
    sample_y_max?: number;
    sample_z_min?: number;
    sample_z_max?: number;
    region_x_min?: number;
    region_x_max?: number;
    region_y_min?: number;
    region_y_max?: number;
    region_z_min?: number;
    region_z_max?: number;
    is_processing?: boolean;
    stages?: IPipelineStage[];
}

export interface IProjectGridRegion {
    x_min: number;
    x_max: number;
    y_min: number;
    y_max: number;
    z_min: number;
    z_max: number;
}

export interface IProjectInput {
    id?: string;
    name?: string;
    description?: string;
    root_path?: string;
    sample_number?: number;
    is_processing?: boolean;
    region_bounds?: IProjectGridRegion;
}


