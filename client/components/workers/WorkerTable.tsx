import * as React from "react";
import {Menu, MenuItem, Button} from "semantic-ui-react";
import ReactTable from "react-table";
import {toast} from "react-toastify";
import * as moment from "moment";

import {graphql} from "react-apollo";
import {IWorker, PipelineWorkerStatus} from "../../models/worker";
import {SetWorkerInPoolMutation, UpdateWorkerMutation} from "../../graphql/workers";
import {DialogMode} from "../helpers/DialogUtils";
import {EditWorkerDialog} from "./EditWorkerDialog";
import {toastUpdateError, toastUpdateSuccess} from "ndb-react-components";

/*
interface IWorkerRowProps {
    worker: IWorker;

    setWorkerAvailability(id: string, shouldBeInSchedulerPool: boolean);

    updateWorker?(worker: IWorker): any;
}

interface IWorkerRowState {
    isUpdateDialogShown?: boolean;
}

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
                <td>{worker.worker_id.slice(0, 8)}</td>
                <td>{last_seen_moment}</td>
                <td>
                    {status}
                    <Button bsSize="xs" bsStyle="info"
                            onClick={(evt) => this.onClickUpdateWorker(evt)}
                            disabled={worker.status === PipelineWorkerStatus.Unavailable}>
                        <Glyphicon glyph="pencil"/>
                    </Button>
                </td>
                <td>{worker.is_cluster_proxy ? "Yes" : "No"}</td>
            </tr>);
    }
}
*/
interface IWorkerTableProps {
    style: any;
    workers: IWorker[];

    setWorkerAvailability?(id: string, shouldBeInSchedulerPool: boolean);
    updateWorker?(worker: IWorker): any;
}

interface IWorkerTableState {
    selectedWorker: IWorker;
    isUpdateDialogShown: boolean;
}

class __WorkerTable extends React.Component<IWorkerTableProps, IWorkerTableState> {
    public constructor(props) {
        super(props);

        this.state = {
            selectedWorker: null,
            isUpdateDialogShown: false
        }
    }
    getActivateText = isActive => isActive ? "remove" : "add";

    getActivateGlyph = isActive => isActive ? "minus" : "plus";

    public setWorkerAvailability(id: string, shouldBeInSchedulerPool: boolean) {
        this.props.setWorkerAvailability(id, shouldBeInSchedulerPool).then(() => {
        }).catch(err => {
            console.log(err);
        });
    }

    private onClickUpdateWorker(evt: any) {
        evt.stopPropagation();

        this.setState({isUpdateDialogShown: true});
    }

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

    private renderMenu() {
        const disabled = this.state.selectedWorker === null;

        return (
            <Menu size="mini" style={{borderBottom: "none"}}>
                <EditWorkerDialog element={<MenuItem size="mini" content="Edit" icon="pencil" disabled={disabled}
                                                     onClick={(evt) => this.onClickUpdateWorker(evt)}/>}
                                  show={this.state.isUpdateDialogShown}
                                  mode={DialogMode.Update}
                                  sourceWorker={this.state.selectedWorker}
                                  onCancel={() => this.setState({isUpdateDialogShown: false})}
                                  onAccept={(w: IWorker) => this.onAcceptUpdateWorker(w)}/>
            </Menu>
        );
    }

