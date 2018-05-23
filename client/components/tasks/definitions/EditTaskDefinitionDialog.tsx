import * as React from "react";
import {Button, Modal, Form, List, Input, Label, Icon} from "semantic-ui-react";
import {ChangeEvent} from "react";
import * as pathIsAbsolute from "path-is-absolute";
import {IUITaskArguments, ITaskDefinition, TaskArgumentType, ITaskArguments} from "../../../models/taskDefinition";
import {TaskRepositorySelect} from "../../helpers/TaskRepositorySelect";
import {ITaskRepository} from "../../../models/taskRepository";
import {DialogMode} from "../../helpers/DialogUtils";
import uuid = require("uuid");

interface IEditTaskDefinitionProps {
    trigger: React.ReactNode;
    mode: DialogMode;
    isOpen: boolean;
    taskRepositories: ITaskRepository[];
    sourceTaskDefinition?: ITaskDefinition;

    onCancel(): void;
    onAccept(taskDefinition: ITaskDefinition): void;
}

interface IEditTaskDefinitionState {
    taskDefinition?: ITaskDefinition;
    script_arguments?: IUITaskArguments;
    work_units?: string;
    cluster_work_units?: string;
    expected_exit_code?: string;
}

function taskArgsToUI(args: ITaskArguments): IUITaskArguments {
    return {
        arguments: args.arguments.map(a => Object.assign({}, a, {nonce: uuid.v4()}))
    }
}

function uiTasksArgsToArgs(args: IUITaskArguments): ITaskArguments {
    return {
        arguments: args.arguments.filter(a => a.value.length > 0).map(a => Object.assign({},{value: a.value, type: a.type}))
    }
}

export class EditTaskDefinitionDialog extends React.Component<IEditTaskDefinitionProps, IEditTaskDefinitionState> {
    public constructor(props: IEditTaskDefinitionProps) {
        super(props);

        this.state = {
            taskDefinition: props.sourceTaskDefinition ? (({id, name, description, script, interpreter, cluster_args, expected_exit_code, work_units, cluster_work_units, log_prefix, task_repository}) => ({
                id,
                name,
                description,
                script,
                interpreter,
                cluster_args: JSON.parse(cluster_args).arguments[0],
                expected_exit_code,
                work_units,
                cluster_work_units,
                log_prefix,
                task_repository
            }))(this.props.sourceTaskDefinition) : {
                id: null,
                name: "",
                description: "",
                script: "",
                interpreter: "none",
                cluster_args: "",
                expected_exit_code: 0,
                work_units: 1,
                cluster_work_units: 1,
                log_prefix: "",
                task_repository: null
            },
            script_arguments: props.sourceTaskDefinition ? taskArgsToUI(JSON.parse(props.sourceTaskDefinition.script_args)) : {arguments: []},
            work_units: props.sourceTaskDefinition ? props.sourceTaskDefinition.work_units.toString() : "1",
            cluster_work_units: props.sourceTaskDefinition ? props.sourceTaskDefinition.cluster_work_units.toString() : "1",
            expected_exit_code: props.sourceTaskDefinition ? props.sourceTaskDefinition.expected_exit_code.toString() : "0"
        };
    }

    private applySourceTaskDefinition() {
        if (this.props.sourceTaskDefinition) {
            this.setState({
                taskDefinition: Object.assign(this.state.taskDefinition, (({id, name, description, script, interpreter, cluster_args, expected_exit_code, work_units, cluster_work_units, log_prefix, task_repository}) => ({
                    id,
                    name,
                    description,
                    script,
                    interpreter,
                    cluster_args: JSON.parse(cluster_args).arguments[0],
                    expected_exit_code,
                    work_units,
                    cluster_work_units,
                    log_prefix,
                    task_repository
                }))(this.props.sourceTaskDefinition)),
                script_arguments: this.props.sourceTaskDefinition ? taskArgsToUI(JSON.parse(this.props.sourceTaskDefinition.script_args)) : {arguments: []},
                work_units: this.props.sourceTaskDefinition ? this.props.sourceTaskDefinition.work_units.toString() : "1",
                expected_exit_code: this.props.sourceTaskDefinition && this.props.sourceTaskDefinition.expected_exit_code ? this.props.sourceTaskDefinition.expected_exit_code.toString() : "0"
            });
        }
    }

    private get isNameValid(): boolean {
        return !!this.state.taskDefinition.name;
    }

    private onNameChanged(evt: ChangeEvent<any>) {
        this.setState({
            taskDefinition: Object.assign(this.state.taskDefinition, {name: evt.target.value})
        });
    }

    private get isScriptValid(): boolean {
        return !!this.state.taskDefinition.script && (this.state.taskDefinition.task_repository === null || !pathIsAbsolute.posix(this.state.taskDefinition.script));
    }

    private onScriptChanged(evt: ChangeEvent<any>) {
        this.setState({
            taskDefinition: Object.assign(this.state.taskDefinition, {script: evt.target.value})
        });
    }

