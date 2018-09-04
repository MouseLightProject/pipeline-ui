import moment = require("moment");
import {IWorker} from "./worker";

export enum QueueType {
    Local = 0,
    Cluster = 1
}

export enum ExecutionStatus {
    Undefined = 0,
    Initializing = 1,
    Running = 2,
    Zombie = 3,   // Was marked initialized/running but can no longer find in process manager list/cluster jobs
    Orphaned = 4, // Found in process manager with metadata that associates to worker, but no linked task in database
    Completed = 5
}

export enum CompletionResult {
    Unknown = 0,
    Incomplete = 1,
    Cancel = 2,
    Success = 3,
    Error = 4,
    Resubmitted = 5
}

export interface ITaskExecution {
    id?: string;
    task_definition_id?: string;
    resolved_script?: string;
    resolved_script_args?: string;
    resolved_cluster_args?: string;
    resolved_log_path?: string;
    worker_id?: string;
    queue_type?: QueueType;
    job_id?: number;
    job_name?: string;
    execution_status_code?: ExecutionStatus;
    completion_status_code?: CompletionResult;
    last_process_status_code?: number;
    cpu_time_seconds?: number;
    max_cpu_percent?: number
    max_memory_mb?: number;
    exit_code?: number;
    submitted_at?: Date;
    started_at?: Date;
    completed_at?: Date;
}

export class TaskExecution {
    public readonly id: string;
    public readonly worker_id: string;
    public readonly queue_type: QueueType;
    public readonly task_definition_id: string;
    public readonly resolved_script: string;
    public readonly resolved_script_args: string;
    public readonly resolved_cluster_args: string;
    public readonly resolved_log_path: string;
    public readonly job_id: number;
    public readonly job_name: string;
    public readonly execution_status_code: ExecutionStatus;
    public readonly completion_status_code: CompletionResult;
    public readonly last_process_status_code: number;
    public readonly cpu_time_seconds: number;
    public readonly max_cpu_percent: number
    public readonly max_memory_mb: number;
    public readonly exit_code: number;
    public readonly submitted_at: Date;
    public readonly started_at: Date;
    public readonly completed_at: Date;

    public constructor(t: TaskExecution = null) {
        if (t !== null && t !== undefined) {
            this.id = t.id;
            this.worker_id = t.worker_id;
            this.task_definition_id = t.task_definition_id;
            this.queue_type = t.queue_type;
            this.resolved_script = t.resolved_script;
            this.resolved_script_args = t.resolved_script_args;
            this.resolved_cluster_args = t.resolved_cluster_args;
            this.resolved_log_path = t.resolved_log_path;
            this.job_id = t.job_id;
            this.job_name = t.job_name;
            this.execution_status_code = t.execution_status_code;
            this.completion_status_code = t.completion_status_code;
            this.last_process_status_code = t.last_process_status_code;
            this.cpu_time_seconds = t.cpu_time_seconds;
            this.max_cpu_percent = t.max_cpu_percent;
            this.max_memory_mb = t.max_memory_mb;
            this.exit_code = t.exit_code;
            this.submitted_at = t.submitted_at;
            this.started_at = t.started_at;
            this.completed_at = t.completed_at;
        }
    }

    public get IsComplete(): boolean {
        return this.execution_status_code === ExecutionStatus.Completed;
    }

    public summarize(worker: IWorker = null) {
        const location = this.queue_type === QueueType.Local ? " locally" : " in the cluster";

        const workerName = worker ? ` on ${worker.name}` : "";

        let action = "";

        let duration = "";


        switch (this.execution_status_code) {
            case ExecutionStatus.Initializing:
                action = "Initializing for";
                break;
            case ExecutionStatus.Running:
                action = "Running for";
                break;
            case ExecutionStatus.Orphaned:
                action = "Orphaned for";
                break;
            case ExecutionStatus.Zombie:
                action = "Zombied for";
                break;
            case ExecutionStatus.Completed:
                switch (this.completion_status_code) {
                    case CompletionResult.Cancel:
                        action = "Canceled after";
                        break;
                    case CompletionResult.Error:
                        action = "Failed after";
                        break;
                    case CompletionResult.Success:
                        action = "Finished in";
                        break;
                }
                break;
        }

        if (this.submitted_at || this.started_at) {
            const end = this.completed_at ? this.completed_at.valueOf() : Date.now();
            if (this.started_at) {
                duration = moment.duration(end - this.started_at.valueOf()).humanize();
            } else {
                duration = moment.duration(end - this.started_at.valueOf()).humanize();
                action = "Pending for";
            }
        }

        return `${action} ${duration} ${workerName} running ${location}`;
    }
}