import * as React from "react";
import {Menu, MenuItem, Icon, Confirm, List} from "semantic-ui-react";
import {Mutation} from "react-apollo";
import ReactTable, {SortingRule} from "react-table";
import {toast} from "react-toastify";

import {ITaskDefinition} from "../../../models/taskDefinition";
import {ITaskRepository} from "../../../models/taskRepository";
import {
    DeleteTaskDefinitionMutation,
    DuplicateTaskMutation,
    UpdateTaskDefinitionMutation
} from "../../../graphql/taskDefinition";
import {ViewScriptDialog} from "./ViewScriptDialog";
import {DialogMode} from "../../helpers/DialogUtils";
import {EditTaskDefinitionDialog} from "./EditTaskDefinitionDialog";
import {toastError, toastSuccess} from "../../../util/Toasts";
import {BaseQuery} from "../../../graphql/baseQuery";
import {PreferencesManager} from "../../../util/preferencesManager";
import {DuplicateProjectMutation} from "../../../graphql/project";

interface ITaskDefinitionsTableProps {
    style: any;
    taskDefinitions: ITaskDefinition[];
    taskRepositories: ITaskRepository[];
}

interface ITaskDefinitionsTableState {
    selectedTask?: ITaskDefinition;
    isUpdateDialogShown?: boolean;
    isDeleteDialogShown?: boolean;
    isDuplicateDialogShown?: boolean;
    isScriptDialogShown?: boolean;
}

