import * as React from "react";
import {Menu, MenuItem, Button, Confirm, Icon} from "semantic-ui-react";
import {Mutation} from "react-apollo";
import ReactTable from "react-table";
import {toast} from "react-toastify";

import {IProject, IProjectInput, ProjectInputSourceState} from "../../models/project";
import {DeleteProjectMutation, DuplicateProjectMutation, UpdateProjectMutation} from "../../graphql/project";
import {EditProjectDialog} from "./EditProjectDialog";
import {DialogMode} from "../helpers/DialogUtils";
import {PreferencesManager} from "../../util/preferencesManager";
import {AllProjectsId} from "../helpers/ProjectMenu";
import {toastError, toastSuccess} from "../../util/Toasts";
import {BaseQuery} from "../../graphql/baseQuery";
import {TableSelectionHeader} from "../helpers/TableSelectionHeader";

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

export class ProjectTable extends React.Component<IProjectTableProps, IProjectTableState> {
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

    // region Update Methods

    private onClickUpdateProject(evt: any) {
        evt.stopPropagation();
        this.setState({isUpdateDialogShown: true});
    }

    private onCompleteUpdateProject = (data) => {
        if (data.updateProject.error) {
            toast.error(toastError("Update", data.updateProject.error), {autoClose: false});
        } else {
            toast.success(toastSuccess("Update"), {autoClose: 3000});
        }
    };

    private onUpdateProjectError = (error) => {
        toast.error(toastError("Update", error), {autoClose: false});
    };

    // endregion

    // region Duplicate Methods

    private onDuplicateProject(evt: any) {
        evt.stopPropagation();
        this.setState({isDuplicateDialogShown: true});
    }

    private onCompleteDuplicateProject = (data) => {
        if (data.duplicateProject.error) {
            toast.error(toastError("Duplicate", data.duplicateProject.error), {autoClose: false});
        } else {
            toast.success(toastSuccess("Duplicate"), {autoClose: 3000});
        }
    };

    private onDuplicateProjectError = (error) => {
        toast.error(toastError("Duplicate", error), {autoClose: false});
    };

    private onClearDuplicateConfirmation() {
        this.setState({isDuplicateDialogShown: false});
    }

    private renderDuplicateProjectConfirmation() {
        return (
            <Mutation mutation={DuplicateProjectMutation} onCompleted={this.onCompleteDuplicateProject}
                      onError={this.onDuplicateProjectError}
                      update={(cache, {data: {duplicateProject: {project}}}) => {
                          const data: any = cache.readQuery({query: BaseQuery});
                          cache.writeQuery({
                              query: BaseQuery,
                              data: Object.assign(data, {projects: data.projects.concat([project])})
                          });
                      }}>
                {(duplicateProject) => {
                    if (!this.state.isDuplicateDialogShown) {
                        return null;
                    }
                    return (
                        <Confirm open={this.state.isDuplicateDialogShown} header="Duplicate Pipeline"
                                 content={`Are you sure you want to duplicate ${this.state.selectedProject.name}?`}
                                 confirmButton="Duplicate" onCancel={() => this.onClearDuplicateConfirmation()}
                                 onConfirm={() => {
                                     duplicateProject({variables: {id: this.state.selectedProject.id}});
                                     this.setState({isDuplicateDialogShown: false});
                                 }}/>
                    );
                }
                }
            </Mutation>
        )
    }

    // endregion

    // region Delete Methods
    private onClickDeleteProject(evt: any) {
        evt.stopPropagation();
        this.setState({isDeleteDialogShown: true});
    }

    private onCompleteDeleteProject = (data) => {
        if (data.deleteProject.error) {
            toast.error(toastError("Delete", data.deleteProject.error), {autoClose: false});
        } else {
            if (PreferencesManager.Instance.PreferredProjectId === this.state.selectedProject.id) {
                this.setState({selectedProject: null});
                PreferencesManager.Instance.PreferredProjectId = AllProjectsId;
            }

            toast.success(toastSuccess("Delete"), {autoClose: 3000});
        }
    };

    private onDeleteProjectError = (error) => {
        toast.error(toastError("Delete", error), {autoClose: false});
    };

    private onClearDeleteConfirmation() {
        this.setState({isDeleteDialogShown: false});
    }

