import * as React from "react";
import {Button, Badge} from "react-bootstrap";
import FontAwesome = require("react-fontawesome");
import {graphql} from 'react-apollo';
import {toast} from "react-toastify";

import {ITaskDefinition, taskDisplayRepository} from "../../../models/taskDefinition";
import {DeleteTaskDefinitionMutation, UpdateTaskDefinitionMutation} from "../../../graphql/taskDefinition";
import {
    ModalAlert, toastDeleteError, toastDeleteSuccess, toastUpdateError,
    toastUpdateSuccess
} from "ndb-react-components";
import {EditTaskDefinitionDialog, TaskDefinitionDialogMode} from "./EditTaskDefinitionDialog";
import {ITaskRepository} from "../../../models/taskRepository";
import {tableButtonStyles, tableCellStyles} from "../../../util/styleDefinitions";
import {ViewScriptDialog} from "./ViewScriptDialog";

interface ITaskDefinitionRowProps {
    taskDefinition: ITaskDefinition;
    taskRepositories: ITaskRepository[];

    updateTaskDefinition?(taskRepository: ITaskDefinition): any;
    deleteTaskDefinition?(taskRepository: ITaskDefinition): any;
}

interface ITaskDefinitionRowState {
    isArgumentListExpanded: boolean;

    isDeleted?: boolean;

    isUpdateDialogShown?: boolean;
    isDeleteDialogShown?: boolean;
    isScriptDialogShown?: boolean;
}

@graphql(UpdateTaskDefinitionMutation, {
    props: ({mutate}) => ({
        updateTaskDefinition: (taskDefinition: ITaskDefinition) => mutate({
            variables: {taskDefinition}
        })
    })
})
@graphql(DeleteTaskDefinitionMutation, {
    props: ({mutate}) => ({
        deleteTaskDefinition: (taskDefinition: ITaskDefinition) => mutate({
            variables: {taskDefinition}
        })
    })
})
export class TaskDefinitionRow extends React.Component<ITaskDefinitionRowProps, ITaskDefinitionRowState> {
    public constructor(props: ITaskDefinitionRowProps) {
        super(props);

        this.state = {
            isArgumentListExpanded: false,
            isDeleted: false,
            isUpdateDialogShown: false,
            isDeleteDialogShown: false,
            isScriptDialogShown: false
        }
    }

    private onClickViewScript(evt: any) {
        evt.stopPropagation();

        this.setState({isScriptDialogShown: true});
    }

    private renderViewScriptDialog() {
        if (this.state.isScriptDialogShown) {
            return (
                <ViewScriptDialog taskDefinition={this.props.taskDefinition} show={this.state.isScriptDialogShown} onClose={() => this.setState({isScriptDialogShown: false})}/>
            );
        } else {
            return null;
        }
    }

    private onClickUpdateTaskDefinition(evt: any) {
        evt.stopPropagation();

        this.setState({isUpdateDialogShown: true});
    }

    private async onAcceptUpdateTaskDefinition(taskDefinition: ITaskDefinition) {
        this.setState({isUpdateDialogShown: false});

        try {
            const result = await this.props.updateTaskDefinition(taskDefinition);

            if (!result.data.updateTaskDefinition.taskDefinition) {
                toast.error(toastUpdateError(result.data.updateTaskDefinition.error), {autoClose: false});
            } else {
                toast.success(toastUpdateSuccess(), {autoClose: 3000});
            }
        } catch (error) {
            toast.error(toastUpdateError(error), {autoClose: false});
        }
    }

    private renderUpdateTaskDefinitionDialog() {
        if (this.state.isUpdateDialogShown) {
            return (
                <EditTaskDefinitionDialog show={this.state.isUpdateDialogShown}
                                          mode={TaskDefinitionDialogMode.Update}
                                          sourceTaskDefinition={this.props.taskDefinition}
                                          taskRepositories={this.props.taskRepositories}
                                          onCancel={() => this.setState({isUpdateDialogShown: false})}
                                          onAccept={(r: ITaskDefinition) => this.onAcceptUpdateTaskDefinition(r)}/>
            );
        } else {
            return null;
        }
    }

    private onClickDeleteTaskDefinition(evt: any) {
        evt.stopPropagation();

        this.setState({isDeleteDialogShown: true});
    }

