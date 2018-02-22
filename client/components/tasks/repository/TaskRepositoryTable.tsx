import * as React from "react";
import {Menu, MenuItem, Icon, Confirm} from "semantic-ui-react";
import ReactTable from "react-table";
import {graphql} from 'react-apollo';
import {toast} from "react-toastify";

import {ITaskRepository} from "../../../models/taskRepository";
import {DialogMode} from "../../helpers/DialogUtils";
import {EditRepositoryDialog} from "./EditRepositoryDialog";
import {DeleteTaskRepositoryMutation, UpdateTaskRepositoryMutation} from "../../../graphql/taskRepository";
import {toastError, toastSuccess} from "../../../util/Toasts";

interface ITaskRepositoryTableProps {
    style: any;
    taskRepositories: ITaskRepository[];

    updateTaskRepository?(taskRepository: ITaskRepository): any;
    deleteTaskRepository?(taskRepository: ITaskRepository): any;
}

interface ITaskRepositoryTableState {
    selectedRepository?: ITaskRepository;
    isUpdateDialogShown?: boolean;
    isDeleteDialogShown?: boolean;
}

class __TaskRepositoryTable extends React.Component<ITaskRepositoryTableProps, ITaskRepositoryTableState> {
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

    private onClickDeleteRepository(evt: any) {
        evt.stopPropagation();

        this.setState({isDeleteDialogShown: true});
    }

    private async onAcceptUpdateRepository(repository: ITaskRepository) {
        this.setState({isUpdateDialogShown: false});

        try {
            const result = await this.props.updateTaskRepository(repository);

            if (!result.data.updateTaskRepository.taskRepository) {
                toast.error(toastError("Update", result.data.updateTaskRepository.error), {autoClose: false});
            } else {
                toast.success(toastSuccess("Update"), {autoClose: 3000});
            }
        } catch (error) {
            toast.error(toastError("Update", error), {autoClose: false});
        }
    }

    private async onDeleteRepository() {
        try {
            const result = await this.props.deleteTaskRepository({id: this.state.selectedRepository.id});

            if (result.data.deleteTaskRepository.error) {
                toast.error(toastError("Delete", result.data.deleteTaskRepository.error), {autoClose: false});
            } else {
                toast.success(toastSuccess("Delete"), {autoClose: 3000});
            }
        } catch (error) {
            toast.error(toastError("Delete", error), {autoClose: false});
        }

        this.setState({isDeleteDialogShown: false});
    }

    private onClearDeleteConfirmation() {
        this.setState({isDeleteDialogShown: false});
    }

    private renderDeleteRepositoryConfirmation() {
        if (!this.state.isDeleteDialogShown) {
            return null;
        }

        return (
            <Confirm open={this.state.isDeleteDialogShown} header="Delete Repository"
                     content={`Are you sure you want to delete ${this.state.selectedRepository.name} as a repository?`}
                     confirmButton="Delete" onCancel={() => this.onClearDeleteConfirmation()}
                     onConfirm={() => this.onDeleteRepository()}/>
        )
    }

    private renderMenu() {
        const disabled = this.state.selectedRepository === null;

        const disabled_delete = disabled || this.state.selectedRepository.task_definitions.length > 0;

        return (
            <Menu size="mini" style={{borderBottom: "none"}}>
                <EditRepositoryDialog element={<MenuItem size="mini" content="Edit" icon="pencil" disabled={disabled}
                                                         onClick={(evt) => this.onClickUpdateRepository(evt)}/>}
                                      show={this.state.isUpdateDialogShown}
                                      mode={DialogMode.Update}
                                      sourceRepository={this.state.selectedRepository}
                                      onCancel={() => this.setState({isUpdateDialogShown: false})}
                                      onAccept={(r: ITaskRepository) => this.onAcceptUpdateRepository(r)}/>
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
        );
    }

    public render() {
        const columns = [
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
            }];

        const props = {
            style: {backgroundColor: "white"},
            data: this.props.taskRepositories,
            columns: columns,
            showPagination: false,
            minRows: 0,
            defaultSorted: [{"id": "name", "asc": true}], /*
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
                            this.setState({selectedRepository: rowInfo.original});
                        }

                        if (handleOriginal) {
                            handleOriginal()
                        }
                    },
                    style: this.state.selectedRepository && rowInfo.original.id === this.state.selectedRepository.id ? {backgroundColor: "rgb(233, 236, 239)"} : {}
                }
            }
        };

        return (
            <div style={Object.assign({width: "100%"}, this.props.style || {})}>
                {this.renderDeleteRepositoryConfirmation()}
                {this.renderMenu()}
                <ReactTable {...props} className="-highlight"/>
            </div>
        )
    }
}

const _TaskRepositoryTable = graphql<any, any>(UpdateTaskRepositoryMutation, {
    props: ({mutate}) => ({
        updateTaskRepository: (taskRepository: ITaskRepository) => mutate({
            variables: {taskRepository}
        })
    })
})(__TaskRepositoryTable);

export const TaskRepositoryTable = graphql<any, any>(DeleteTaskRepositoryMutation, {
    props: ({mutate}) => ({
        deleteTaskRepository: (taskRepository: ITaskRepository) => mutate({
            variables: {taskRepository}
        })
    })
})(_TaskRepositoryTable);
