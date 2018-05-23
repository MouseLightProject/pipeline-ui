import * as React from "react";
import {Button, Modal, Form} from "semantic-ui-react";

import {ChangeEvent} from "react";
import * as pathIsAbsolute from "path-is-absolute";

import {IProject, IProjectInput} from "../../models/project";
import {DialogMode} from "../helpers/DialogUtils";


interface IEditProjectProps {
    trigger: any;
    isOpen: boolean;
    mode: DialogMode;
    sourceProject?: IProject;

    onCancel(): void;

    onAccept(project: IProjectInput): void;
}

interface IEditProjectState {
    project?: IProject;
}

export class EditProjectDialog extends React.Component<IEditProjectProps, IEditProjectState> {
    public constructor(props: IEditProjectProps) {
        super(props);

        this.state = {
            project: props.sourceProject ? (({
                                                 id, name, description, root_path, log_root_path, sample_number,
                                                 region_x_min, region_x_max, region_y_min, region_y_max, region_z_min, region_z_max
                                             }) => ({
                id,
                name,
                description,
                root_path,
                log_root_path,
                sample_number,
                region_x_min,
                region_x_max,
                region_y_min,
                region_y_max,
                region_z_min,
                region_z_max
            }))(this.props.sourceProject) : {
                id: null,
                name: "",
                description: "",
                root_path: "",
                log_root_path: "",
                sample_number: null,
                region_x_min: null,
                region_x_max: null,
                region_y_min: null,
                region_y_max: null,
                region_z_min: null,
                region_z_max: null,

            }
        };
    }

    private applySourceProject() {
        if (this.props.sourceProject) {
            this.setState({
                project: Object.assign(this.state.project, (({
                                                                 id, name, description, root_path, log_root_path, sample_number,
                                                                 region_x_min, region_x_max, region_y_min, region_y_max, region_z_min, region_z_max
                                                             }) => ({
                    id,
                    name,
                    description,
                    root_path,
                    log_root_path,
                    sample_number,
                    region_x_min,
                    region_x_max,
                    region_y_min,
                    region_y_max,
                    region_z_min,
                    region_z_max
                }))(this.props.sourceProject))
            });
        }
    }

    private get isNameValid(): boolean {
        return !!this.state.project.name;
    }

    private onNameChanged(evt: ChangeEvent<any>) {
        this.setState({
            project: Object.assign(this.state.project, {name: evt.target.value})
        });
    }

    private get isRootPathValid(): boolean {
        return !!this.state.project.root_path && pathIsAbsolute.posix(this.state.project.root_path);
    }

    private onRootPathChanged(evt: ChangeEvent<any>) {
        this.setState({
            project: Object.assign(this.state.project, {root_path: evt.target.value})
        });
    }

    private get isLogRootPathValid(): boolean {
        return !this.state.project.log_root_path || pathIsAbsolute.posix(this.state.project.log_root_path);
    }

    private onLogRootPathChanged(evt: ChangeEvent<any>) {
        this.setState({
            project: Object.assign(this.state.project, {log_root_path: evt.target.value})
        });
    }

    private onDescriptionChanged(evt: ChangeEvent<any>) {
        this.setState({
            project: Object.assign(this.state.project, {description: evt.target.value})
        });
    }

    private onSampleNumberChanged(evt: ChangeEvent<any>) {
        let sampleNumber = null;

        if (evt.target.value.length > 0) {
            const n = parseInt(evt.target.value);

            if (!isNaN(n)) {
                sampleNumber = n;
            }
        }

        this.setState({
            project: Object.assign(this.state.project, {sample_number: sampleNumber})
        });
    }

    private onSampleRegionChanged(propertyName: string, evt: ChangeEvent<any>) {
        let limit = null;

        if (evt.target.value.length > 0) {
            const n = parseInt(evt.target.value);

            if (!isNaN(n) && n >= 0) {
                limit = n;
            }
        }

        const obj = {};

        obj[propertyName] = limit;

        console.log(obj);

        this.setState({
            project: Object.assign(this.state.project, obj)
        });
    }

    private canCreateOrUpdate() {
        return this.isNameValid && this.isRootPathValid;
    }

