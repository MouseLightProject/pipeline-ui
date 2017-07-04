import * as React from "react";
import {Table, Glyphicon, Button} from "react-bootstrap"
import * as moment from "moment";

import {IWorker} from "./models/QueryInterfaces";
import gql from "graphql-tag";
import {graphql} from "react-apollo";

enum PipelineWorkerStatus {
    Unavailable = 0,
    Connected,
    Idle,
    Processing
}
interface IWorkerRowProps {
    worker: IWorker;

    setWorkerAvailability(id: string, shouldBeInSchedulerPool: boolean);
}

class WorkerRow extends React.Component<IWorkerRowProps, any> {
    private onActiveClick() {
        this.props.setWorkerAvailability(this.props.worker.id, !this.props.worker.is_in_scheduler_pool);
    }

    private getActivateText = isInSchedulerPool => isInSchedulerPool ? "Remove" : "Add";

    private getActivateGlyph = isInSchedulerPool => isInSchedulerPool ? "stop" : "play";

    private getActivateStyle = isInSchedulerPool => isInSchedulerPool ? "warning" : "success";

    public render() {
        let worker = this.props.worker;

        const last_seen_moment = moment(new Date(parseInt(worker.last_seen))).fromNow();

        let status = PipelineWorkerStatus[worker.status];

        if (worker.status === PipelineWorkerStatus.Processing) {
            status = status + ` (${worker.task_load.toFixed(1)} / ${worker.work_unit_capacity.toFixed(1)})`;
        } else if (worker.status === PipelineWorkerStatus.Idle) {
            status = status + ` (${worker.task_load.toFixed(1)} / ${worker.work_unit_capacity.toFixed(1)})`;
        }

        return (
            <tr>
                <td>
                    <Button bsSize="xs" bsStyle={this.getActivateStyle(worker.is_in_scheduler_pool)}
                            onClick={() => this.onActiveClick()}><Glyphicon
                        glyph={this.getActivateGlyph(worker.is_in_scheduler_pool)}/> {this.getActivateText(worker.is_in_scheduler_pool)}
                    </Button></td>
                <td>{worker.name}</td>
                <td>{worker.machine_id.slice(0, 8)}</td>
                <td>{last_seen_moment}</td>
                <td>{status}</td>
                <td>{worker.is_cluster_proxy ? "Yes" : "No"}</td>
            </tr>);
    }
}

const SetWorkerInPoolMutation = gql`
  mutation SetPipelineStageStatusMutation($id: String!, $shouldBeInSchedulerPool: Boolean!) {
    setWorkerAvailability(id:$id, shouldBeInSchedulerPool:$shouldBeInSchedulerPool) {
      id
      is_in_scheduler_pool
    }
  }
`;

interface IWorkerTableProps {
    workers: IWorker[];

    setWorkerAvailability?(id: string, shouldBeInSchedulerPool: boolean);
}

@graphql(SetWorkerInPoolMutation, {
    props: ({mutate}) => ({
        setWorkerAvailability: (id: string, shouldBeInSchedulerPool: boolean) => mutate({
            variables: {
                id: id,
                shouldBeInSchedulerPool: shouldBeInSchedulerPool
            }
        })
    })
})
export class WorkerTable extends React.Component<IWorkerTableProps, any> {
    public setWorkerAvailability(id: string, shouldBeInSchedulerPool: boolean) {
        this.props.setWorkerAvailability(id, shouldBeInSchedulerPool).then(() => {
        }).catch(err => {
            console.log(err);
        });
    }

    public render() {
        let rows = [];

        if (this.props.workers) {
            rows = this.props.workers.map(worker => (<WorkerRow key={"tr_worker" + worker.id} worker={worker}
                                                                setWorkerAvailability={(id: string, shouldBeInSchedulerPool: boolean) => this.setWorkerAvailability(id, shouldBeInSchedulerPool)}/>));
        }

        return (
            <Table condensed>
                <thead>
                <tr>
                    <th>Scheduler Pool</th>
                    <th>Name</th>
                    <th>Machine Id</th>
                    <th>Last Seen</th>
                    <th>Status (Load/Capacity)</th>
                    <th>Cluster Proxy</th>
                </tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </Table>
        );
    }
}
