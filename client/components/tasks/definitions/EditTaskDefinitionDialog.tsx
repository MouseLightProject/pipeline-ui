import * as React from "react";
import {Button, Modal, Form} from "semantic-ui-react";
import {ChangeEvent} from "react";
import * as pathIsAbsolute from "path-is-absolute";
import {ITaskDefinition} from "../../../models/taskDefinition";
import {TaskRepositorySelect} from "../../helpers/TaskRepositorySelect";
import {ITaskRepository} from "../../../models/taskRepository";
import {DialogMode} from "../../helpers/DialogUtils";

interface IEditTaskDefinitionProps {
    element: any;
    mode: DialogMode;
    show: boolean;
    taskRepositories: ITaskRepository[];
    sourceTaskDefinition?: ITaskDefinition;

    onCancel(): void;
    onAccept(taskDefinition: ITaskDefinition): void;
}

interface IEditTaskDefinitionState {
    taskDefinition?: ITaskDefinition;
    work_units?: string;
    expected_exit_code?: string;
}

export class EditTaskDefinitionDialog extends React.Component<IEditTaskDefinitionProps, IEditTaskDefinitionState> {
    public constructor(props: IEditTaskDefinitionProps) {
        super(props);

        this.state = {
            taskDefinition: props.sourceTaskDefinition ? (({id, name, description, script, interpreter, script_args, expected_exit_code, work_units, task_repository}) => ({
                id,
                name,
                description,
                script,
                interpreter,
                script_args,
                expected_exit_code,
                work_units,
                task_repository
            }))(this.props.sourceTaskDefinition) : {
                id: null,
                name: "",
                description: "",
                script: "",
                interpreter: "none",
                script_args: "",
                expected_exit_code: 0,
                work_units: 1,
                task_repository: null
            },
            work_units: props.sourceTaskDefinition ? props.sourceTaskDefinition.work_units.toString() : "1",
            expected_exit_code: props.sourceTaskDefinition ? props.sourceTaskDefinition.expected_exit_code.toString() : "0"
        };
    }

    public componentWillReceiveProps(props: IEditTaskDefinitionProps) {
        this.applySourceTaskDefinition(props);
    }

    private applySourceTaskDefinition(props: IEditTaskDefinitionProps) {
        if (props.sourceTaskDefinition) {
            this.setState({
                taskDefinition: Object.assign(this.state.taskDefinition, (({id, name, description, script, interpreter, script_args, expected_exit_code, work_units, task_repository}) => ({
                    id,
                    name,
                    description,
                    script,
                    interpreter,
                    script_args,
                    expected_exit_code,
                    work_units,
                    task_repository
                }))(props.sourceTaskDefinition)),
                work_units: props.sourceTaskDefinition ? props.sourceTaskDefinition.work_units.toString() : "1",
                expected_exit_code: props.sourceTaskDefinition ? props.sourceTaskDefinition.expected_exit_code.toString() : "0"
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

    private onArgumentsChanged(evt: ChangeEvent<any>) {
        this.setState({
            taskDefinition: Object.assign(this.state.taskDefinition, {script_args: evt.target.value})
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
        const taskDefinition = Object.assign((({id, name, description, script, interpreter, script_args, work_units, task_repository}) => ({
            id: this.props.mode == DialogMode.Create ? undefined : id,
            name,
            description,
            script,
            interpreter,
            script_args,
            work_units,
            task_repository_id: task_repository ? task_repository.id : null
        }))(this.state.taskDefinition), {
            work_units: parseFloat(this.state.work_units),
            expected_exit_code: parseFloat(this.state.expected_exit_code)
        });

        this.props.onAccept(taskDefinition)
    }

    public render() {
        const title = this.props.mode === DialogMode.Create ? "Add New Task" : "Update Task";

        return (
            <Modal trigger={this.props.element} open={this.props.show}>
                <Modal.Header style={{backgroundColor: "#5bc0de", color: "white"}} closeButton>
                    {title}
                </Modal.Header>
                <Modal.Content>
                    <Form size="small">
                        <Form.Input label="Name" value={this.state.taskDefinition.name} error={!this.isNameValid}
                                    placeholder="name is required"
                                    onChange={(evt: any) => this.onNameChanged(evt)}/>
                        <Form.Field>
                            <label>Parent Stage</label>
                            <TaskRepositorySelect repositories={this.props.taskRepositories}
                                                  selectedRepository={this.state.taskDefinition.task_repository}
                                                  onSelectRepository={t => this.onChangeTaskRepository(t)}/>
                        </Form.Field>
                        <Form.Input label="Script" value={this.state.taskDefinition.script}
                                    error={!this.isScriptValid}
                                    placeholder="(required)"
                                    onChange={(evt: any) => this.onScriptChanged(evt)}/>
                        {this.renderFeedback()}
                        <Form.Input label="Additional Arguments" value={this.state.taskDefinition.script_args}
                                    placeholder="(optional)" onChange={(evt: any) => this.onArgumentsChanged(evt)}/>
                        <Form.Input label="Expected Exit Code" value={this.state.expected_exit_code}
                                    error={!this.isExpectedExitCodeValid}
                                    placeholder="0"
                                    onChange={(evt: any) => this.onExpectedExitCodeChanged(evt)}/>
                        <Form.Input label="Work Units" value={this.state.work_units} error={!this.isWorkUnitsValid}
                                    placeholder="(required)"
                                    onChange={(evt: any) => this.onWorkUnitsChanged(evt)}/>
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
                        <Button onClick={() => this.applySourceTaskDefinition(this.props)}>Revert</Button> : null}
                    <Button onClick={() => this.onCreateOrUpdate()}
                            disabled={!this.canCreateOrUpdate()} style={{marginLeft: "30px"}}>
                        {this.props.mode === DialogMode.Update ? "Update" : "Create"}
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}
