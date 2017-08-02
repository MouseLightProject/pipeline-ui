import * as React from "react";
import {Modal, Button, FormGroup, FormControl, ControlLabel} from "react-bootstrap";
import {FormControlValidationState} from "../../util/bootstrapUtils";
import {ChangeEvent} from "react";
import * as pathIsAbsolute from "path-is-absolute";

import {IPipelineStage} from "../../models/pipelineStage";
import {IProject} from "../../models/project";
import {ProjectSelect} from "../helpers/ProjectSelect";
import {PipelineStageSelect} from "../helpers/PipelineStageSelect";
import {ITaskDefinition} from "../../models/taskDefinition";
import {TaskSelect} from "../helpers/TaskSelect";

export enum PipelineStageDialogMode {
    Create,
    Update
}

function assignStage(stage: IPipelineStage) {
    return stage ? (({id, name, description, project, task, previous_stage, dst_path, function_type}) => ({
        id,
        name,
        description,
        project,
        task,
        previous_stage,
        dst_path,
        function_type
    }))(stage) : {
        id: null,
        name: "",
        description: "",
        project: null,
        task: null,
        previous_stage: null,
        dst_path: "",
        function_type: 0
    }
}

interface IEditStageProps {
    mode: PipelineStageDialogMode;
    show: boolean;
    projects: IProject[];
    tasks: ITaskDefinition[];
    sourceStage?: IPipelineStage;

    onCancel(): void;
    onAccept(stage: IPipelineStage): void;
}

interface IEditStageState {
    stage?: IPipelineStage;
}

export class EditPipelineStageDialog extends React.Component<IEditStageProps, IEditStageState> {
    public constructor(props: IEditStageProps) {
        super(props);
        this.state = {
            stage: assignStage(props.sourceStage)
        };
    }

    public componentWillReceiveProps(props: IEditStageProps) {
        if (props.sourceStage) {
            this.setState({
                stage: assignStage(props.sourceStage)
            })
        }
    }

    private get isNameValid(): boolean {
        return !!this.state.stage.name;
    }

    private get nameValidationState(): FormControlValidationState {
        return this.isNameValid ? null : "error";
    }

    private onNameChanged(evt: ChangeEvent<any>) {
        this.setState({
            stage: Object.assign(this.state.stage, {name: evt.target.value})
        });
    }

    private onDescriptionChanged(evt: ChangeEvent<any>) {
        this.setState({
            stage: Object.assign(this.state.stage, {description: evt.target.value})
        });
    }

    private get isOutputPathValid(): boolean {
        return !!this.state.stage.dst_path && pathIsAbsolute(this.state.stage.dst_path);
    }

    private get outputPathValidationState(): FormControlValidationState {
        return this.isOutputPathValid ? null : "error";
    }

    private onOutputPathChanged(evt: ChangeEvent<any>) {
        this.setState({
            stage: Object.assign(this.state.stage, {dst_path: evt.target.value})
        });
    }

    private get isProjectValid(): boolean {
        return this.state.stage.project !== null;
    }

    private onChangeProject(project: IProject) {
        this.setState({
            stage: Object.assign(this.state.stage, {project})
        });
    }

    private onChangePreviousStage(previous_stage: IPipelineStage) {
        this.setState({
            stage: Object.assign(this.state.stage, {previous_stage})
        });
    }

    private get isTaskValid(): boolean {
        return this.state.stage.task !== null;
    }

    private onChangeTask(task: ITaskDefinition) {
        this.setState({
            stage: Object.assign(this.state.stage, {task})
        });
    }

    private canCreateOrUpdate() {
        return this.isNameValid && this.isProjectValid && this.isTaskValid;
    }

    private onCreateOrUpdate() {
        const stageInput: IPipelineStage = Object.assign((({id, name, description, project, task, previous_stage, dst_path, function_type}) => ({
            id: this.props.mode == PipelineStageDialogMode.Create ? undefined : id,
            name,
            description,
            project_id: project ? project.id : null,
            task_id: task ? task.id : null,
            previous_stage_id: previous_stage ? previous_stage.id : null,
            dst_path,
            function_type
        }))(this.state.stage));

        this.props.onAccept(stageInput)
    }

