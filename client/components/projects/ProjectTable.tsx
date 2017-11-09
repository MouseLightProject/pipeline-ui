import * as React from "react";
import {Button, Glyphicon, Badge} from "react-bootstrap";
import {toast} from "react-toastify";
import ReactTable from "react-table";
import {graphql} from "react-apollo";
import FontAwesome = require("react-fontawesome");
import pluralize = require("pluralize");

import {tableButtonStyles} from "../../util/styleDefinitions";
import {IProject, IProjectInput} from "../../models/project";
import {ProjectRow} from "./ProjectRow";
import {
    ModalAlert,
    toastDeleteError,
    toastDeleteSuccess,
    toastUpdateError,
    toastUpdateSuccess
} from "ndb-react-components";
import {DeleteProjectMutation, UpdateProjectMutation} from "../../graphql/project";
import {EditProjectDialog} from "./EditProjectDialog";
import {DialogMode} from "../helpers/DialogUtils";
import {PreferencesManager} from "../../util/preferencesManager";

const spanStyle = {
    color: "#AAAAAA",
    width: "100%"
};

interface IProjectTableProps {
    projects: IProject[];
    isFiltered: boolean;

    updateProject?(project: IProject): any;
    deleteProject?(id: string): any;
}

interface IProjectTableState {
    selectedProject: IProject;

    isUpdateDialogShown?: boolean;
    isDeleteDialogShown?: boolean;
}

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
export class ProjectTable extends React.Component<IProjectTableProps, IProjectTableState> {
    constructor(props) {
        super(props);

        this.state = {
            selectedProject: null,
            isUpdateDialogShown: false,
            isDeleteDialogShown: false
        }
    }

    getActivateText = isActive => isActive ? "pause" : "resume";

    getActivateGlyph = isActive => isActive ? "stop" : "play";

    getActivateStyle = isActive => isActive ? "info" : "success";

    getRegionText = (value) => value !== null ? value.toString() : "any";

    getSampleText = (value) => value !== null ? value.toString() : "unk";

    getSampleMinDescription = project => {
        return this.formatSamplePoint(project.sample_x_min, project.sample_y_min, project.sample_z_min);
    };

    getSampleMaxDescription(project) {
        return this.formatSamplePoint(project.sample_x_max, project.sample_y_max, project.sample_z_max);
    };

    private formatSamplePoint(x: number, y: number, z: number) {
        return `[${this.getSampleText(x)}, ${this.getSampleText(y)}, ${this.getSampleText(z)}]`;
    }

    getRegionMinDescription = project => {
        return this.formatRegionPoint(project.region_x_min, project.region_y_min, project.region_z_min);
    };

    getRegionMaxDescription(project) {
        return this.formatRegionPoint(project.region_x_max, project.region_y_max, project.region_z_max);
    };

    private formatRegionPoint(x: number, y: number, z: number) {
        return `[${this.getRegionText(x)}, ${this.getRegionText(y)}, ${this.getRegionText(z)}]`;
    }

    private onClickUpdateProject(evt: any, project: IProject) {
        evt.stopPropagation();

        this.setState({selectedProject: project, isUpdateDialogShown: true});
    }

    private onClickDeleteProject(evt: any) {
        evt.stopPropagation();

        this.setState({isDeleteDialogShown: true});
    }