    private onChangeTaskRepository(task_repository: ITaskRepository) {
        this.setState({
            taskDefinition: Object.assign(this.state.taskDefinition, {task_repository})
        });
    }

    private get isExpectedExitCodeValid(): boolean {
        const eec = parseInt(this.state.expected_exit_code);

        return !isNaN(eec);
    }

    private onExpectedExitCodeChanged(evt: ChangeEvent<any>) {
        this.setState({
            expected_exit_code: evt.target.value
        });
    }

    private get isWorkUnitsValid(): boolean {
        const wu = parseFloat(this.state.work_units);

        return !isNaN(wu);
    }

    private onWorkUnitsChanged(evt: ChangeEvent<any>) {
        this.setState({
            work_units: evt.target.value
        });
    }

    /*
    private get isClusterWorkUnitsValid(): boolean {
        const wu = parseFloat(this.state.cluster_work_units);

        return !isNaN(wu);
    }

    private onClusterWorkUnitsChanged(evt: ChangeEvent<any>) {
        this.setState({
            cluster_work_units: evt.target.value
        });
    }
    */

    private onAddArgument() {
        const args = this.state.script_arguments;
        args.arguments = args.arguments.concat([{value: "", type: TaskArgumentType.Literal, nonce: uuid.v4()}]);
        this.setState({script_arguments: args});
    }

    private onRemoveArgument(index: number) {
        const args = this.state.script_arguments;
        args.arguments.splice(index, 1);
        args.arguments = args.arguments.slice();
        this.setState({script_arguments: args});
    }

    private onMoveArgument(index: number) {
        const args = this.state.script_arguments;
        const arg = args.arguments.splice(Math.abs(index), 1);
        args.arguments.splice(index < 0 ? Math.abs(index) - 1 : index + 1, 0, arg[0]);
        this.setState({script_arguments: args});
    }

    private onArgumentChanged(index: number, evt, data: any) {
        const args = this.state.script_arguments;
        args.arguments[index].value = data.value;
        if (data.value.startsWith("${") && data.value.endsWith("}") && data.value.length > 3) {
            args.arguments[index].type = TaskArgumentType.Parameter;
        }
        this.setState({script_arguments: args});
    }

    private onClusterArgumentsChanged(evt: ChangeEvent<any>) {
        this.setState({
            taskDefinition: Object.assign(this.state.taskDefinition, {cluster_args: evt.target.value})
        });
    }

    private onLogPrefixChanged(evt: ChangeEvent<any>) {
        this.setState({
            taskDefinition: Object.assign(this.state.taskDefinition, {log_prefix: evt.target.value})
        });
    }

    private onDescriptionChanged(evt: ChangeEvent<any>) {
        this.setState({
            taskDefinition: Object.assign(this.state.taskDefinition, {description: evt.target.value})
        });
    }

    private renderFeedback() {
        if (this.state.taskDefinition.script) {
            if (this.state.taskDefinition.task_repository !== null && pathIsAbsolute.posix(this.state.taskDefinition.script)) {
                return (<span>The script can not contain an absolute path when part of a repository</span>);
            }
        }

        return null;
    }

    private canCreateOrUpdate() {
        return this.isNameValid && this.isScriptValid && this.isWorkUnitsValid;
    }

    private onCreateOrUpdate() {
        const taskDefinition = Object.assign((({id, name, description, script, interpreter, cluster_args, work_units, cluster_work_units, log_prefix, task_repository}) => ({
            id: this.props.mode == DialogMode.Create ? undefined : id,
            name,
            description,
            script,
            interpreter,
            cluster_args: JSON.stringify({arguments: [cluster_args]}),
            work_units,
            cluster_work_units,
            log_prefix,
            task_repository_id: task_repository ? task_repository.id : null
        }))(this.state.taskDefinition), {
            script_args: JSON.stringify(uiTasksArgsToArgs(this.state.script_arguments)),
            work_units: parseFloat(this.state.work_units),
            expected_exit_code: parseFloat(this.state.expected_exit_code)
        });

        this.props.onAccept(taskDefinition)
    }

