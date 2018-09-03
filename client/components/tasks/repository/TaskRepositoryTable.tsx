import * as React from "react";
import {Menu, MenuItem, Icon, Confirm} from "semantic-ui-react";
import {Mutation} from "react-apollo";
import ReactTable, {SortingRule} from "react-table";
import {toast} from "react-toastify";

import {ITaskRepository} from "../../../models/taskRepository";
import {DialogMode} from "../../helpers/DialogUtils";
import {EditRepositoryDialog} from "./EditRepositoryDialog";
import {
    DeleteTaskRepositoryMutation,
    UpdateTaskRepositoryMutation
} from "../../../graphql/taskRepository";
import {toastError, toastSuccess} from "../../../util/Toasts";
import {BaseQuery} from "../../../graphql/baseQuery";

interface ITaskRepositoryTableProps {
    style: any;
    taskRepositories: ITaskRepository[];
}

interface ITaskRepositoryTableState {
    selectedRepository?: ITaskRepository;
    isUpdateDialogShown?: boolean;
    isDeleteDialogShown?: boolean;
}

export class TaskRepositoryTable extends React.Component<ITaskRepositoryTableProps, ITaskRepositoryTableState> {
    public constructor(props) {
        super(props);

        this.state = {
            selectedRepository: null,
            isUpdateDialogShown: false,
            isDeleteDialogShown: false
        }
    }

    private onClickUpdateRepository(evt: any) {
        evt.stopPropagation();
        this.setState({isUpdateDialogShown: true});
    }

    private onCompleteUpdateRepository = (data) => {
        if (data.updateTaskRepository.error) {
            toast.error(toastError("Update", data.updateTaskRepository.error), {autoClose: false});
        } else {
            toast.success(toastSuccess("Update"), {autoClose: 3000});
        }
    };

    private onUpdateRepositoryError = (error) => {
        toast.error(toastError("Update", error), {autoClose: false});
    };

    private onClickDeleteRepository(evt: any) {
        evt.stopPropagation();
        this.setState({isDeleteDialogShown: true});
    }

    private onCompleteDeleteRepository = (data) => {
        if (data.deleteTaskRepository.error) {
            toast.error(toastError("Delete", data.deleteTaskRepository.error), {autoClose: false});
        } else {
            this.setState({selectedRepository: null});
            toast.success(toastSuccess("Delete"), {autoClose: 3000});
        }
    };

    private onDeleteRepositoryError = (error) => {
        toast.error(toastError("Delete", error), {autoClose: false});
    };

    private onClearDeleteConfirmation() {
        this.setState({isDeleteDialogShown: false});
    }

    private renderDeleteRepositoryConfirmation() {
        return (
            <Mutation mutation={DeleteTaskRepositoryMutation} onCompleted={this.onCompleteDeleteRepository}
                      onError={this.onDeleteRepositoryError}
                      update={(cache, {data: {deleteTaskRepository: {id}}}) => {
                          const data: any = cache.readQuery({query: BaseQuery});
                          cache.writeQuery({
                              query: BaseQuery,
                              data: Object.assign(data, {taskRepositories: data.taskRepositories.filter(t => t.id !== id)})
                          });
                      }}>
                {(deleteTaskRepository) => {
                    if (!this.state.isDeleteDialogShown) {
                        return null;
                    }
                    return (
                        <Confirm open={this.state.isDeleteDialogShown} header="Delete Repository"
                                 content={`Are you sure you want to delete ${this.state.selectedRepository.name} as a repository?`}
                                 confirmButton="Delete" onCancel={() => this.onClearDeleteConfirmation()}
                                 onConfirm={() => {
                                     deleteTaskRepository({variables: {id: this.state.selectedRepository.id}});
                                     this.setState({isDeleteDialogShown: false});
                                 }}/>
                    )

                }
                }
            </Mutation>
        )
    }

    private renderMenu() {
        const disabled = this.state.selectedRepository === null;

        const disabled_delete = disabled || this.state.selectedRepository.task_definitions.length > 0;

        return (
            <Mutation mutation={UpdateTaskRepositoryMutation} onCompleted={this.onCompleteUpdateRepository}
                      onError={this.onUpdateRepositoryError}>
                {(updateTaskRepository) => (
                    <Menu size="mini" style={{borderBottom: "none", borderRadius: 0, marginBottom: 0, boxShadow: "none"}}>
                        <EditRepositoryDialog
                            trigger={<MenuItem size="mini" content="Edit" icon="pencil" disabled={disabled}
                                               onClick={(evt) => this.onClickUpdateRepository(evt)}/>}
                            isOpen={this.state.isUpdateDialogShown}
                            mode={DialogMode.Update}
                            sourceRepository={this.state.selectedRepository}
                            onCancel={() => this.setState({isUpdateDialogShown: false})}
                            onAccept={(r: ITaskRepository) => {
                                this.setState({isUpdateDialogShown: false});
                                updateTaskRepository({variables: {taskRepository: r}});
                            }}/>
                        {this.state.selectedRepository ? <Menu.Header>
                            <div style={{
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                paddingLeft: "10px",
                            }}>
                                <h5>
                                    {this.state.selectedRepository.name}&nbsp;
                                    <Icon name="remove" onClick={() => this.setState({selectedRepository: null})}/>
                                </h5>
                            </div>
                        </Menu.Header> : null}
                        <Menu.Menu position="right">
                            <MenuItem size="mini" content="Delete" icon="trash" disabled={disabled_delete}
                                      onClick={(evt) => this.onClickDeleteRepository(evt)}/>
                        </Menu.Menu>
                    </Menu>
                )
                }
            </Mutation>
        );
    }

    private getTrProps = (state, rowInfo) => {
        return {
            onClick: (e, handleOriginal) => {
                if (!handleOriginal) {
                    this.setState({selectedRepository: rowInfo.original});
                }

                if (handleOriginal) {
                    handleOriginal()
                }
            },
            style: this.state.selectedRepository && rowInfo.original.id === this.state.selectedRepository.id ? {backgroundColor: "rgb(233, 236, 239)"} : {}
        }
    };

    public render() {
        const tableProps = {
            style: {backgroundColor: "white"},
            data: this.props.taskRepositories,
            columns: tableColumns,
            showPagination: false,
            minRows: 0,
            defaultSorted: [sortRule],
            getTrProps: this.getTrProps
        };

        return (
            <div style={Object.assign({width: "100%"}, this.props.style || {})}>
                {this.renderDeleteRepositoryConfirmation()}
                {this.renderMenu()}
                <ReactTable {...tableProps} className="-highlight"/>
            </div>
        )
    }
}

const sortRule: SortingRule = {
    id: "name",
    sort: "desc"
};

const tableColumns = [
    {
        Header: "Name",
        accessor: "name",
        width: 180,
    }, {
        Header: "Location",
        accessor: "location",
    }, {
        Header: "Description",
        accessor: "description",
        width: 200,
    }, {
        Header: "Tasks",
        width: 60,
        accessor: "task_definitions",
        Cell: ({value}) => (
            <div style={{margin: "auto"}}>{value.length}</div>
        )
    }
];