    public async onActiveClick(project: IProject) {
        await this.onAcceptUpdateProject({
            id: project.id,
            is_processing: !project.is_processing
        }, false);
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

    private renderUpdateProjectDialog() {
        if (this.state.isUpdateDialogShown) {
            return (
                <EditProjectDialog show={this.state.isUpdateDialogShown}
                                   mode={DialogMode.Update}
                                   sourceProject={this.state.selectedProject}
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
                        message={`Are you sure you want to delete ${this.state.selectedProject.name} as a pipeline?`}
                        acknowledgeContent="Delete" canCancel={true} onCancel={() => this.onClearDeleteConfirmation()}
                        onAcknowledge={() => this.onDeleteProject()}/>
        )
    }

    private async onDeleteProject() {
        try {
            const result = await this.props.deleteProject(this.state.selectedProject.id);

            if (result.data.deleteProject.error) {
                toast.error(toastDeleteError(result.data.deleteProject.error), {autoClose: false});
            } else {
                toast.success(toastDeleteSuccess(), {autoClose: 3000});

                // this.setState({isDeleted: true});
            }
        } catch (error) {
            toast.error(toastDeleteError(error), {autoClose: false});
        }

        this.setState({isDeleteDialogShown: false});
    }

    private onClearDeleteConfirmation() {
        this.setState({isDeleteDialogShown: false});
    }

    public render() {
        const columns = [
            {
                id: "processing",
                Header: "",
                accessor: p => p,
                resizable: false,
                filterable: false,
                maxWidth: 70,
                Cell: row => (
                    <Button bsSize="xs"
                            bsStyle={this.getActivateStyle(row.original.is_processing)}
                            onClick={() => this.onActiveClick(row.original)}><Glyphicon
                        glyph={this.getActivateGlyph(row.original.is_processing)}/>&nbsp;{this.getActivateText(row.original.is_processing)}
                    </Button>
                ),
                sortMethod: (a, b) => {
                    if (a.is_processing === b.is_processing) {
                        return 0;
                    }

                    return a.is_processing ? -1 : 1;
                }
            },
            {
                Header: "Name",
                accessor: "name",
                width: 250
            }, {
                Header: "Path to Dashboard Root",
                accessor: "root_path"
            }, {
                id: "sample_limits",
                Header: "Sample Limits",
                width: 120,
                sortable: false,
                filterable: false,
                accessor: p => p,
                Cell: props => (
                    <div>
                        {this.getSampleMinDescription(props.original)}
                        <br/>
                        <span>
                            {this.getSampleMaxDescription(props.original)}
                         </span>
                    </div>
                )
            }, {
                id: "selected_region",
                Header: "Selected Region",
                width: 150,
                sortable: false,
                filterable: false,
                accessor: p => p,
                Cell: props => (
                    <div>
                        {this.getRegionMinDescription(props.original)}
                        <br/>
                        <span>
                            {this.getRegionMaxDescription(props.original)}
                        </span>
                    </div>
                )
            }, {
                Header: "Created",
                accessor: "created_at",
                width: 180,
                filterable: false,
                Cell: props => {
                    const project = props.original;

                    return (
                        <div>
                            <span>{new Date(project.created_at).toLocaleDateString()}</span>
                            <Button bsSize="xs" bsStyle="info" style={tableButtonStyles.edit}
                                    onClick={(evt) => this.onClickUpdateProject(evt, project)}
                                    disabled={project.is_processing}>
                                <span>
                                    <FontAwesome name="pencil"/>
                                </span>
                            </Button>
                            {project.stages.length === 0 ?
                                <Button bsSize="sm" bsStyle="danger" style={tableButtonStyles.remove}
                                        onClick={(evt) => this.onClickDeleteProject(evt)}
                                        disabled={project.is_processing}>
                                    <span>
                                        <FontAwesome name="trash"/>
                                    </span>
                                </Button>
                                : <Badge>{project.stages.length} {pluralize("stage", project.stages.length)}</Badge>}
                        </div>
                    );
                }
            }];

        const props = {
            data: this.props.projects,
            columns: columns,
            showPagination: false,
            minRows: 0,
            defaultSorted: PreferencesManager.Instance.ProjectTableSort,
            defaultFiltered: this.props.isFiltered ? PreferencesManager.Instance.ProjectTableFilter : [],
            filterable: this.props.isFiltered,
            onSortedChange: (newSorted) => {
                PreferencesManager.Instance.ProjectTableSort = newSorted;
            },
            onFilteredChange: (newFiltered) => {
                PreferencesManager.Instance.ProjectTableFilter = newFiltered;
            }
        };

        return (
            <div>
                {this.renderUpdateProjectDialog()}
                {this.renderDeleteProjectConfirmation()}
                <ReactTable {...props} className="-highlight"/>
            </div>
        )

        /*
       let rows = [];

        if (this.props.projects) {
            rows = this.props.projects.map(project => (
                <ProjectRow key={"tr_project_" + project.id} project={project}/>));
        }


        return (
            <Table condensed style={{marginBottom: "0"}}>
                <thead>
                <tr key="project_header">
                    <th/>
                    <th/>
                    <th>Sample</th>
                    <th>Name<br/><span style={spanStyle}>Description</span></th>
                    <th>Path to Dashboard Root</th>
                    <th>Sample Limits</th>
                    <th>Selected Region</th>
                    <th/>
                </tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </Table>
        );
        */

    }
}
