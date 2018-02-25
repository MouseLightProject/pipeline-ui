import * as React from "react";
import {Menu, MenuItem, Button, Icon, Confirm} from "semantic-ui-react";
import ReactTable from "react-table";
import {toast} from "react-toastify";
import {graphql} from "react-apollo";

import {IProject, IProjectInput} from "../../models/project";
import {DeleteProjectMutation, DuplicateProjectMutation, UpdateProjectMutation} from "../../graphql/project";
import {EditProjectDialog} from "./EditProjectDialog";
import {DialogMode} from "../helpers/DialogUtils";
import {PreferencesManager} from "../../util/preferencesManager";
import {AllProjectsId} from "../helpers/ProjectMenu";
import {toastError, toastSuccess} from "../../util/Toasts";

interface IProjectTableProps {
    style: any;
    projects: IProject[];
    isFiltered: boolean;

    updateProject?(project: IProject): any;
    duplicateProject?(id: string): any;
    deleteProject?(id: string): any;
}

interface IProjectTableState {
    selectedProject: IProject;

    isUpdateDialogShown?: boolean;
    isDuplicateDialogShown?: boolean;
    isDeleteDialogShown?: boolean;
}

class ___ProjectTable extends React.Component<IProjectTableProps, IProjectTableState> {
    constructor(props) {
        super(props);

        const id = PreferencesManager.Instance.PreferredProjectId;

        const index = this.props.projects.findIndex(p => p.id === id);

        this.state = {
            selectedProject: index >= 0 ? this.props.projects[index] : null,
            isUpdateDialogShown: false,
            isDeleteDialogShown: false
        }
    }

    getActivateText = isActive => isActive ? "pause" : "resume";

    getActivateGlyph = isActive => isActive ? "stop" : "play";

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

    private onClickUpdateProject(evt: any) {
        evt.stopPropagation();

        this.setState({isUpdateDialogShown: true});
    }