export class TaskDefinitionsTable extends React.Component<ITaskDefinitionsTableProps, ITaskDefinitionsTableState> {
    public constructor(props) {
        super(props);

        this.state = {
            selectedTask: null,
            isUpdateDialogShown: false,
            isDeleteDialogShown: false,
            isDuplicateDialogShown: false,
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
                <ViewScriptDialog taskDefinition={this.state.selectedTask} show={this.state.isScriptDialogShown}
                                  onClose={() => this.setState({isScriptDialogShown: false})}/>
            );
        } else {
            return null;
        }
    }

    private onClickUpdateTaskDefinition(evt: any) {
        evt.stopPropagation();
        this.setState({isUpdateDialogShown: true});
    }

    private onCompleteUpdateDefinition = (data) => {
        if (data.updateTaskDefinition.error) {
            toast.error(toastError("Update", data.updateTaskDefinition.error), {autoClose: false});
        } else {
            toast.success(toastSuccess("Update"), {autoClose: 3000});
        }
    };

    private onUpdateDefinitionError = (error) => {
        toast.error(toastError("Update", error), {autoClose: false});
    };

    // region Duplicate Methods

    private onDuplicateTask(evt: any) {
        evt.stopPropagation();
        this.setState({isDuplicateDialogShown: true});
    }

    private onCompleteDuplicateTask = (data) => {
        if (data.duplicateTaskDefinition.error) {
            toast.error(toastError("Duplicate", data.duplicateTaskDefinition.error), {autoClose: false});
        } else {
            toast.success(toastSuccess("Duplicate"), {autoClose: 3000});
        }
    };

    private onDuplicateTaskError = (error) => {
        toast.error(toastError("Duplicate", error), {autoClose: false});
    };

    private onClearDuplicateConfirmation() {
        this.setState({isDuplicateDialogShown: false});
    }

    private renderDuplicateTaskConfirmation() {
        return (
            <Mutation mutation={DuplicateTaskMutation} onCompleted={this.onCompleteDuplicateTask}
                      onError={this.onDuplicateTaskError}
                      update={(cache, {data: {duplicateTaskDefinition: {taskDefinition}}}) => {
                          const data: any = cache.readQuery({query: BaseQuery});
                          cache.writeQuery({
                              query: BaseQuery,
                              data: Object.assign(data, {taskDefinitions: data.taskDefinitions.concat([taskDefinition])})
                          });
                      }}>
                {(duplicateProject) => {
                    if (!this.state.isDuplicateDialogShown) {
                        return null;
                    }
                    return (
                        <Confirm open={this.state.isDuplicateDialogShown} header="Duplicate Task"
                                 content={`Are you sure you want to duplicate ${this.state.selectedTask.name}?`}
                                 confirmButton="Duplicate" onCancel={() => this.onClearDuplicateConfirmation()}
                                 onConfirm={() => {
                                     duplicateProject({variables: {id: this.state.selectedTask.id}});
                                     this.setState({isDuplicateDialogShown: false});
                                 }}/>
                    );
                }
                }
            </Mutation>
        )
    }

    // endregion

    private onClickDeleteTaskDefinition(evt: any) {
        evt.stopPropagation();
        this.setState({isDeleteDialogShown: true});
    }

    private onCompleteDeleteDefinition = (data) => {
        if (data.deleteTaskDefinition.error) {
            toast.error(toastError("Delete", data.deleteTaskDefinition.error), {autoClose: false});
        } else {
            this.setState({selectedTask: null});
            toast.success(toastSuccess("Delete"), {autoClose: 3000});
        }
    };

    private onDeleteDefinitionError = (error) => {
        toast.error(toastError("Delete", error), {autoClose: false});
    };

    private onClearDeleteConfirmation() {
        this.setState({isDeleteDialogShown: false});
    }

    private renderDeleteTaskConfirmation() {
        return (
            <Mutation mutation={DeleteTaskDefinitionMutation} onCompleted={this.onCompleteDeleteDefinition}
                      onError={this.onDeleteDefinitionError}
                      update={(cache, {data: {deleteTaskDefinition: {id}}}) => {
                          const data: any = cache.readQuery({query: BaseQuery});
                          cache.writeQuery({
                              query: BaseQuery,
                              data: Object.assign(data, {taskDefinitions: data.taskDefinitions.filter(t => t.id !== id)})
                          });
                      }}>
                {(deleteTaskDefinition) => {
                    if (!this.state.isDeleteDialogShown) {
                        return null;
                    }
                    return (
                        <Confirm open={this.state.isDeleteDialogShown} header="Delete Task"
                                 content={`Are you sure you want to delete ${this.state.selectedTask.name} as a task?`}
                                 confirmButton="Delete" onCancel={() => this.onClearDeleteConfirmation()}
                                 onConfirm={() => {
                                     deleteTaskDefinition({variables: {id: this.state.selectedTask.id}});
                                     this.setState({isDeleteDialogShown: false});
                                 }}/>
                    )
                }
                }
            </Mutation>
        );
    }

    private renderMenu() {
        const disabled = this.state.selectedTask === null;

        const disabled_delete = disabled || this.state.selectedTask.pipeline_stages.length > 0;

        return (
            <Mutation mutation={UpdateTaskDefinitionMutation} onCompleted={this.onCompleteUpdateDefinition}
                      onError={this.onUpdateDefinitionError}>
                {(updateTaskDefinition) => (
                    <Menu size="mini" style={{borderBottom: "none"}}>
                        <EditTaskDefinitionDialog
                            trigger={<MenuItem size="mini" content="Edit" icon="pencil" disabled={disabled}
                                               onClick={(evt) => this.onClickUpdateTaskDefinition(evt)}/>}
                            isOpen={this.state.isUpdateDialogShown}
                            mode={DialogMode.Update}
                            sourceTaskDefinition={this.state.selectedTask}
                            taskRepositories={this.props.taskRepositories}
                            onCancel={() => this.setState({isUpdateDialogShown: false})}
                            onAccept={(t: ITaskDefinition) => {
                                this.setState({isUpdateDialogShown: false});
                                updateTaskDefinition({variables: {taskDefinition: t}});
                            }}/>
                        <MenuItem size="mini" content="View Script" icon="eye" disabled={disabled}
                                  onClick={(evt) => this.onClickViewScript(evt)}/>
                        {this.state.selectedTask ? <Menu.Header>
                            <div style={{
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                paddingLeft: "10px",
                            }}>
                                <h5>
                                    {this.state.selectedTask.name}&nbsp;
                                    <Icon name="remove" onClick={() => this.setState({selectedTask: null})}/>
                                </h5>
                            </div>
                        </Menu.Header> : null}
                        <MenuItem size="mini" content="Duplicate" icon="clone" disabled={disabled}
                                  onClick={(evt) => this.onDuplicateTask(evt)}/>
                        <Menu.Menu position="right">
                            <MenuItem size="mini" content="Delete" icon="trash" disabled={disabled_delete}
                                      onClick={(evt) => this.onClickDeleteTaskDefinition(evt)}/>
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
                    this.setState({selectedTask: rowInfo.original});
                }

                if (handleOriginal) {
                    handleOriginal()
                }
            },
            style: this.state.selectedTask && rowInfo.original.id === this.state.selectedTask.id ? {backgroundColor: "rgb(233, 236, 239)"} : {}
        }
    };

    public componentWillReceiveProps(props: ITaskDefinitionsTableProps) {
        if (this.state.selectedTask !== null) {
            const task = this.props.taskDefinitions.find(t => t.id === this.state.selectedTask.id);
            this.setState({selectedTask: task});
        }
    }

    public render() {
        const props = {
            style: {backgroundColor: "white"},
            data: this.props.taskDefinitions,
            columns: tableColumns,
            showPagination: false,
            minRows: 0,
            defaultSorted: [sortRule],
            getTrProps: this.getTrProps
        };

        return (
            <div style={Object.assign({width: "100%"}, this.props.style || {})}>
                {this.renderDeleteTaskConfirmation()}
                {this.renderDuplicateTaskConfirmation()}
                {this.renderViewScriptDialog()}
                {this.renderMenu()}
                <ReactTable {...props} className="-highlight"/>
            </div>
        )
    }
}