    private async onDeleteTaskDefinition() {
        try {
            const result = await this.props.deleteTaskDefinition({id: this.props.taskDefinition.id});

            if (result.data.deleteTaskDefinition.error) {
                toast.error(toastDeleteError(result.data.deleteTaskDefinition.error), {autoClose: false});
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
            <ModalAlert show={this.state.isDeleteDialogShown} style="danger" header="Delete Task Definition"
                        message={`Are you sure you want to delete ${this.props.taskDefinition.name} as a task definition?`}
                        acknowledgeContent="Delete" canCancel={true} onCancel={() => this.onClearDeleteConfirmation()}
                        onAcknowledge={() => this.onDeleteTaskDefinition()}/>
        )
    }

    private renderScript() {
        if (this.props.taskDefinition.script_status) {
            return (
                <span>
                    {this.props.taskDefinition.script}
                </span>
            );
        } else {
            return (<span className="text-danger">{this.props.taskDefinition.script}</span>);
        }
    }

    public render() {
        const taskDefinition = this.props.taskDefinition;

        let args = [(<div key="none">{"(none)"}</div>)];

        const argArray = taskDefinition.args.split(/[\s+]/).filter(Boolean);

        const isExpanded = this.state.isArgumentListExpanded || argArray.length < 3;

        if (argArray.length > 0) {
            if (isExpanded) {
                args = argArray.map((a, index) => {
                    return (
                        <div key={a + index.toString()}>
                            {a}
                        </div>
                    );
                });
            } else {
                args = [(<div key={argArray[0]}>{argArray[0]}</div>)];

                if (argArray.length > 1) {
                    args.push((<div key="...">{"..."}</div>));
                }
            }
        }

        return (
            <tr>
                {this.renderViewScriptDialog()}
                {this.renderUpdateTaskDefinitionDialog()}
                {this.renderDeleteRepositoryConfirmation()}
                <td style={{paddingLeft: "10px", verticalAlign: "middle"}}>
                    <Button bsSize="sm" bsStyle="info" style={tableButtonStyles.edit}
                            onClick={(evt) => this.onClickUpdateTaskDefinition(evt)}>
                        <span>
                        <FontAwesome name="pencil"/>
                        </span>
                    </Button>
                </td>
                <td style={tableCellStyles.middle}>{taskDefinition.name}</td>
                <td style={{textAlign: "center", paddingRight: "4px", width: "10px", verticalAlign: "middle"}}>
                    {taskDefinition.script_status ?
                        <Button bsSize="sm" bsStyle="info" style={tableButtonStyles.view} onClick={(evt) => this.onClickViewScript(evt)}>
                            <FontAwesome name="eye"/>
                        </Button> : <span style={{fontSize: "15px"}} className="text-danger"><FontAwesome name="exclamation-circle"/></span>
                    }
                </td>
                <td style={tableCellStyles.middle}>{this.renderScript()}</td>
                <td style={tableCellStyles.middle}>{taskDisplayRepository(taskDefinition)}</td>
                <td style={tableCellStyles.middle}>{taskDefinition.work_units}</td>
                <td style={{textAlign: "center", paddingRight: "4px", width: "10px", verticalAlign: "middle"}}>
                    {argArray.length > 2 ?
                        <Button bsSize="sm" bsStyle="info" style={tableButtonStyles.edit}
                                onClick={(evt) => this.setState({isArgumentListExpanded: !this.state.isArgumentListExpanded})}>
                            <FontAwesome name={isExpanded ? "minus-circle" : "plus-circle"}/>
                        </Button> : null}
                </td>
                <td style={tableCellStyles.middle}>{args}</td>
                <td style={{textAlign: "center", paddingRight: "10px", width: "20px", verticalAlign: "middle"}}>
                    {taskDefinition.pipeline_stages.length === 0 ?
                        <Button bsSize="sm" bsStyle="danger" style={tableButtonStyles.remove}
                                onClick={(evt) => this.onClickDeleteTaskDefinition(evt)}>
                        <span>
                            <FontAwesome name="times-circle"/>
                        </span>
                        </Button>
                        : <Badge>{taskDefinition.pipeline_stages.length}</Badge>}
                </td>
            </tr>
        );
    }
}