    private onClickDuplicateProject(evt: any) {
        evt.stopPropagation();

        this.setState({isDuplicateDialogShown: true});
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
                toast.error(toastError("Update", result.data.updateProject.error), {autoClose: false});
            } else {
                if (showSuccessToast) {
                    toast.success(toastSuccess("Update"), {autoClose: 3000});
                }
                this.setState({selectedProject: result.data.updateProject.project});
            }

        } catch (error) {
            toast.error(toastError("Update", error), {autoClose: false});
        }

    }

    private async onDuplicateProject() {
        try {
            const result = await this.props.duplicateProject(this.state.selectedProject.id);

            if (result.data.duplicateProject.error) {
                toast.error(toastError("Duplciate", result.data.duplicateProject.error), {autoClose: false});
            } else {
                toast.success(toastSuccess("Duplciate"), {autoClose: 3000});

                if (PreferencesManager.Instance.PreferredProjectId === this.state.selectedProject.id) {
                    PreferencesManager.Instance.PreferredProjectId = AllProjectsId;
                }
            }
        } catch (error) {
            toast.error(toastError("Duplciate", error), {autoClose: false});
        }

        this.setState({selectedProject: null, isDuplicateDialogShown: false});
    }

    private onClearDuplicateConfirmation() {
        this.setState({isDuplicateDialogShown: false});
    }

    private renderDuplicateProjectConfirmation() {
        if (!this.state.isDuplicateDialogShown) {
            return null;
        }

        return (
            <Confirm open={this.state.isDuplicateDialogShown} header="Duplicate Pipeline"
                     content={`Are you sure you want to duplicate ${this.state.selectedProject.name}?`}
                     confirmButton="Duplicate" onCancel={() => this.onClearDuplicateConfirmation()}
                     onConfirm={() => this.onDuplicateProject()}/>
        )
    }

    private async onDeleteProject() {
        try {
            const result = await this.props.deleteProject(this.state.selectedProject.id);

            if (result.data.deleteProject.error) {
                toast.error(toastError("Delete", result.data.deleteProject.error), {autoClose: false});
            } else {
                toast.success(toastSuccess("Delete"), {autoClose: 3000});

                if (PreferencesManager.Instance.PreferredProjectId === this.state.selectedProject.id) {
                    PreferencesManager.Instance.PreferredProjectId = AllProjectsId;
                }
                // this.setState({isDeleted: true});
            }
        } catch (error) {
            toast.error(toastError("Delete", error), {autoClose: false});
        }

        this.setState({selectedProject: null, isDeleteDialogShown: false});
    }

    private onClearDeleteConfirmation() {
        this.setState({isDeleteDialogShown: false});
    }

    private renderDeleteProjectConfirmation() {
        if (!this.state.isDeleteDialogShown) {
            return null;
        }

        return (
            <Confirm open={this.state.isDeleteDialogShown} header="Delete Pipeline"
                     content={`Are you sure you want to delete ${this.state.selectedProject.name} as a pipeline?`}
                     confirmButton="Delete" onCancel={() => this.onClearDeleteConfirmation()}
                     onConfirm={() => this.onDeleteProject()}/>
        )
    }

    private renderSubMenu() {
        const disabled = this.state.selectedProject === null;

        const disabled_active = disabled || this.state.selectedProject.is_processing;

        const disabled_stages = disabled_active || this.state.selectedProject.stages.length > 0;

        return (
            <Menu size="mini" style={{borderBottom: "none"}}>
                <EditProjectDialog
                    element={<MenuItem size="mini" content="Edit" icon="pencil" disabled={disabled_active}
                                       onClick={(evt) => this.onClickUpdateProject(evt)}/>}
                    show={this.state.isUpdateDialogShown}
                    mode={DialogMode.Update}
                    sourceProject={this.state.selectedProject}
                    onCancel={() => this.setState({isUpdateDialogShown: false})}
                    onAccept={(p: IProjectInput) => this.onAcceptUpdateProject(p)}/>
                <MenuItem size="mini" content="Duplicate" icon="clone" disabled={disabled}
                          onClick={(evt) => this.onClickDuplicateProject(evt)}/>
                <MenuItem size="mini" content="Export" icon="external share" disabled={disabled}/>
                {this.state.selectedProject ? <Menu.Header>
                    <div style={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: "10px",
                    }}>
                        <h5>
                            {this.state.selectedProject.name}&nbsp;
                            <Icon name="remove" onClick={() => {
                                this.setState({selectedProject: null});
                                PreferencesManager.Instance.PreferredProjectId = AllProjectsId;
                            }}/>
                        </h5>
                    </div>
                </Menu.Header> : null}
                <Menu.Menu position="right">
                    <MenuItem size="mini" content="Delete" icon="trash" disabled={disabled_stages}
                              onClick={(evt) => this.onClickDeleteProject(evt)}/>
                </Menu.Menu>
            </Menu>
        );
    }

    public render() {
        const columns = [
            {
                id: "processing",
                Header: "",
                accessor: p => p,
                resizable: false,
                filterable: false,
                width: 90,
                Cell: row => {
                    const color = row.original.is_processing ? "orange" : "green";
                    return (
                        <Button size="mini" compact color={color}
                                className="active-button"
                                icon={this.getActivateGlyph(row.original.is_processing)}
                                content={this.getActivateText(row.original.is_processing)}
                                onClick={() => this.onActiveClick(row.original)}>
                        </Button>
                    )
                },
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
                width: 220
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
                width: 120,
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
                id: "stages",
                Header: "Stages",
                accessor: "stages",
                width: 80,
                filterable: false,
                Cell: ({value}) => {
                    return (<div style={{margin: "auto"}}>{value.length}</div>);
                }
            }, {
                Header: "Created",
                accessor: "created_at",
                width: 100,
                filterable: false,
                Cell: props => {
                    const project = props.original;
                    return (
                        <div style={{margin: "auto"}}>{new Date(project.created_at).toLocaleDateString()}</div>
                    );
                }
            }];

        const props = {
            style: {backgroundColor: "white"},
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
            },
            getTrProps: (state, rowInfo) => {
                return {
                    onClick: (e, handleOriginal) => {
                        if (!handleOriginal) {
                            this.setState({selectedProject: rowInfo.original});
                            PreferencesManager.Instance.PreferredProjectId = rowInfo.original.id;
                        }

                        if (handleOriginal) {
                            handleOriginal()
                        }
                    },
                    style: this.state.selectedProject && rowInfo.original.id === this.state.selectedProject.id ? {backgroundColor: "rgb(233, 236, 239)"} : {}
                }
            }
        };


        return (
            <div style={Object.assign({width: "100%"}, this.props.style || {})}>
                {this.renderDeleteProjectConfirmation()}
                {this.renderDuplicateProjectConfirmation()}
                {this.renderSubMenu()}
                <ReactTable {...props} className="-highlight"/>
            </div>
        )
    }
}

const __ProjectTable = graphql<any, any>(UpdateProjectMutation, {
    props: ({mutate}) => ({
        updateProject: (project: IProjectInput) => mutate({
            variables: {project}
        })
    })
})(___ProjectTable);

const _ProjectTable = graphql<any, any>(DeleteProjectMutation, {
    props: ({mutate}) => ({
        deleteProject: (id: string) => mutate({
            variables: {id}
        })
    })
})(__ProjectTable);

export const ProjectTable = graphql<any, any>(DuplicateProjectMutation, {
    props: ({mutate}) => ({
        duplicateProject: (id: string) => mutate({
            variables: {id}
        })
    })
})(_ProjectTable);
