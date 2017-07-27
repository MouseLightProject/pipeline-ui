import * as React from "react";
import {Glyphicon, Button, Badge} from "react-bootstrap";
import FontAwesome = require("react-fontawesome");
import pluralize = require("pluralize");
import {toast} from "react-toastify";

import {graphql} from "react-apollo";
import {tableButtonStyles, tableCellStyles} from "../../util/styleDefinitions";
import {EditProjectDialog, ProjectDialogMode} from "./EditProjectDialog";
import {ModalAlert, toastDeleteError, toastDeleteSuccess, toastUpdateError, toastUpdateSuccess} from "ndb-react-components";
import {DeleteProjectMutation, SetProjectStatusMutation, UpdateProjectMutation} from "../../graphql/project";
import {IProject, IProjectInput} from "../../models/project";

interface IProjectRowProps {
    project?: IProject;

    updateProject?(project: IProject): any;

    deleteProject?(project: IProject): any;
}

interface IProjectRowState {
    isDeleted?: boolean;

    isUpdateDialogShown?: boolean;
    isDeleteDialogShown?: boolean;
}

const spanStyle = {
    color: "#AAAAAA",
    width: "100%"
};

@graphql(SetProjectStatusMutation, {
    props: ({mutate}) => ({
        setProjectStatusMutation: (id: string, shouldBeActive: boolean) => mutate({
            variables: {
                id: id,
                shouldBeActive: shouldBeActive
            }
        })
    })
})
@graphql(UpdateProjectMutation, {
    props: ({mutate}) => ({
        updateProject: (project: IProjectInput) => mutate({
            variables: {project}
        })
    })
})
@graphql(DeleteProjectMutation, {
    props: ({mutate}) => ({
        deleteProject: (id: string) => mutate({
            variables: {id}
        })
    })
})
export class ProjectRow extends React.Component<IProjectRowProps, IProjectRowState> {
    constructor(props) {
        super(props);

        this.state = {
            isDeleted: false,
            isUpdateDialogShown: false,
            isDeleteDialogShown: false
        }
    }

    private onClickUpdateProject(evt: any) {
        evt.stopPropagation();

        this.setState({isUpdateDialogShown: true});
    }

    private onClickDeleteProject(evt: any) {
        evt.stopPropagation();

        this.setState({isDeleteDialogShown: true});
    }

    getActivateText = isActive => isActive ? "pause" : "resume";

    getActivateGlyph = isActive => isActive ? "stop" : "play";

    getActivateStyle = isActive => isActive ? "info" : "success";

    getRegionText = (value, isMin) => value !== null ? value.toString() : (isMin ? "any" : "any");

    getRegionMinDescription = project => {
        return `[${this.getRegionText(project.region_x_min, true)}, ${this.getRegionText(project.region_y_min, true)}, ${this.getRegionText(project.region_z_min, true)}]`;
    };

    getRegionMaxDescription = project => {
        return `[${this.getRegionText(project.region_x_max, false)}, ${this.getRegionText(project.region_y_max, false)}, ${this.getRegionText(project.region_z_max, false)}]`;
    };

    public async onActiveClick() {
        await this.onAcceptUpdateProject({id: this.props.project.id, is_processing: !this.props.project.is_processing}, false);
    };

    private async onAcceptUpdateProject(project: IProjectInput, showSuccessToast: boolean = true) {
        this.setState({isUpdateDialogShown: false});

        try {
            const result = await this.props.updateProject(project);

            if (!result.data.updateProject.project) {
                toast.error(toastUpdateError(result.data.updateProject.error), {autoClose: false});
            } else if (showSuccessToast) {
                toast.success(toastUpdateSuccess(), {autoClose: 3000});
            }
        } catch (error) {
            toast.error(toastUpdateError(error), {autoClose: false});
        }
    }

    private async onDeleteProject() {
        try {
            const result = await this.props.deleteProject(this.props.project.id);

            if (result.data.deleteProject.error) {
                toast.error(toastDeleteError(result.data.deleteProject.error), {autoClose: false});
            } else {
                toast.success(toastDeleteSuccess(), {autoClose: 3000});

                this.setState({isDeleted: true});
            }
        } catch (error) {
            toast.error(toastDeleteError(error), {autoClose: false});
        }

        this.setState({isDeleteDialogShown: false});
    }

    private onClearDeleteConfirmation() {
        this.setState({isDeleteDialogShown: false});
    }

    private renderUpdateProjectDialog() {
        if (this.state.isUpdateDialogShown) {
            return (
                <EditProjectDialog show={this.state.isUpdateDialogShown}
                                   mode={ProjectDialogMode.Update}
                                   sourceProject={this.props.project}
                                   onCancel={() => this.setState({isUpdateDialogShown: false})}
                                   onAccept={(p: IProjectInput) => this.onAcceptUpdateProject(p)}/>
            );
        } else {
            return null;
        }
    }

    private renderDeleteProjectConfirmation() {
        if (!this.state.isDeleteDialogShown) {
            return null;
        }

        return (
            <ModalAlert show={this.state.isDeleteDialogShown} style="danger" header="Delete Pipeline"
                        message={`Are you sure you want to delete ${this.props.project.name} as a pipeline?`}
                        acknowledgeContent="Delete" canCancel={true} onCancel={() => this.onClearDeleteConfirmation()}
                        onAcknowledge={() => this.onDeleteProject()}/>
        )
    }

    private renderRootPath() {
        if (this.props.project.dashboard_json_status) {
            return (
                <span>
                    {this.props.project.root_path}
                </span>
            );
        } else {
            return (<span className="text-danger">{this.props.project.root_path}</span>);
        }
    }

    public render() {
        const project = this.props.project;

        if (this.state.isDeleted) {
            return null;
        }

        return (
            <tr>
                {this.renderUpdateProjectDialog()}
                {this.renderDeleteProjectConfirmation()}
                <td style={tableCellStyles.middle}><Button bsSize="xs" bsStyle={this.getActivateStyle(project.is_processing)}
                                                           onClick={() => this.onActiveClick()} style={{marginLeft: "10px"}}><Glyphicon
                    glyph={this.getActivateGlyph(project.is_processing)}/> {this.getActivateText(project.is_processing)}
                </Button></td>
                <td style={{paddingLeft: "10px"}}>
                    <Button bsSize="sm" bsStyle="info" style={tableButtonStyles.edit} onClick={(evt) => this.onClickUpdateProject(evt)}>
                        <span>
                        <FontAwesome name="pencil"/>
                        </span>
                    </Button>
                </td>
                <td style={tableCellStyles.middle}>
                    {project.sample_number}
                </td>
                <td style={tableCellStyles.middle}>
                    {project.name}<br/>
                    <span style={spanStyle}>{project.description}</span>
                </td>
                <td style={tableCellStyles.middle}>
                    {this.renderRootPath()}
                </td>
                <td>{this.getRegionMinDescription(project)}<br/><span>{this.getRegionMaxDescription(project)}</span>
                </td>
                <td style={{textAlign: "center", paddingRight: "10px", width: "20px", verticalAlign: "middle"}}>
                    {project.stages.length === 0 ?
                        <Button bsSize="sm" bsStyle="danger" style={tableButtonStyles.remove}
                                onClick={(evt) => this.onClickDeleteProject(evt)}>
                        <span>
                            <FontAwesome name="trash"/>
                        </span>
                        </Button>
                        : <Badge>{project.stages.length} {pluralize("stage", project.stages.length)}</Badge>}
                </td>
            </tr>);
    }
}