    public render() {
        const title = this.props.mode === DialogMode.Create ? "Add New Task" : "Update Task";

        const taskArgumentListProps = {
            arguments: this.state.script_arguments.arguments,
            onAddArgument: () => this.onAddArgument(),
            onArgumentChanged: (i, e, d) => this.onArgumentChanged(i, e, d),
            itemModifyProps: {
                onRemoveArgument: (index) => this.onRemoveArgument(index),
                onMoveArgument: (index) => this.onMoveArgument(index)
            },
            style: {maxHeight: 300, overflowY: "scroll"}
        };

        return (
            <Modal trigger={this.props.trigger} open={this.props.isOpen} onOpen={() => this.applySourceTaskDefinition()}>
                <Modal.Header style={{backgroundColor: "#5bc0de", color: "white"}}>
                    {title}
                </Modal.Header>
                <Modal.Content>
                    <Form size="small">
                        <Form.Input label="Name" value={this.state.taskDefinition.name} error={!this.isNameValid}
                                    placeholder="name is required"
                                    onChange={(evt: any) => this.onNameChanged(evt)}/>
                        <Form.Field>
                            <label>Repository</label>
                            <TaskRepositorySelect repositories={this.props.taskRepositories}
                                                  selectedRepository={this.state.taskDefinition.task_repository}
                                                  onSelectRepository={t => this.onChangeTaskRepository(t)}/>
                        </Form.Field>
                        <Form.Input label="Script" value={this.state.taskDefinition.script}
                                    error={!this.isScriptValid}
                                    placeholder="(required)"
                                    onChange={(evt: any) => this.onScriptChanged(evt)}/>
                        {this.renderFeedback()}
                        <div className="field" style={{maxHeight: 300, overflowY: "auto"}}>
                            <label>Additional Arguments</label>
                            <TaskArgumentList {...taskArgumentListProps}/>
                        </div>
                        <Form.Input label="Cluster Arguments (for bsub, e.g. -n 4)"
                                    value={this.state.taskDefinition.cluster_args}
                                    placeholder="(optional)"
                                    onChange={(evt: any) => this.onClusterArgumentsChanged(evt)}/>
                        <Form.Input label="Expected Exit Code" value={this.state.expected_exit_code}
                                    error={!this.isExpectedExitCodeValid}
                                    placeholder="0"
                                    onChange={(evt: any) => this.onExpectedExitCodeChanged(evt)}/>
                        <Form.Input label="Work Units" value={this.state.work_units} error={!this.isWorkUnitsValid}
                                    placeholder="(required)"
                                    onChange={(evt: any) => this.onWorkUnitsChanged(evt)}/>

                        {/*
                        <Form.Input label="Cluster Work Units (currently no effect)"
                                    value={this.state.cluster_work_units} error={!this.isClusterWorkUnitsValid}
                                    placeholder="(required)"
                                    onChange={(evt: any) => this.onClusterWorkUnitsChanged(evt)}/>
                        */}
                        <Form.Input label="Log Prefix" value={this.state.taskDefinition.log_prefix}
                                    placeholder={this.state.taskDefinition.id ? this.state.taskDefinition.id.slice(0, 8) : "(auto-generated)"}
                                    onChange={(evt: any) => this.onLogPrefixChanged(evt)}/>
                        <Form.TextArea label="Description" value={this.state.taskDefinition.description}
                                       placeholder="(optional)"
                                       onChange={(evt: any) => this.onDescriptionChanged(evt)}/>
                    </Form>
                    {this.props.sourceTaskDefinition ? <div style={{
                        width: "100%",
                        textAlign: "right"
                    }}>{`(id: ${this.props.sourceTaskDefinition.id})`}</div> : null}
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={() => this.props.onCancel()}>Cancel</Button>
                    {(this.props.mode === DialogMode.Update && this.props.sourceTaskDefinition) ?
                        <Button onClick={() => this.applySourceTaskDefinition()}>Revert</Button> : null}
                    <Button onClick={() => this.onCreateOrUpdate()}
                            disabled={!this.canCreateOrUpdate()} style={{marginLeft: "30px"}}>
                        {this.props.mode === DialogMode.Update ? "Update" : "Create"}
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

const TaskArgumentList = (props) => (
    <List size="mini">
        <List.Item key="add">
            <List.Content>
                <Button size="mini" icon labelPosition="left" onClick={() => props.onAddArgument()}>
                    <Icon name="add"/>
                    Add Argument
                </Button>
            </List.Content>
        </List.Item>
        {props.arguments.map((a, idx) => {
            return (
                <List.Item key={a.nonce}>
                    <List.Content>
                        <Input fluid defaultValue={a.value} labelPosition="right"
                               onChange={(e, d) => props.onArgumentChanged(idx, e, d)}>
                            <Label.Group style={{marginTop: "4px"}}>
                                <Label content={idx + 1} circular/>
                                <Label content={TaskArgumentType[a.type].toString()}
                                       style={{minWidth: 80, textAlign: "center"}}
                                       color={a.type === TaskArgumentType.Literal ? "green" : "blue"}/>
                            </Label.Group>
                            <input/>
                            <Button.Group size="mini">
                                <Button icon="long arrow up" disabled={idx === 0}
                                        onClick={() => props.itemModifyProps.onMoveArgument(-idx)}/>
                                <Button icon="long arrow down" disabled={idx === (props.arguments.length - 1)}
                                        onClick={() => props.itemModifyProps.onMoveArgument(idx)}/>
                                <Button icon="remove" onClick={() => props.itemModifyProps.onRemoveArgument(idx)}/>
                            </Button.Group>
                        </Input>
                    </List.Content>
                </List.Item>
            )
        })}
    </List>
);
