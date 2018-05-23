import * as React from "react";
import {Button, Modal, Form, Message} from "semantic-ui-react";
import {ChangeEvent} from "react";
import * as pathIsAbsolute from "path-is-absolute";
import {ITaskRepository} from "../../../models/taskRepository";
import {DialogMode} from "../../helpers/DialogUtils";

interface IEditRepositoryProps {
    trigger: React.ReactNode;
    mode: DialogMode;
    isOpen: boolean;
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

    private applySourceRepository() {
        this.setState({
            repository: this.props.sourceRepository ? (({id, name, description, location}) => ({
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
        });
    }

    private get isNameValid(): boolean {
        return !!this.state.repository.name;
    }

    private onNameChanged(evt: ChangeEvent<any>) {
        this.setState({
            repository: Object.assign(this.state.repository, {name: evt.target.value})
        });
    }

    private get isLocationValid(): boolean {
        return !!this.state.repository.location && this.state.repository.location.length > 1 && pathIsAbsolute.posix(this.state.repository.location);
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

    private onCreateOrUpdate() {
        const taskRepository = Object.assign((({id, name, description, location}) => ({
            id: this.props.mode == DialogMode.Create ? undefined : id,
            name,
            description,
            location
        }))(this.state.repository));

        this.props.onAccept(taskRepository)
    }

    private renderFeedback() {
        if (this.state.repository.location.length > 0 && !this.isLocationValid) {
            return (<Message error content="Location must be an absolute path"/>);
        }

        return null;
    }

    public render() {
        const title = this.props.mode === DialogMode.Create ? "Add New Repository" : "Update Repository";

        return (
            <Modal trigger={this.props.trigger} open={this.props.isOpen} onOpen={() => this.applySourceRepository()}>
                <Modal.Header style={{backgroundColor: "#5bc0de", color: "white"}}>
                    {title}
                </Modal.Header>
                <Modal.Content>
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
                    <Form size="small" error={!this.isLocationValid}>
                        <Form.Input label="Name" value={this.state.repository.name} error={!this.isNameValid}
                                    placeholder="name is required"
                                    onChange={(evt: any) => this.onNameChanged(evt)}/>
                        <Form.Input label="Absolute path to repository root" value={this.state.repository.location}
                                    error={!this.isLocationValid}
                                    placeholder="location is required"
                                    onChange={(evt: any) => this.onLocationChanged(evt)}/>
                        {this.renderFeedback()}
                        <Form.TextArea label="Description" value={this.state.repository.description}
                                       placeholder="(optional)"
                                       onChange={(evt: any) => this.onDescriptionChanged(evt)}/>
                    </Form>
                    {this.props.sourceRepository ? <div style={{
                        width: "100%",
                        textAlign: "right"
                    }}>{`(id: ${this.props.sourceRepository.id})`}</div> : null}
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={() => this.props.onCancel()}>Cancel</Button>
                    {(this.props.mode === DialogMode.Update && this.props.sourceRepository) ?
                        <Button onClick={() => this.applySourceRepository()}>Revert</Button> : null}
                    <Button onClick={() => this.onCreateOrUpdate()}
                            disabled={!this.isNameValid || !this.isLocationValid} style={{marginLeft: "30px"}}>
                        {this.props.mode === DialogMode.Update ? "Update" : "Create"}
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}
