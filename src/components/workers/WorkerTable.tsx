import * as React from "react";
import {Table, Glyphicon, Button} from "react-bootstrap"
import FontAwesome = require("react-fontawesome");
import {toast} from "react-toastify";
import * as moment from "moment";

import {graphql} from "react-apollo";
import {IWorker, PipelineWorkerStatus} from "../../models/worker";
import {SetWorkerInPoolMutation, UpdateWorkerMutation} from "../../graphql/workers";
import {tableButtonStyles} from "../../util/styleDefinitions";
import {DialogMode} from "../helpers/DialogUtils";
import {EditWorkerDialog} from "./EditWorkerDialog";
import {toastUpdateError, toastUpdateSuccess} from "ndb-react-components";

interface IWorkerRowProps {
    worker: IWorker;

    setWorkerAvailability(id: string, shouldBeInSchedulerPool: boolean);
    updateWorker?(worker: IWorker): any;
}

interface IWorkerRowState {
    isUpdateDialogShown?: boolean;
}

@graphql(UpdateWorkerMutation, {
    props: ({mutate}) => ({
        updateWorker: (worker: IWorker) => mutate({
            variables: {worker}
        })
    })
})
class WorkerRow extends React.Component<IWorkerRowProps, IWorkerRowState> {
    public constructor(props: IWorkerRowProps) {
        super(props);

        this.state = {
            isUpdateDialogShown: false
        }
    }

    private onClickUpdateWorker(evt: any) {
        evt.stopPropagation();

        this.setState({isUpdateDialogShown: true});
    }

    private onActiveClick() {
        this.props.setWorkerAvailability(this.props.worker.id, !this.props.worker.is_in_scheduler_pool);
    }

    private getActivateText = isInSchedulerPool => isInSchedulerPool ? "Remove" : "Add";

    private getActivateGlyph = isInSchedulerPool => isInSchedulerPool ? "stop" : "play";

    private getActivateStyle = isInSchedulerPool => isInSchedulerPool ? "warning" : "success";

    private async onAcceptUpdateWorker(worker: IWorker, showSuccessToast: boolean = true) {
        this.setState({isUpdateDialogShown: false});

        try {
            const result = await this.props.updateWorker(worker);

            if (!result.data.updateWorker.worker) {
                toast.error(toastUpdateError(result.data.updateWorker.error), {autoClose: false});
            } else if (showSuccessToast) {
                toast.success(toastUpdateSuccess(), {autoClose: 3000});
            }
        } catch (error) {
            toast.error(toastUpdateError(error), {autoClose: false});
        }
    }

    private renderUpdateWorkerDialog() {
        if (this.state.isUpdateDialogShown) {
            return (
                <EditWorkerDialog show={this.state.isUpdateDialogShown}
                                  mode={DialogMode.Update}
                                  sourceWorker={this.props.worker}
                                  onCancel={() => this.setState({isUpdateDialogShown: false})}
                                  onAccept={(w: IWorker) => this.onAcceptUpdateWorker(w)}/>
            );
        } else {
            return null;
        }
    }

    public render() {
        let worker = this.props.worker;

        const last_seen_moment = moment(new Date(worker.last_seen)).fromNow();

        let status = PipelineWorkerStatus[worker.status];

        if (worker.status === PipelineWorkerStatus.Processing) {
            status = status + ` (${worker.task_load.toFixed(1)} / ${worker.work_unit_capacity.toFixed(1)})`;
        } else if (worker.status === PipelineWorkerStatus.Idle) {
            status = status + ` (${worker.task_load.toFixed(1)} / ${worker.work_unit_capacity.toFixed(1)})`;
        }

        return (
            <tr>
                {this.renderUpdateWorkerDialog()}
                <td>
                    <Button bsSize="xs" bsStyle={this.getActivateStyle(worker.is_in_scheduler_pool)}
                            onClick={() => this.onActiveClick()}>
                        <Glyphicon glyph={this.getActivateGlyph(worker.is_in_scheduler_pool)}/>
                        &nbsp;{this.getActivateText(worker.is_in_scheduler_pool)}
                    </Button></td>
                <td>{worker.name}</td>
                <td>{worker.machine_id.slice(0, 8)}</td>
                <td>{last_seen_moment}</td>
                <td>
                    {status}
                    <Button bsSize="xs" bsStyle="info" style={tableButtonStyles.editSmall}
                            onClick={(evt) => this.onClickUpdateWorker(evt)}
                            disabled={worker.status === PipelineWorkerStatus.Unavailable}>
                         <Glyphicon glyph="pencil"/>
                        </Button>
                </td>
                <td>{worker.is_cluster_proxy ? "Yes" : "No"}</td>
            </tr>);
    }
}

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
            rows = this.props.workers.map(worker => (
                <WorkerRow key={"tr_worker" + worker.id} worker={worker}
                           setWorkerAvailability={(id: string, b: boolean) => this.setWorkerAvailability(id, b)}/>)
            );
        }

        return (
            <Table condensed style={{marginBottom: "0"}}>
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
