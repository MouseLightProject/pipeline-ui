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

        return (
            <tr key={"tr_" + worker.id}>
                <td>{worker.name}</td>
                <td>{worker.description}</td>
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
        let rows = this.props.workers.map(worker => (<WorkerRow worker={worker}/>));

        return (
            <Table striped condensed>
                <thead>
                <tr>
                    <td>Name</td>
                    <td>Description</td>
                    <td>Machine Id</td>
                    <td>Last Seen</td>
                    <td>Status</td>
                </tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </Table>
        );
    }
}
