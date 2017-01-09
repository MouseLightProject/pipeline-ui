export interface IProject {
    id: string;
    name: string;
    description: string;
    root_path: string;
    sample_number: number,
    region_x_min: number;
    region_x_max: number;
    region_y_min: number;
    region_y_max: number;
    region_z_min: number;
    region_z_max: number;
    is_active: boolean;
}

export interface ITaskDefinition {
    id: string;
    name: string;
    script: string;
    interpreter: string;
    description: string;
}

export interface IPipelineStage {
    id: string;
    name: string;
    description: string;
    project_id: string;
    task: ITaskDefinition;
    previous_stage_id: string;
    dst_path: string;
    is_active: boolean;
    function_type: number;
    performance: any;
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