    public render() {
        const columns = [
            {
                id: "scheduler_pool",
                Header: "Scheduler Pool",
                accessor: w => w,
                width: 150,
                filterable: false,
                Cell: row => {
                    const worker = row.original;
                    const color = row.original.is_in_scheduler_pool ? "orange" : "green";
                    return (
                        <Button size="mini" compact color={color}
                                disabled={worker.status === PipelineWorkerStatus.Unavailable}
                                className="active-button"
                                icon={this.getActivateGlyph(worker.is_in_scheduler_pool)}
                                content={this.getActivateText(worker.is_in_scheduler_pool)}
                                onClick={() => this.setWorkerAvailability(worker.id, !worker.is_in_scheduler_pool)}>
                        </Button>
                    )
                }
            }, {
                Header: "Name",
                accessor: "name",
            }, {
                Header: "Last Seen",
                accessor: "created_at",
                width: 180,
                filterable: false,
                Cell: props => {
                    const last_seen_moment = moment(new Date(props.original.last_seen)).fromNow();

                    return (
                        <div style={{margin: "auto"}}>{last_seen_moment}</div>
                    );
                }
            }, {
                id: "status",
                Header: "Status",
                accessor: w => w,
                width: 180,
                Cell: props => {
                    const worker = props.original;

                    let status = PipelineWorkerStatus[worker.status];

                    if (worker.status === PipelineWorkerStatus.Processing) {
                        status = status + ` (${worker.task_load.toFixed(1)} / ${worker.work_unit_capacity.toFixed(1)})`;
                    } else if (worker.status === PipelineWorkerStatus.Idle) {
                        status = status + ` (${worker.task_load.toFixed(1)} / ${worker.work_unit_capacity.toFixed(1)})`;
                    }

                    return (
                        <div style={{margin: "auto"}}>{status}</div>
                    );
                }
            }, {
                Header: "Cluster Proxy",
                accessor: "is_cluster_proxy",
                width: 100,
                filterable: false,
                Cell: ({value}) => {
                    return (
                        <div style={{margin: "auto"}}>{value ? "Yes" : "No"}</div>
                    );
                }
            }];

        const props = {
            style: {backgroundColor: "white"},
            data: this.props.workers,
            columns: columns,
            showPagination: false,
            minRows: 0, /*
            defaultSorted: PreferencesManager.Instance.ProjectTableSort,
            defaultFiltered: this.props.isFiltered ? PreferencesManager.Instance.ProjectTableFilter : [],
            filterable: this.props.isFiltered,
            onSortedChange: (newSorted) => {
                PreferencesManager.Instance.ProjectTableSort = newSorted;
            },
            onFilteredChange: (newFiltered) => {
                PreferencesManager.Instance.ProjectTableFilter = newFiltered;
            },*/
            getTrProps: (state, rowInfo) => {
                return {
                    onClick: (e, handleOriginal) => {
                        if (!handleOriginal) {
                            this.setState({selectedWorker: rowInfo.original});
                        }

                        if (handleOriginal) {
                            handleOriginal()
                        }
                    },
                    style: this.state.selectedWorker && rowInfo.original.id === this.state.selectedWorker.id ? {backgroundColor: "rgb(233, 236, 239)"} : {}
                }
            }
        };

        return (
            <div style={Object.assign({width: "100%"}, this.props.style || {})}>
                {this.renderMenu()}
                <ReactTable {...props} className="-highlight"/>
            </div>
        )
    }
}

const _WorkerTable = graphql<IWorkerTableProps, any>(UpdateWorkerMutation, {
    props: ({mutate}) => ({
        updateWorker: (worker: IWorker) => mutate({
            variables: {worker}
        })
    })
})(__WorkerTable);

export const WorkerTable = graphql<IWorkerTableProps, any>(SetWorkerInPoolMutation, {
    props: ({mutate}) => ({
        setWorkerAvailability: (id: string, shouldBeInSchedulerPool: boolean) => mutate({
            variables: {
                id: id,
                shouldBeInSchedulerPool: shouldBeInSchedulerPool
            }
        })
    })
})(_WorkerTable);

/*
        const rows = workers.map(worker => (
            <WorkerRow key={"tr_worker" + worker.id} worker={worker}
                       setWorkerAvailability={(id: string, b: boolean) => this.setWorkerAvailability(id, b)}/>)
        );

        return (
            <Table condensed style={{marginBottom: "0"}}>
                <thead>
                <tr>
                    <th>Scheduler Pool</th>
                    <th>Name</th>
                    <th>Worker Id</th>
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
*/
