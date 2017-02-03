import * as React from "react";
import {Table} from "react-bootstrap"
import * as moment from "moment";

import {IWorker} from "./QueryInterfaces";

enum PipelineWorkerStatus {
    Unavailable = 0,
    Connected,
    Idle,
    Processing
}
interface IWorkerRowProps {
    worker: IWorker;
}

class WorkerRow extends React.Component<IWorkerRowProps, any> {
    render() {
        let worker = this.props.worker;

        worker.last_seen = moment(new Date(parseInt(worker.last_seen))).fromNow();

        let status = PipelineWorkerStatus[worker.status];

        if (worker.status === PipelineWorkerStatus.Processing) {
            status = status + ` (${worker.task_load.toFixed(1)} / ${worker.work_unit_capacity.toFixed(1)})`;
        } else if (worker.status === PipelineWorkerStatus.Idle) {
            status = status + ` (${worker.task_load.toFixed(1)} / ${worker.work_unit_capacity.toFixed(1)})`;
        }

        return (
            <tr>
                <td>{worker.name}</td>
                <td>{worker.machine_id.slice(0, 8)}</td>
                <td>{worker.last_seen}</td>
                <td>{status}</td>
            </tr>);
    }
}

interface IWorkerTable {
    workers: IWorker[];
}

export class WorkerTable extends React.Component<IWorkerTable, any> {
    render() {
        let rows = [];

        if (this.props.workers) {
            rows = this.props.workers.map(worker => (<WorkerRow key={"tr_worker" + worker.id} worker={worker}/>));
        }

        return (
            <Table condensed>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Machine Id</th>
                    <th>Last Seen</th>
                    <th>Status (Load)</th>
                </tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </Table>
        );
    }
}
