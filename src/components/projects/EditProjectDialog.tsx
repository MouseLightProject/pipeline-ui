import * as React from "react";
import {Modal, Button, FormGroup, FormControl, ControlLabel, Row, Col} from "react-bootstrap";
import {FormControlValidationState} from "../../util/bootstrapUtils";
import {ChangeEvent} from "react";
import * as pathIsAbsolute from "path-is-absolute";

import {IProject, IProjectInput} from "../../models/project";

export enum ProjectDialogMode {
    Create,
    Update
}

interface IEditProjectProps {
    mode: ProjectDialogMode;
    show: boolean;
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
                                                 id, name, description, root_path, sample_number,
                                                 region_x_min, region_x_max, region_y_min, region_y_max, region_z_min, region_z_max
                                             }) => ({
                id,
                name,
                description,
                root_path,
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

    public componentWillReceiveProps(props: IEditProjectProps) {
        this.applySourceProject();
    }

    private applySourceProject() {
        if (this.props.sourceProject) {
            this.setState({
                project: Object.assign(this.state.project, (({
                                                                 id, name, description, root_path, sample_number,
                                                                 region_x_min, region_x_max, region_y_min, region_y_max, region_z_min, region_z_max
                                                             }) => ({
                    id,
                    name,
                    description,
                    root_path,
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

    private get nameValidationState(): FormControlValidationState {
        return this.isNameValid ? null : "error";
    }

    private onNameChanged(evt: ChangeEvent<any>) {
        this.setState({
            project: Object.assign(this.state.project, {name: evt.target.value})
        });
    }

    private get isRootPathValid(): boolean {
        return !!this.state.project.root_path && pathIsAbsolute.posix(this.state.project.root_path);
    }

    private get rootPathValidationState(): FormControlValidationState {
        return this.isRootPathValid ? null : "error";
    }

    private onRootPathChanged(evt: ChangeEvent<any>) {
        this.setState({
            project: Object.assign(this.state.project, {root_path: evt.target.value})
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
                                                                id, name, description, root_path, sample_number,
                                                                region_x_min, region_x_max, region_y_min, region_y_max, region_z_min, region_z_max
                                                            }) => ({
            id: this.props.mode == ProjectDialogMode.Create ? undefined : id,
            name,
            description,
            root_path,
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
        const title = this.props.mode === ProjectDialogMode.Create ? "Add New Pipeline" : "Update Pipeline";

        return (
            <Modal show={this.props.show} onHide={this.props.onCancel}
                   aria-labelledby="create-task-dialog">
                <Modal.Header style={{backgroundColor: "#5bc0de", color: "white"}} closeButton>
                    <Modal.Title id="create-task-dialog">{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <FormGroup bsSize="sm" controlId="name" validationState={this.nameValidationState}>
                        <ControlLabel>Name</ControlLabel>
                        <FormControl type="text" value={this.state.project.name}
                                     placeholder="name is required"
                                     onChange={(evt: any) => this.onNameChanged(evt)}/>
                    </FormGroup>
                    <FormGroup bsSize="sm" controlId="script" validationState={this.rootPathValidationState}>
                        <ControlLabel>Root Path</ControlLabel>
                        <FormControl type="text" value={this.state.project.root_path}
                                     placeholder="root path is required"
                                     onChange={evt => this.onRootPathChanged(evt)}/>
                    </FormGroup>
                    <FormGroup bsSize="sm" controlId="sample-number">
                        <ControlLabel>Sample Number</ControlLabel>
                        <FormControl type="text" value={this.state.project.sample_number !== null ? this.state.project.sample_number : ""}
                                     placeholder=""
                                     onChange={evt => this.onSampleNumberChanged(evt)}/>
                    </FormGroup>
                    <FormGroup bsSize="sm" controlId="description">
                        <ControlLabel>Description</ControlLabel>
                        <FormControl componentClass="textarea" value={this.state.project.description}
                                     placeholder="(optional)" style={{maxWidth: "100%"}}
                                     onChange={evt => this.onDescriptionChanged(evt)}/>
                    </FormGroup>
                    <h5 style={{paddingTop: "10px"}}>Selected Region (optional)</h5>
                    <Row>
                        <Col xs={6}>
                            <FormGroup bsSize="sm" controlId="region_x_min">
                                <ControlLabel>Min X</ControlLabel>
                                <FormControl type="text" value={this.state.project.region_x_min !== null ? this.state.project.region_x_min : ""}
                                             placeholder=""
                                             onChange={evt => this.onSampleRegionChanged("region_x_min", evt)}/>
                            </FormGroup>
                        </Col>
                        <Col xs={6}>
                            <FormGroup bsSize="sm" controlId="region_x_max">
                                <ControlLabel>Max X</ControlLabel>
                                <FormControl type="text" value={this.state.project.region_x_max !== null ? this.state.project.region_x_max : ""}
                                             placeholder=""
                                             onChange={evt => this.onSampleRegionChanged("region_x_max", evt)}/>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6}>
                            <FormGroup bsSize="sm" controlId="region_y_min">
                                <ControlLabel>Min Y</ControlLabel>
                                <FormControl type="text" value={this.state.project.region_y_min !== null ? this.state.project.region_y_min : ""}
                                             placeholder=""
                                             onChange={evt => this.onSampleRegionChanged("region_y_min", evt)}/>
                            </FormGroup>
                        </Col>
                        <Col xs={6}>
                            <FormGroup bsSize="sm" controlId="region_y_max">
                                <ControlLabel>Max Y</ControlLabel>
                                <FormControl type="text" value={this.state.project.region_y_max !== null ? this.state.project.region_y_max : ""}
                                             placeholder=""
                                             onChange={evt => this.onSampleRegionChanged("region_y_max", evt)}/>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6}>
                            <FormGroup bsSize="sm" controlId="region_z_min">
                                <ControlLabel>Min Z</ControlLabel>
                                <FormControl type="text" value={this.state.project.region_z_min !== null ? this.state.project.region_z_min : ""}
                                             placeholder=""
                                             onChange={evt => this.onSampleRegionChanged("region_z_min", evt)}/>
                            </FormGroup>
                        </Col>
                        <Col xs={6}>
                            <FormGroup bsSize="sm" controlId="region_z_max">
                                <ControlLabel>Max Z</ControlLabel>
                                <FormControl type="text" value={this.state.project.region_z_max !== null ? this.state.project.region_z_max : ""}
                                             placeholder=""
                                             onChange={evt => this.onSampleRegionChanged("region_z_max", evt)}/>
                            </FormGroup>
                        </Col>
                    </Row>
                    {this.props.sourceProject ? <div style={{
                        width: "100%",
                        textAlign: "right"
                    }}>{`(id: ${this.props.sourceProject.id})`}</div> : null}
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="default" onClick={() => this.props.onCancel()}>Cancel</Button>
                    {(this.props.mode === ProjectDialogMode.Update && this.props.sourceProject) ?
                        <Button bsStyle="default"
                                onClick={() => this.applySourceProject()}>Revert</Button> : null}
                    <Button bsStyle="success" onClick={() => this.onCreateOrUpdate()}
                            disabled={!this.canCreateOrUpdate()} style={{marginLeft: "30px"}}>
                        {this.props.mode === ProjectDialogMode.Update ? "Update" : "Create"}
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
