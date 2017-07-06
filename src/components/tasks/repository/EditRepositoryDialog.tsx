import * as React from "react";
import {Modal, Button, FormGroup, FormControl, ControlLabel, HelpBlock} from "react-bootstrap";
import {FormControlValidationState} from "../../../util/bootstrapUtils";
import {ChangeEvent} from "react";
import * as pathIsAbsolute from "path-is-absolute";
import {ITaskRepository} from "../../../models/taskRepository";

export enum RepositoryDialogMode {
    Create,
    Update
}

interface IEditRepositoryProps {
    mode: RepositoryDialogMode;
    show: boolean;
    sourceRepository?: ITaskRepository;

    onCancel(): void;
    onAccept(repository: ITaskRepository): void;
}

interface IEditRepositoryState {
    repository?: ITaskRepository;
}

export class EditRepositoryDialog extends React.Component<IEditRepositoryProps, IEditRepositoryState> {
    public constructor(props: IEditRepositoryProps) {
        super(props);

        this.state = {
            repository: props.sourceRepository ? (({id, name, description, location}) => ({
                id,
                name,
                description,
                location
            }))(this.props.sourceRepository) : {
                id: null,
                name: "",
                description: "",
                location: ""
            }
        };
    }

    public componentWillReceiveProps(props: IEditRepositoryProps) {
        this.applySourceRepository();
    }

    private applySourceRepository() {
        if (this.props.sourceRepository) {
            this.setState({
                repository: Object.assign(this.state.repository, (({id, name, description, location}) => ({
                    id,
                    name,
                    description,
                    location
                }))(this.props.sourceRepository))
            });
        }
    }

    private get isNameValid(): boolean {
        return !!this.state.repository.name;
    }

    private get nameValidationState(): FormControlValidationState {
        return this.isNameValid ? null : "error";
    }

    private onNameChanged(evt: ChangeEvent<any>) {
        this.setState({
            repository: Object.assign(this.state.repository, {name: evt.target.value})
        });
    }

    private get isLocationValid(): boolean {
        return !!this.state.repository.location && this.state.repository.location.length > 1 && pathIsAbsolute.posix(this.state.repository.location);
    }

    private get locationValidationState(): FormControlValidationState {
        return this.isLocationValid ? null : "error";
    }

    private onLocationChanged(evt: ChangeEvent<any>) {
        this.setState({
            repository: Object.assign(this.state.repository, {location: evt.target.value})
        });
    }

    private onDescriptionChanged(evt: ChangeEvent<any>) {
        this.setState({
            repository: Object.assign(this.state.repository, {description: evt.target.value})
        });
    }

    private renderFeedback() {
        if (this.state.repository.location && this.state.repository.location.length > 1 && !pathIsAbsolute.posix(this.state.repository.location)) {
            return (<HelpBlock>Location must be an absolute path</HelpBlock>);
        }

        return null;
    }

    public render() {
        const title = this.props.mode === RepositoryDialogMode.Create ? "Add New Repository" : "Update Repository";

        return (
            <Modal show={this.props.show} onHide={this.props.onCancel} bsSize={null}
                   aria-labelledby="create-repository-dialog">
                <Modal.Header style={{backgroundColor: "#5bc0de", color: "white"}} closeButton>
                    <Modal.Title id="create-repository-dialog">{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Task repositories allow for collections of task definitions and scripts that can be moved as a
                        group.
                    </p>
                    <p>
                        By referencing a task repository and a relative path for the task shell script groups can be
                        moved with one update to the repository.
                    </p>
                    <p>
                        You can also change the repository to point to a different location that contains scripts with
                        the same names and any stages that reference those tasks will use the scripts in the new
                        location.
                    </p>
                    <p style={{fontStyle: "italic"}}>
                        Note that you can not delete a repository that has tasks assigned to it.
                    </p>
                    <FormGroup bsSize="sm" controlId="name" validationState={this.nameValidationState}>
                        <ControlLabel>Name</ControlLabel>
                        <FormControl type="text" value={this.state.repository.name}
                                     placeholder="name is required"
                                     onChange={(evt: any) => this.onNameChanged(evt)}/>
                    </FormGroup>
                    <FormGroup bsSize="sm" controlId="location" validationState={this.locationValidationState}>
                        <ControlLabel>Absolute path to repository root</ControlLabel>
                        <FormControl type="text" value={this.state.repository.location}
                                     placeholder="location is required"
                                     onChange={evt => this.onLocationChanged(evt)}/>
                        {this.renderFeedback()}
                    </FormGroup>
                    <FormGroup bsSize="sm" controlId="description">
                        <ControlLabel>Description</ControlLabel>
                        <FormControl componentClass="textarea" value={this.state.repository.description}
                                     placeholder="(optional)" style={{maxWidth: "100%"}}
                                     onChange={evt => this.onDescriptionChanged(evt)}/>
                    </FormGroup>
                    {this.props.sourceRepository ? <div style={{width: "100%", textAlign: "right"}}>{`(id: ${this.props.sourceRepository.id})`}</div> : null}
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="default" onClick={() => this.props.onCancel()}>Cancel</Button>
                    {(this.props.mode === RepositoryDialogMode.Update && this.props.sourceRepository) ?
                        <Button bsStyle="default" onClick={() => this.applySourceRepository()}>Revert</Button> : null}
                    <Button bsStyle="success" onClick={() => this.props.onAccept(this.state.repository)}
                            disabled={!this.isNameValid || !this.isLocationValid} style={{marginLeft: "30px"}}>
                        {this.props.mode === RepositoryDialogMode.Update ? "Update" : "Create"}
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
