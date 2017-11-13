import * as React from "react";
import {Button, Modal, Form} from "semantic-ui-react";
import {ChangeEvent} from "react";
import * as pathIsAbsolute from "path-is-absolute";

import {IPipelineStage} from "../../models/pipelineStage";
import {IProject} from "../../models/project";
import {ProjectSelect} from "../helpers/ProjectSelect";
import {PipelineStageSelect} from "../helpers/PipelineStageSelect";
import {ITaskDefinition} from "../../models/taskDefinition";
import {TaskSelect} from "../helpers/TaskSelect";
import {DialogMode} from "../helpers/DialogUtils";
import {
    PIPELINE_STAGE_TYPE_MAP_TILE, PIPELINE_STAGE_TYPES, PipelineStageMethods,
    PipelineStageType
} from "../../models/pipelineStageType";
import {PipelineStageTypeSelect} from "../helpers/PipelineStageTypeSelect";

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
        function_type: PipelineStageMethods.MapTile
    }
}

interface IEditStageProps {
    mode: DialogMode;
    show: boolean;
    projects: IProject[];
    tasks: ITaskDefinition[];
    sourceStage?: IPipelineStage;
    element: any;

    onCancel(): void;
    onAccept(stage: IPipelineStage): void;
}

interface IEditStageState {
    stage?: IPipelineStage;
    pipelineStageType?: PipelineStageType;
}

export class EditPipelineStageDialog extends React.Component<IEditStageProps, IEditStageState> {
    public constructor(props: IEditStageProps) {
        super(props);
        this.state = {
            stage: assignStage(props.sourceStage),
            pipelineStageType: props.sourceStage ? PipelineStageType.fromMethodId(props.sourceStage.function_type) : PIPELINE_STAGE_TYPE_MAP_TILE
        };
    }

    public componentWillReceiveProps(props: IEditStageProps) {
        if (props.sourceStage) {
            this.setState({
                stage: assignStage(props.sourceStage),
                pipelineStageType: props.sourceStage ? PipelineStageType.fromMethodId(props.sourceStage.function_type) : PIPELINE_STAGE_TYPE_MAP_TILE
            })
        }
    }

    private get isNameValid(): boolean {
        return !!this.state.stage.name;
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
            stage: Object.assign(this.state.stage, {project, previous_stage: null})
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

    private onPipelineStageTypeChanged(p: PipelineStageType) {
        this.setState({
            pipelineStageType: p
        });
    }

    private canCreateOrUpdate() {
        return this.isNameValid && this.isProjectValid && this.isTaskValid;
    }

    private onCreateOrUpdate() {
        const stageInput: IPipelineStage = Object.assign((({id, name, description, project, task, previous_stage, dst_path}) => ({
            id: this.props.mode == DialogMode.Create ? undefined : id,
            name,
            description,
            project_id: project ? project.id : null,
            task_id: task ? task.id : null,
            previous_stage_id: previous_stage ? previous_stage.id : null,
            dst_path,
        }))(this.state.stage), {
            function_type: this.state.pipelineStageType.option
        });

        this.props.onAccept(stageInput)
    }

    public render() {
        const title = this.props.mode === DialogMode.Create ? "Add New Stage" : "Update Stage";

        const stages = (this.state.stage.project && this.state.stage.project.stages) ? this.state.stage.project.stages.filter(s => s.id !== this.state.stage.id) : [];

        return (
            <Modal trigger={this.props.element} open={this.props.show}>
                <Modal.Header style={{backgroundColor: "#5bc0de", color: "white"}}>
                    {title}
                </Modal.Header>
                <Modal.Content>
                    <Form size="small">
                        <Form.Input label="Name" value={this.state.stage.name} placeholder="name is required"
                                    error={!this.isNameValid}
                                    onChange={(evt: any) => this.onNameChanged(evt)}/>
                        <Form.TextArea label="Description" value={this.state.stage.description} placeholder="(optional)"
                                       onChange={evt => this.onDescriptionChanged(evt)}/>
                        <Form.Input label="Output Path" value={this.state.stage.dst_path}
                                    placeholder="output path is required"
                                    error={!this.isOutputPathValid}
                                    onChange={(evt: any) => this.onOutputPathChanged(evt)}/>
                        <Form.Field>
                            <label>Project</label>
                            <ProjectSelect projects={this.props.projects} selectedProject={this.state.stage.project}
                                           onSelectProject={p => this.onChangeProject(p)}/>
                        </Form.Field>
                        <Form.Field>
                            <label>Parent Stage</label>
                            <PipelineStageSelect pipelineStages={stages}
                                                 selectedPipelineStage={this.state.stage.previous_stage}
                                                 onSelectPipelineStage={p => this.onChangePreviousStage(p)}/>
                        </Form.Field>
                        <Form.Field>
                            <label>Task</label>
                            <TaskSelect tasks={this.props.tasks} selectedTask={this.state.stage.task}
                                        onSelectTask={t => this.onChangeTask(t)}/>
                        </Form.Field>
                        <Form.Field>
                            <label>Method</label>
                            <PipelineStageTypeSelect pipelineStageTypes={PIPELINE_STAGE_TYPES}
                                                     selectedPipelineStageType={this.state.pipelineStageType}
                                                     onSelectPipelineStageType={t => this.onPipelineStageTypeChanged(t)}/>
                        </Form.Field>
                    </Form>
                    {this.props.sourceStage ? <div style={{
                        width: "100%",
                        textAlign: "right"
                    }}>{`(id: ${this.props.sourceStage.id})`}</div> : null}
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={() => this.props.onCancel()}>Cancel</Button>
                    {(this.props.mode === DialogMode.Update && this.props.sourceStage) ?
                        <Button
                            onClick={() => this.setState({stage: assignStage(this.props.sourceStage)})}>Revert</Button> : null}
                    <Button onClick={() => this.onCreateOrUpdate()}
                            disabled={!this.canCreateOrUpdate()} style={{marginLeft: "30px"}}>
                        {this.props.mode === DialogMode.Update ? "Update" : "Create"}
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}
