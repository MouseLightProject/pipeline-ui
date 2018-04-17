import * as React from "react";
import {Menu, MenuItem, Icon, Confirm, List} from "semantic-ui-react";
import ReactTable from "react-table";
import {graphql} from 'react-apollo';
import {toast} from "react-toastify";

import {ITaskDefinition} from "../../../models/taskDefinition";
import {ITaskRepository} from "../../../models/taskRepository";
import {DeleteTaskDefinitionMutation, UpdateTaskDefinitionMutation} from "../../../graphql/taskDefinition";
import {ViewScriptDialog} from "./ViewScriptDialog";
import {DialogMode} from "../../helpers/DialogUtils";
import {EditTaskDefinitionDialog} from "./EditTaskDefinitionDialog";
import {toastError, toastSuccess} from "../../../util/Toasts";

interface ITaskDefinitionsTableProps {
    style: any;
    taskDefinitions: ITaskDefinition[];
    taskRepositories: ITaskRepository[];

    updateTaskDefinition?(taskRepository: ITaskDefinition): any;
    deleteTaskDefinition?(taskRepository: ITaskDefinition): any;
}

interface ITaskDefinitionsTableState {
    selectedTask?: ITaskDefinition;
    isUpdateDialogShown?: boolean;
    isDeleteDialogShown?: boolean;
    isScriptDialogShown?: boolean
}

class __TaskDefinitionsTable extends React.Component<ITaskDefinitionsTableProps, ITaskDefinitionsTableState> {
    public constructor(props) {
        super(props);

        this.state = {
            selectedTask: null,
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

    private async onAcceptUpdateTaskDefinition(taskDefinition: ITaskDefinition) {
        this.setState({isUpdateDialogShown: false});

        try {
            const result = await this.props.updateTaskDefinition(taskDefinition);

            if (!result.data.updateTaskDefinition.taskDefinition) {
                toast.error(toastError("Update", result.data.updateTaskDefinition.error), {autoClose: false});
            } else {
                toast.success(toastSuccess("Update"), {autoClose: 3000});
            }
        } catch (error) {
            toast.error(toastError("Update", error), {autoClose: false});
        }
    }

    private onClickDeleteTaskDefinition(evt: any) {
        evt.stopPropagation();

        this.setState({isDeleteDialogShown: true});
    }

    private async onDeleteTaskDefinition() {
        try {
            const result = await this.props.deleteTaskDefinition({id: this.state.selectedTask.id});

            if (result.data.deleteTaskDefinition.error) {
                toast.error(toastError("Delete", result.data.deleteTaskDefinition.error), {autoClose: false});
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

    private renderDeleteTaskConfirmation() {
        if (!this.state.isDeleteDialogShown) {
            return null;
        }

        return (
            <Confirm open={this.state.isDeleteDialogShown} header="Delete Task"
                     content={`Are you sure you want to delete ${this.state.selectedTask.name} as a task?`}
                     confirmButton="Delete" onCancel={() => this.onClearDeleteConfirmation()}
                     onConfirm={() => this.onDeleteTaskDefinition()}/>
        )
    }

    private renderScript(task: ITaskDefinition) {
        if (task.script_status) {
            return (
                <span>
                    {task.script}
                </span>
            );
        } else {
            return (<span className="text-danger">{task.script}</span>);
        }
    }

    private renderMenu() {
        const disabled = this.state.selectedTask === null;

        const disabled_delete = disabled || this.state.selectedTask.pipeline_stages.length > 0;

        return (
            <Menu size="mini" style={{borderBottom: "none"}}>
                <EditTaskDefinitionDialog
                    element={<MenuItem size="mini" content="Edit" icon="pencil" disabled={disabled}
                                       onClick={(evt) => this.onClickUpdateTaskDefinition(evt)}/>}
                    show={this.state.isUpdateDialogShown}
                    mode={DialogMode.Update}
                    sourceTaskDefinition={this.state.selectedTask}
                    taskRepositories={this.props.taskRepositories}
                    onCancel={() => this.setState({isUpdateDialogShown: false})}
                    onAccept={(r: ITaskDefinition) => this.onAcceptUpdateTaskDefinition(r)}/>
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
                <Menu.Menu position="right">
                    <MenuItem size="mini" content="Delete" icon="trash" disabled={disabled_delete}
                              onClick={(evt) => this.onClickDeleteTaskDefinition(evt)}/>
                </Menu.Menu>
            </Menu>
        );
    }

    public render() {
        const columns = [
            {
                Header: "Name",
                accessor: "name",
                width: 180
            }, {
                id: "script",
                Header: "Script",
                accessor: t => t,
                width: 200,
                Cell: prop => this.renderScript(prop.original),
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
                    const argArray = JSON.parse(value).arguments;

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
            }];

        const props = {
            style: {backgroundColor: "white"},
            data: this.props.taskDefinitions,
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
                            this.setState({selectedTask: rowInfo.original});
                        }

                        if (handleOriginal) {
                            handleOriginal()
                        }
                    },
                    style: this.state.selectedTask && rowInfo.original.id === this.state.selectedTask.id ? {backgroundColor: "rgb(233, 236, 239)"} : {}
                }
            }
        };

        return (
            <div style={Object.assign({width: "100%"}, this.props.style || {})}>
                {this.renderDeleteTaskConfirmation()}
                {this.renderViewScriptDialog()}
                {this.renderMenu()}
                <ReactTable {...props} className="-highlight"/>
            </div>
        )
    }
}

const _TaskDefinitionsTable = graphql<any, any>(UpdateTaskDefinitionMutation, {
    props: ({mutate}) => ({
        updateTaskDefinition: (taskDefinition: ITaskDefinition) => mutate({
            variables: {taskDefinition}
        })
    })
})(__TaskDefinitionsTable);

export const TaskDefinitionsTable = graphql<any, any>(DeleteTaskDefinitionMutation, {
    props: ({mutate}) => ({
        deleteTaskDefinition: (taskDefinition: ITaskDefinition) => mutate({
            variables: {taskDefinition}
        })
    })
})(_TaskDefinitionsTable);

/*
    public render() {
        let rows = [];

        if (this.props.taskDefinitions) {
            const sorted = this.props.taskDefinitions.slice().sort((a, b) => a.name.localeCompare(b.name));

            rows = sorted.map(taskDefinition => (
                <TaskDefinitionRow key={"tr_task" + taskDefinition.id} taskDefinition={taskDefinition} taskRepositories={this.props.taskRepositories}/>));
        }

        return (
            <Table condensed style={{marginBottom: "0"}}>
                <thead>
                <tr>
                    <th style={{width: "30px"}}/>
                    <th>Name</th>
                    <th/>
                    <th>Script</th>
                    <th>Repository</th>
                    <th>Work Units</th>
                    <th/>
                    <th>Arguments</th>
                    <th/>
                </tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </Table>
        );
    }
 */