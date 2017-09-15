import * as React from "react";

import {
    CompletionStatusCode, ExecutionStatus, ExecutionStatusCode,
    ITaskExecution
} from "../../../models/taskExecution";
import moment = require("moment");
import {formatCpuUsage, formatDurationFromHours, formatMemoryFromMB, formatValue} from "../../../util/formatters";

interface ITaskExecutionRowProps {
    taskExecution: ITaskExecution;
}

interface ITaskExecutionRowState {
    isRemoved?: boolean;
}

export class TaskExecutionRow extends React.Component<ITaskExecutionRowProps, ITaskExecutionRowState> {
    public constructor(props: ITaskExecutionRowProps) {
        super(props);

        this.state = {
            isRemoved: false
        }
    }

    public render() {
        if (this.state.isRemoved) {
            return null;
        }

        const taskExecution = this.props.taskExecution;

        let durationText = "N/A";

        if (taskExecution.started_at !== null) {
            let started_at = new Date(taskExecution.started_at);

            let completed_at = new Date();

            if (taskExecution.completed_at !== null) {
                completed_at = new Date(taskExecution.completed_at);
            }

            let completed = moment(completed_at);
            let delta = completed.diff(moment(started_at));
            let duration = moment.duration(delta);

            durationText = formatDurationFromHours(duration.asMilliseconds() / 1000 / 3600);
        }

        let exitCodeText = (taskExecution.completed_at !== null) ? taskExecution.exit_code : "N/A";

        const parts = taskExecution.resolved_args.split(",");

        let relativeTile = "(can't parse)";

        if (parts.length > 4) {
            relativeTile = parts[4];
        }


        return (
            <tr>
                <td>{relativeTile}</td>
                <td>{ExecutionStatusCode[taskExecution.execution_status_code]}</td>
                <td>{ExecutionStatus[taskExecution.last_process_status_code]}</td>
                <td>{`${CompletionStatusCode[taskExecution.completion_status_code]} (${exitCodeText})`}</td>
                <td>{durationText}</td>
                <td className="text-right">{`${formatCpuUsage(taskExecution.max_cpu)} | ${formatMemoryFromMB(taskExecution.max_memory)}`}</td>
                <td className="text-center">{formatValue(taskExecution.work_units, 0)}</td>
            </tr>
        );
    }
}
