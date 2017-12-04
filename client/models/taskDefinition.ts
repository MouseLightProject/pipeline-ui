import {ITaskRepository} from "./taskRepository";
import {IPipelineStage} from "./pipelineStage";

export interface ITaskDefinition {
    id?: string;
    name?: string;
    script?: string;
    interpreter?: string;
    description?: string;
    script_args?: string;
    cluster_args?: string;
    expected_exit_code?: number;
    work_units?: number;
    cluster_work_units?: number;
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