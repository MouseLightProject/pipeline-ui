import {ITaskDefinition} from "./taskDefinition";
import {IPipelineStage} from "./pipelineStage";

export enum ExecutionStatusCode {
    Undefined = 0,
    Initializing = 1,
    Running = 2,
    Orphaned = 3,   // Was marked initialized/running but can not longer find in process manager list
    Complete = 4
}

export enum CompletionStatusCode {
    Unknown = 0,
    Incomplete = 1,
    Cancel = 2,
    Success = 3,
    Error = 4,
    Resubmitted = 5
}

export enum ExecutionStatus {
    Undefined = -1,
    Unknown = 0,
    Started = 1,
    Online = 2,
    Restarted = 3,
    RestartOverLimit = 4,
    Stopping = 5,
    Stopped = 6,
    Exited = 7,
    Deleted = 8
}

export interface ITaskExecution {
    id: string;
    worker_id: string;
    tile_id: string;
    task_definition_id: string;
    task: ITaskDefinition;
    pipeline_stage_id: string;
    pipeline_stage: IPipelineStage;
    work_units: number;
    resolved_script: string;
    resolved_interpreter: string;
    resolved_args: string;
    last_process_status_code: number;
    completion_status_code: number;
    execution_status_code: number;
    exit_code: number;
    max_cpu: number;
    max_memory: number;
    started_at: number;
    completed_at: number;
}