import * as React from "react";
import {Modal, Button, FormGroup, FormControl, ControlLabel, HelpBlock} from "react-bootstrap";
import {FormControlValidationState} from "../../../util/bootstrapUtils";
import {ChangeEvent} from "react";
import * as pathIsAbsolute from "path-is-absolute";
import {ITaskDefinition} from "../../../models/taskDefinition";
import {TaskRepositorySelect} from "../../helpers/TaskRepositorySelect";
import {ITaskRepository} from "../../../models/taskRepository";

export enum TaskDefinitionDialogMode {
    Create,
    Update
}

interface IEditTaskDefinitionProps {
    mode: TaskDefinitionDialogMode;
    show: boolean;
    taskRepositories: ITaskRepository[];
    sourceTaskDefinition?: ITaskDefinition;

    onCancel(): void;
    onAccept(taskDefinition: ITaskDefinition): void;
}

interface IEditTaskDefinitionState {
    taskDefinition?: ITaskDefinition;
    work_units?: string;
}

export class EditTaskDefinitionDialog extends React.Component<IEditTaskDefinitionProps, IEditTaskDefinitionState> {
    public constructor(props: IEditTaskDefinitionProps) {
        super(props);

        this.state = {
            taskDefinition: props.sourceTaskDefinition ? (({id, name, description, script, interpreter, args, work_units, task_repository}) => ({
                id,
                name,
                description,
                script,
                interpreter,
                args,
                work_units,
                task_repository
            }))(this.props.sourceTaskDefinition) : {
                id: null,
                name: "",
                description: "",
                script: "",
                interpreter: "none",
                args: "",
                work_units: 1,
                task_repository: null
            },
            work_units: props.sourceTaskDefinition ? props.sourceTaskDefinition.work_units.toString() : "1"
        };
    }

    public componentWillReceiveProps(props: IEditTaskDefinitionProps) {
        this.applySourceTaskDefinition();
    }

    private applySourceTaskDefinition() {
        if (this.props.sourceTaskDefinition) {
            this.setState({
                taskDefinition: Object.assign(this.state.taskDefinition, (({id, name, description, script, interpreter, args, work_units, task_repository}) => ({
                    id,
                    name,
                    description,
                    script,
                    interpreter,
                    args,
                    work_units,
                    task_repository
                }))(this.props.sourceTaskDefinition))
            });
        }
    }

    private get isNameValid(): boolean {
        return !!this.state.taskDefinition.name;
    }

    private get nameValidationState(): FormControlValidationState {
        return this.isNameValid ? null : "error";
    }

    private onNameChanged(evt: ChangeEvent<any>) {
        this.setState({
            taskDefinition: Object.assign(this.state.taskDefinition, {name: evt.target.value})
        });
    }

    private get isScriptValid(): boolean {
        return !!this.state.taskDefinition.script && (this.state.taskDefinition.task_repository === null || !pathIsAbsolute.posix(this.state.taskDefinition.script));
    }