    private renderDeleteProjectConfirmation() {
        return (
            <Mutation mutation={DeleteProjectMutation} onCompleted={this.onCompleteDeleteProject}
                      onError={this.onDeleteProjectError}
                      update={(cache, {data: {deleteProject: {id}}}) => {
                          const data: any = cache.readQuery({query: BaseQuery});
                          cache.writeQuery({
                              query: BaseQuery,
                              data: Object.assign(data, {projects: data.projects.filter(t => t.id !== id)})
                          });
                      }}>
                {(deleteProject) => {
                    if (!this.state.isDeleteDialogShown) {
                        return null;
                    }
                    return (
                        <Confirm open={this.state.isDeleteDialogShown} header="Delete Pipeline"
                                 content={`Are you sure you want to delete ${this.state.selectedProject.name} as a pipeline?`}
                                 confirmButton="Delete" onCancel={() => this.onClearDeleteConfirmation()}
                                 onConfirm={() => {
                                     deleteProject({variables: {id: this.state.selectedProject.id}});
                                     this.setState({isDeleteDialogShown: false});
                                 }}/>
                    )
                }
                }
            </Mutation>
        );
    }

    // endregion

    private renderSubMenu() {
        const disabled = this.state.selectedProject === null;

        const disabled_active = disabled || this.state.selectedProject.is_processing;

        const disabled_stages = disabled_active || this.state.selectedProject.stages.length > 0;

        return (
            <Menu size="mini" style={{borderBottom: "none", borderRadius: 0, marginBottom: 0, boxShadow: "none"}}>
                <Mutation mutation={UpdateProjectMutation} onCompleted={this.onCompleteUpdateProject}
                          onError={this.onUpdateProjectError}>
                    {(updateProject) => (
                        <EditProjectDialog
                            trigger={<MenuItem size="mini" content="Edit" icon="pencil" disabled={disabled_active}
                                               onClick={(evt) => this.onClickUpdateProject(evt)}/>}
                            isOpen={this.state.isUpdateDialogShown}
                            mode={DialogMode.Update}
                            sourceProject={this.state.selectedProject}
                            onCancel={() => this.setState({isUpdateDialogShown: false})}
                            onAccept={(p: IProjectInput) => {
                                this.setState({isUpdateDialogShown: false});
                                updateProject({variables: {project: p}});
                            }}/>
                    )
                    }
                </Mutation>

                <MenuItem size="mini" content="Duplicate" icon="clone" disabled={disabled}
                          onClick={(evt) => this.onDuplicateProject(evt)}/>

                <MenuItem size="mini" content="Export" icon="external share" disabled={true}/>
                <TableSelectionHeader item={this.state.selectedProject} onClick={() => {
                    this.setState({selectedProject: null});
                    PreferencesManager.Instance.PreferredProjectId = AllProjectsId;
                }}/>
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
                        <Mutation mutation={UpdateProjectMutation} onCompleted={this.onCompleteUpdateProject}
                                  onError={this.onUpdateProjectError}>
                            {(updateProject) => (
                                <Button size="mini" compact color={color}
                                        className="active-button"
                                        icon={this.getActivateGlyph(row.original.is_processing)}
                                        content={this.getActivateText(row.original.is_processing)}
                                        onClick={() => updateProject({
                                            variables: {
                                                project: {
                                                    id: row.original.id,
                                                    is_processing: !row.original.is_processing
                                                }
                                            }
                                        })}>
                                </Button>
                            )
                            }
                        </Mutation>
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
                id: "root_path",
                accessor: p => p,
                Cell: props => {
                    let name = null;
                    let color: "red" | "green" = "red";
                    switch (props.original.input_source_state) {
                        case ProjectInputSourceState.Unknown:
                            name = "question";
                            break;
                        case ProjectInputSourceState.Missing:
                            name = "times circle";
                            break;
                        case ProjectInputSourceState.BadLocation:
                            name = "folder";
                            break;
                        case ProjectInputSourceState.Disappeared:
                            name = "exclamation circle";
                            break;
                        default:
                            name = "check";
                            color = "green";
                            break;
                    }
                    return (
                        <span><Icon name={name} color={color}/>{props.original.root_path}</span>
                    )
                }
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
            defaultPageSize: 100,
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
