import * as React from "react";
import {Table} from "react-bootstrap"
import FontAwesome = require("react-fontawesome");
import {graphql} from 'react-apollo';
import {toast} from "react-toastify";

import {DeleteTaskRepositoryMutation, UpdateTaskRepositoryMutation} from "../../graphql/taskRepository";
import {EditRepositoryDialog, RepositoryDialogMode} from "./EditRepositoryDialog";
import {ITaskRepository} from "../../models/taskRepository";
import {
    ModalAlert, toastDeleteError, toastDeleteSuccess, toastUpdateError,
    toastUpdateSuccess
} from "ndb-react-components";

interface ITaskRepositoryRowProps {
    taskRepository: ITaskRepository;

    updateTaskRepository?(taskRepository: ITaskRepository): any;
    deleteTaskRepository?(taskRepository: ITaskRepository): any;
}

interface ITaskRepositoryRowState {
    isDeleted?: boolean;

    isUpdateDialogShown?: boolean;
    isDeleteDialogShown?: boolean;
}

@graphql(UpdateTaskRepositoryMutation, {
    props: ({mutate}) => ({
        updateTaskRepository: (taskRepository: ITaskRepository) => mutate({
            variables: {taskRepository}
        })
    })
})
@graphql(DeleteTaskRepositoryMutation, {
    props: ({mutate}) => ({
        deleteTaskRepository: (taskRepository: ITaskRepository) => mutate({
            variables: {taskRepository}
        })
    })
})
class TaskRepositoryRow extends React.Component<ITaskRepositoryRowProps, ITaskRepositoryRowState> {
    public constructor(props: ITaskRepositoryRowProps) {
        super(props);

        this.state = {
            isDeleted: false,
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
                toast.error(toastUpdateError(result.data.updateTaskRepository.error), {autoClose: false});
            } else {
                toast.success(toastUpdateSuccess(), {autoClose: 3000});
            }
        } catch (error) {
            toast.error(toastUpdateError(error), {autoClose: false});
        }
    }

    private async onDeleteRepository() {
        try {
            const result = await this.props.deleteTaskRepository({id: this.props.taskRepository.id});

            if (result.data.deleteTaskRepository.error) {
                toast.error(toastDeleteError(result.data.deleteTaskRepository.error), {autoClose: false});
            } else {
                toast.success(toastDeleteSuccess(), {autoClose: 3000});

                this.setState({isDeleted: true});
            }
        } catch (error) {
            toast.error(toastDeleteError(error), {autoClose: false});
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
            <ModalAlert show={this.state.isDeleteDialogShown} style="danger" header="Delete Repository"
                        message={`Are you sure you want to delete ${this.props.taskRepository.name} as a task repository?`}
                        acknowledgeContent="Delete" canCancel={true} onCancel={() => this.onClearDeleteConfirmation()}
                        onAcknowledge={() => this.onDeleteRepository()}/>
        )
    }

    private renderUpdateRepositoryDialog() {
        if (this.state.isUpdateDialogShown) {
            return (
                <EditRepositoryDialog show={this.state.isUpdateDialogShown}
                                      mode={RepositoryDialogMode.Update}
                                      sourceRepository={this.props.taskRepository}
                                      onCancel={() => this.setState({isUpdateDialogShown: false})}
                                      onAccept={(r: ITaskRepository) => this.onAcceptUpdateRepository(r)}/>
            );
        } else {
            return null;
        }
    }

    public render() {
        let taskRepository = this.props.taskRepository;

        if (this.state.isDeleted) {
            return null;
        }

        return (
            <tr>
                {this.renderUpdateRepositoryDialog()}
                {this.renderDeleteRepositoryConfirmation()}
                <td style={{paddingLeft: "10px"}}><a onClick={(evt) => this.onClickUpdateRepository(evt)}><FontAwesome
                    name="pencil"/>&nbsp;</a></td>
                <td>{taskRepository.name}</td>
                <td>{taskRepository.location}</td>
                <td>{taskRepository.description}</td>
                <td style={{textAlign: "right", paddingRight: "10px"}}>
                    {taskRepository.taskDefinitions.length === 0 ?
                        <a onClick={(evt) => this.onClickDeleteRepository(evt)}>
                        <span>
                            <FontAwesome name="times-circle"/>
                        </span>
                        </a>
                        : null}
                </td>
            </tr>
        );
    }
}

interface ITaskRepositoryTableProps {
    taskRepositories: ITaskRepository[];
}

interface ITaskRepositoryTableState {
}

export class TaskRepositoryTable extends React.Component<ITaskRepositoryTableProps, ITaskRepositoryTableState> {
    public render() {
        let rows = [];

        if (this.props.taskRepositories) {
            const sorted = this.props.taskRepositories.slice().sort((a, b) => a.name.localeCompare(b.name));

            rows = sorted.map(taskRepository => (
                <TaskRepositoryRow key={"tr_task" + taskRepository.id} taskRepository={taskRepository}/>));
        }

        return (
            <Table condensed>
                <thead>
                <tr>
                    <th style={{width: "30px"}}/>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Description</th>
                    <th/>
                </tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </Table>
        );
    }
}