    private get scriptValidationState(): FormControlValidationState {
        return this.isScriptValid ? null : "error";
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

    private get isWorkUnitsValid(): boolean {
        const wu = parseFloat(this.state.work_units);

        return !isNaN(wu);
    }

    private get workUnitIsValidationState(): FormControlValidationState {
        return this.isWorkUnitsValid ? null : "error";
    }

    private onWorkUnitsChanged(evt: ChangeEvent<any>) {
        this.setState({
            work_units: evt.target.value
        });
    }

    private onArgumentsChanged(evt: ChangeEvent<any>) {
        this.setState({
            taskDefinition: Object.assign(this.state.taskDefinition, {args: evt.target.value})
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
                return (<HelpBlock>The script can not contain an absolute path when part of a repository</HelpBlock>);
            }
        }

        return null;
    }

    private canCreateOrUpdate() {
        return this.isNameValid && this.isScriptValid && this.isWorkUnitsValid;
    }

    private onCreateOrUpdate() {
        const taskDefinition = Object.assign((({id, name, description, script, interpreter, args, work_units, task_repository}) => ({
            id,
            name,
            description,
            script,
            interpreter,
            args,
            work_units,
            task_repository_id: task_repository ? task_repository.id : null
        }))(this.state.taskDefinition), {
            work_units: parseFloat(this.state.work_units)
        });

        this.props.onAccept(taskDefinition)
    }

    public render() {
        const title = this.props.mode === TaskDefinitionDialogMode.Create ? "Add New Task" : "Update Task";

        return (
            <Modal show={this.props.show} onHide={this.props.onCancel}
                   aria-labelledby="create-task-dialog">
                <Modal.Header style={{backgroundColor: "#5bc0de", color: "white"}} closeButton>
                    <Modal.Title id="create-task-dialog">{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <FormGroup bsSize="sm" controlId="name" validationState={this.nameValidationState}>
                        <ControlLabel>Name</ControlLabel>
                        <FormControl type="text" value={this.state.taskDefinition.name}
                                     placeholder="name is required"
                                     onChange={(evt: any) => this.onNameChanged(evt)}/>
                    </FormGroup>
                    <FormGroup bsSize="sm" controlId="brain-area-group">
                        <ControlLabel>Repository</ControlLabel>
                        <TaskRepositorySelect idName="task-repository"
                                              options={this.props.taskRepositories}
                                              selectedOption={this.state.taskDefinition.task_repository}
                                              multiSelect={false}
                                              placeholder="(recommended)"
                                              onSelect={(t: ITaskRepository) => this.onChangeTaskRepository(t)}/>
                    </FormGroup>
                    <FormGroup bsSize="sm" controlId="script" validationState={this.scriptValidationState}>
                        <ControlLabel>Script</ControlLabel>
                        <FormControl type="text" value={this.state.taskDefinition.script}
                                     placeholder="script is required"
                                     onChange={evt => this.onScriptChanged(evt)}/>
                        {this.renderFeedback()}
                    </FormGroup>
                    <FormGroup bsSize="sm" controlId="arguments">
                        <ControlLabel>Additional Arguments</ControlLabel>
                        <FormControl type="text" value={this.state.taskDefinition.args}
                                     placeholder="(optional)"
                                     onChange={(evt: any) => this.onArgumentsChanged(evt)}/>
                    </FormGroup>
                    <FormGroup bsSize="sm" controlId="work_units" validationState={this.workUnitIsValidationState}>
                        <ControlLabel>Work Units</ControlLabel>
                        <FormControl type="text" value={this.state.work_units}
                                     placeholder="required"
                                     onChange={(evt: any) => this.onWorkUnitsChanged(evt)}/>
                    </FormGroup>
                    <FormGroup bsSize="sm" controlId="description">
                        <ControlLabel>Description</ControlLabel>
                        <FormControl componentClass="textarea" value={this.state.taskDefinition.description}
                                     placeholder="(optional)" style={{maxWidth: "100%"}}
                                     onChange={evt => this.onDescriptionChanged(evt)}/>
                    </FormGroup>
                    {this.props.sourceTaskDefinition ? <div style={{
                        width: "100%",
                        textAlign: "right"
                    }}>{`(id: ${this.props.sourceTaskDefinition.id})`}</div> : null}
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="default" onClick={() => this.props.onCancel()}>Cancel</Button>
                    {(this.props.mode === TaskDefinitionDialogMode.Update && this.props.sourceTaskDefinition) ?
                        <Button bsStyle="default"
                                onClick={() => this.applySourceTaskDefinition()}>Revert</Button> : null}
                    <Button bsStyle="success" onClick={() => this.onCreateOrUpdate()}
                            disabled={!this.canCreateOrUpdate()} style={{marginLeft: "30px"}}>
                        {this.props.mode === TaskDefinitionDialogMode.Update ? "Update" : "Create"}
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
