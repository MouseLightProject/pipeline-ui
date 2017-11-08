import * as React from "react";
import {Button, Badge} from "react-bootstrap";
import FontAwesome = require("react-fontawesome");
import {graphql} from 'react-apollo';
import {toast} from "react-toastify";
import pluralize = require("pluralize");

import {DeleteTaskRepositoryMutation, UpdateTaskRepositoryMutation} from "../../../graphql/taskRepository";
import {EditRepositoryDialog} from "./EditRepositoryDialog";
import {ITaskRepository} from "../../../models/taskRepository";
import {
    ModalAlert, toastDeleteError, toastDeleteSuccess, toastUpdateError,
    toastUpdateSuccess
} from "ndb-react-components";
import {tableButtonStyles, tableCellStyles} from "../../../util/styleDefinitions";
import {DialogMode} from "../../helpers/DialogUtils";

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
export class TaskRepositoryRow extends React.Component<ITaskRepositoryRowProps, ITaskRepositoryRowState> {
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
                                      mode={DialogMode.Update}
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
                <td style={{paddingLeft: "10px"}}>
                    <Button bsSize="sm" bsStyle="info" style={tableButtonStyles.edit} onClick={(evt) => this.onClickUpdateRepository(evt)}>
                        <span>
                        <FontAwesome name="pencil"/>
                        </span>
                    </Button>
                </td>
                <td style={tableCellStyles.middle}>{taskRepository.name}</td>
                <td style={tableCellStyles.middle}>{taskRepository.location}</td>
                <td style={tableCellStyles.middle}>{taskRepository.description}</td>
                <td style={{textAlign: "center", paddingRight: "10px", width: "20px"}}>
                    {taskRepository.task_definitions.length === 0 ?
                        <Button bsSize="sm" bsStyle="danger" style={tableButtonStyles.remove} onClick={(evt) => this.onClickDeleteRepository(evt)}>
                        <span>
                            <FontAwesome name="trash"/>
                        </span>
                        </Button>
                        : <Badge>{taskRepository.task_definitions.length} {pluralize("task", taskRepository.task_definitions.length)}</Badge>}
                </td>
            </tr>
        );
    }
}