    public render() {
        const title = this.props.mode === PipelineStageDialogMode.Create ? "Add New Stage" : "Update Stage";

        const stages = (this.state.stage.project && this.state.stage.project.stages) ? this.state.stage.project.stages.filter(s => s.id !== this.state.stage.id) : [];

        return (
            <Modal show={this.props.show} onHide={this.props.onCancel}
                   aria-labelledby="create-stage-dialog">
                <Modal.Header style={{backgroundColor: "#5bc0de", color: "white"}} closeButton>
                    <Modal.Title id="create-stage-dialog">{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <FormGroup bsSize="sm" controlId="name" validationState={this.nameValidationState}>
                        <ControlLabel>Name</ControlLabel>
                        <FormControl type="text" value={this.state.stage.name}
                                     placeholder="name is required"
                                     onChange={(evt: any) => this.onNameChanged(evt)}/>
                    </FormGroup>
                    <FormGroup bsSize="sm" controlId="description">
                        <ControlLabel>Description</ControlLabel>
                        <FormControl componentClass="textarea" value={this.state.stage.description}
                                     placeholder="(optional)" style={{maxWidth: "100%"}}
                                     onChange={evt => this.onDescriptionChanged(evt)}/>
                    </FormGroup>
                    <FormGroup bsSize="sm" controlId="outputPath" validationState={this.outputPathValidationState}>
                        <ControlLabel>Output Path</ControlLabel>
                        <FormControl type="text" value={this.state.stage.dst_path}
                                     placeholder="output path is required"
                                     onChange={(evt: any) => this.onOutputPathChanged(evt)}/>
                    </FormGroup>
                    <FormGroup bsSize="sm" controlId="stage-project">
                        <ControlLabel>Project</ControlLabel>
                        <ProjectSelect idName="stage-project"
                                              options={this.props.projects}
                                              selectedOption={this.state.stage.project}
                                              multiSelect={false}
                                              placeholder="(required)"
                                              onSelect={(p: IProject) => this.onChangeProject(p)}/>
                    </FormGroup>
                    <FormGroup bsSize="sm" controlId="stage-previous-stage">
                        <ControlLabel>Parent Stage</ControlLabel>
                        <PipelineStageSelect idName="stage-previous-stage"
                                       options={stages}
                                       selectedOption={this.state.stage.previous_stage}
                                       multiSelect={false}
                                       placeholder="(none - use acquisition root)"
                                       onSelect={(p: IPipelineStage) => this.onChangePreviousStage(p)}/>
                    </FormGroup>
                    <FormGroup bsSize="sm" controlId="stage-task">
                        <ControlLabel>Task</ControlLabel>
                        <TaskSelect idName="stage-task"
                                       options={this.props.tasks}
                                       selectedOption={this.state.stage.task}
                                       multiSelect={false}
                                       placeholder="(required)"
                                       onSelect={(t: ITaskDefinition) => this.onChangeTask(t)}/>
                    </FormGroup>
                    {this.props.sourceStage ? <div style={{
                        width: "100%",
                        textAlign: "right"
                    }}>{`(id: ${this.props.sourceStage.id})`}</div> : null}
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="default" onClick={() => this.props.onCancel()}>Cancel</Button>
                    {(this.props.mode === PipelineStageDialogMode.Update && this.props.sourceStage) ?
                        <Button bsStyle="default" onClick={() => this.setState({stage: assignStage(this.props.sourceStage)})}>
                            Revert
                        </Button> : null}
                    <Button bsStyle="success" onClick={() => this.onCreateOrUpdate()}
                            disabled={!this.canCreateOrUpdate()} style={{marginLeft: "30px"}}>
                        {this.props.mode === PipelineStageDialogMode.Update ? "Update" : "Create"}
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