const renderScript = (task: ITaskDefinition) => (
    <span className={task.script_status ? "" : "text-danger"}>
                {task.script}
            </span>
);

const sortRule: SortingRule = {
    id: "name",
    asc: true
};

const tableColumns = [
    {
        Header: "Name",
        accessor: "name",
        width: 180
    }, {
        id: "script",
        Header: "Script",
        accessor: t => t,
        width: 200,
        Cell: prop => renderScript(prop.original),
        sortMethod: (a, b) => a.script.localeCompare(b.script)
    }, {
        Header: "Repository",
        accessor: "task_repository.name",
        width: 120
    }, {
        Header: "Work Units",
        accessor: "work_units",
        width: 100,
        Cell: ({value}) => (
            <div style={{margin: "auto"}}>{value}</div>
        )
    }, {
        Header: "Arguments",
        accessor: "script_args",
        Cell: ({value}) => {
            const argArray = JSON.parse(value).arguments.map(a => a.value);

            const isExpanded = true; // this.state.isArgumentListExpanded || argArray.length < 3;

            if (argArray.length > 0) {
                let args = [];

                if (isExpanded) {
                    args = argArray.map((a, index) => {
                        return (
                            <List.Item key={a + index}>
                                {a}
                            </List.Item>
                        );
                    });

                    return (<List>{args}</List>);
                } else {
                    if (argArray.length > 1) {
                        let args = [argArray[0], "..."];
                        return (<List>{args.map(a => (<List.Item key={a}>{a}</List.Item>))}</List>);
                    } else {
                        return argArray[0];
                    }
                }
            } else {
                return "(none)";
            }
        },
        sortMethod: (a, b) => {
            if (a.length === 0) {
                return 1;
            }

            if (b.length === 0) {
                return -1;
            }

            return a[0].localeCompare(b[0]);
        }
    }, {
        Header: "Stages",
        width: 60,
        accessor: "pipeline_stages",
        Cell: ({value}) => (
            <div style={{margin: "auto"}}>{value.length}</div>
        )
    }
    ];