    private onCreateOrUpdate() {
        const projectInput: IProjectInput = Object.assign((({
                                                                id, name, description, root_path, log_root_path, sample_number,
                                                                region_x_min, region_x_max, region_y_min, region_y_max, region_z_min, region_z_max
                                                            }) => ({
            id: this.props.mode == DialogMode.Create ? undefined : id,
            name,
            description,
            root_path,
            log_root_path,
            sample_number,
            region_bounds: {
                x_min: region_x_min,
                x_max: region_x_max,
                y_min: region_y_min,
                y_max: region_y_max,
                z_min: region_z_min,
                z_max: region_z_max
            }
        }))(this.state.project));

        this.props.onAccept(projectInput)
    }

    public render() {
        const title = this.props.mode === DialogMode.Create ? "Add New Pipeline" : "Update Pipeline";

        return (
            <Modal trigger={this.props.trigger} open={this.props.isOpen} onOpen={() => this.applySourceProject()}>
                <Modal.Header style={{backgroundColor: "#5bc0de", color: "white"}}>
                    {title}
                </Modal.Header>
                <Modal.Content image>
                    <Modal.Description>
                        <Form size="small">
                            <Form.Input label="Name" value={this.state.project.name} error={!this.isNameValid}
                                        onChange={(evt: any) => this.onNameChanged(evt)}/>
                            <Form.Input label="Root Path" value={this.state.project.root_path} error={!this.isRootPathValid} onChange={(evt: any) => this.onRootPathChanged(evt)}/>
                            <Form.Input label="Sample Number" value={this.state.project.sample_number !== null ? this.state.project.sample_number : ""} onChange={(evt: any) => this.onSampleNumberChanged(evt)}/>
                            <Form.Input label="Log Root Path" value={this.state.project.log_root_path !== null ? this.state.project.log_root_path : ""} error={!this.isLogRootPathValid} onChange={(evt: any) => this.onLogRootPathChanged(evt)}/>
                            <Form.TextArea label="Description" value={this.state.project.description} onChange={evt => this.onDescriptionChanged(evt)}/>
                            <h5 style={{paddingTop: "10px"}}>Selected Region (optional)</h5>
                            <Form.Group widths="equal">
                                <Form.Input label="Min X" value={this.state.project.region_x_min !== null ? this.state.project.region_x_min : ""} onChange={evt => this.onSampleRegionChanged("region_x_min", evt)}/>
                                <Form.Input label="Max X" value={this.state.project.region_x_max !== null ? this.state.project.region_x_max : ""} onChange={evt => this.onSampleRegionChanged("region_x_max", evt)}/>
                            </Form.Group>
                            <Form.Group widths="equal">
                                <Form.Input label="Min Y" value={this.state.project.region_y_min !== null ? this.state.project.region_y_min : ""} onChange={evt => this.onSampleRegionChanged("region_y_min", evt)}/>
                                <Form.Input label="Max Y" value={this.state.project.region_y_max !== null ? this.state.project.region_y_max : ""} onChange={evt => this.onSampleRegionChanged("region_y_max", evt)}/>
                            </Form.Group>
                            <Form.Group widths="equal">
                                <Form.Input label="Min Z" value={this.state.project.region_z_min !== null ? this.state.project.region_z_min : ""} onChange={evt => this.onSampleRegionChanged("region_z_min", evt)}/>
                                <Form.Input label="Max Z" value={this.state.project.region_z_max !== null ? this.state.project.region_z_max : ""} onChange={evt => this.onSampleRegionChanged("region_z_max", evt)}/>
                            </Form.Group>
                        </Form>
                        {this.props.sourceProject ? <div style={{
                            width: "100%",
                            textAlign: "right"
                        }}>{`(id: ${this.props.sourceProject.id})`}</div> : null}
                    </Modal.Description>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={() => this.props.onCancel()}>Cancel</Button>
                    {(this.props.mode === DialogMode.Update && this.props.sourceProject) ?
                        <Button  onClick={() => this.applySourceProject()}>Revert</Button> : null}
                    <Button onClick={() => this.onCreateOrUpdate()}
                            disabled={!this.canCreateOrUpdate()} style={{marginLeft: "30px"}}>
                        {this.props.mode === DialogMode.Update ? "Update" : "Create"}
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}
