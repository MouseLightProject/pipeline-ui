import {ITaskRepository} from "./taskRepository";
import {IPipelineStage} from "./pipelineStage";

export enum TaskArgumentType {
    Literal = 0,
    Parameter = 1
}

export interface ITaskArgument {
    value: string;
    type: TaskArgumentType;
}

export interface ITaskArguments {
    arguments: ITaskArgument[];
}

export interface IUITaskArgument extends ITaskArgument {
    nonce: string;
}

export interface IUITaskArguments {
    arguments: IUITaskArgument[];
}

export interface ITaskDefinition {
    id?: string;
    name?: string;
    script?: string;
    interpreter?: string;
    description?: string;
    script_args?: string;
    cluster_args?: string;
    expected_exit_code?: number;
    local_work_units?: number;
    cluster_work_units?: number;
    log_prefix?: string;
    script_status?: boolean;
    task_repository?: ITaskRepository;
    pipeline_stages?: IPipelineStage[];
}

export function taskDisplayRepository(task: ITaskDefinition) {
    if (!task.task_repository) {
        return "(none)";
    }

    return task.task_repository.name;
}