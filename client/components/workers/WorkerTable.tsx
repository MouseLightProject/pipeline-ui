import * as React from "react";
import {Menu, MenuItem, Button, Icon} from "semantic-ui-react";
import {Mutation} from "react-apollo";
import ReactTable from "react-table";
import {toast} from "react-toastify";
import * as moment from "moment";

import {IWorker, PipelineWorkerStatus} from "../../models/worker";
import {DialogMode} from "../helpers/DialogUtils";
import {EditWorkerDialog} from "./EditWorkerDialog";
import {toastError, toastSuccess} from "../../util/Toasts";
import {SetWorkerInPoolMutation, UpdateWorkerMutation} from "../../graphql/workers";
import {PreferencesManager} from "../../util/preferencesManager";

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

export class WorkerTable extends React.Component<IWorkerTableProps, IWorkerTableState> {
    public constructor(props) {
        super(props);

        this.state = {
            selectedWorker: null,
            isUpdateDialogShown: false
        }
    }

    getActivateText = isActive => isActive ? "remove" : "add";

    getActivateGlyph = (isActive, loading) => <Icon name={isActive ? "minus" : "plus"} loading={loading}/>;

    private onClickUpdateWorker(evt: any) {
        evt.stopPropagation();

        this.setState({isUpdateDialogShown: true});
    }

    private onCompleteUpdateWorker = (data) => {
        if (!data.updateWorker.worker) {
            toast.error(toastError("Update", data.updateWorker.error), {autoClose: false});
        } else {
            toast.success(toastSuccess("Update"), {autoClose: 3000});
        }
    };

    private onUpdateWorkerError = (error) => {
        toast.error(toastError("Update", error), {autoClose: false});
    };

    private onAcceptEditDialog = (w: IWorker, updateWorker: Function) => {
        this.setState({isUpdateDialogShown: false});
        updateWorker({variables: {worker: w}});
    };

    private renderMenu() {
        const disabled = this.state.selectedWorker === null;

        return (
            <Mutation mutation={UpdateWorkerMutation} onCompleted={this.onCompleteUpdateWorker}
                      onError={this.onUpdateWorkerError}>
                {(updateWorker: Function) => {
                    return (
                        <Menu size="mini" style={{borderBottom: "none"}}>
                            <EditWorkerDialog
                                element={<MenuItem size="mini" content="Edit" icon="pencil" disabled={disabled}
                                                   onClick={(evt) => this.onClickUpdateWorker(evt)}/>}
                                show={this.state.isUpdateDialogShown}
                                mode={DialogMode.Update}
                                sourceWorker={this.state.selectedWorker}
                                onCancel={() => this.setState({isUpdateDialogShown: false})}
                                onAccept={(w: IWorker) => this.onAcceptEditDialog(w, updateWorker)}/>
                            {this.state.selectedWorker ? <Menu.Header>
                                <div style={{
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    paddingLeft: "10px",
                                }}>
                                    <h5>
                                        {this.state.selectedWorker.name}&nbsp;
                                        <Icon name="remove" onClick={() => this.setState({selectedWorker: null})}/>
                                    </h5>
                                </div>
                            </Menu.Header> : null}
                        </Menu>
                    )
                }
                }
            </Mutation>
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
                        <Mutation mutation={SetWorkerInPoolMutation}>
                            {(setWorkerAvailability, {loading}) => {
                                return (
                                    <Button size="mini" compact color={color}
                                            disabled={worker.status === PipelineWorkerStatus.Unavailable}
                                            className="active-button"
                                            icon={this.getActivateGlyph(worker.is_in_scheduler_pool, loading)}
                                            content={this.getActivateText(worker.is_in_scheduler_pool)}
                                            onClick={() => setWorkerAvailability({
                                                variables: {
                                                    id: worker.id,
                                                    shouldBeInSchedulerPool: !worker.is_in_scheduler_pool
                                                }
                                            })}>
                                    </Button>
                                )
                            }
                            }
                        </Mutation>
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
            minRows: 0,
            defaultSorted: PreferencesManager.Instance.WorkerTableSort,
            onSortedChange: (newSorted) => {
                PreferencesManager.Instance.WorkerTableSort = newSorted;
            },
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
