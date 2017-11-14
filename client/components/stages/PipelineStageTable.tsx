import * as React from "react";
import {Button, Menu, MenuItem, Icon, Confirm} from "semantic-ui-react";
import ReactTable from "react-table";
import {graphql} from "react-apollo";
import {toast} from "react-toastify";

import {IPipelineStage} from "../../models/pipelineStage";
import {AllProjectsId} from "../helpers/ProjectMenu";
import {ITaskDefinition} from "../../models/taskDefinition";
import {IProject} from "../../models/project";
import {EditPipelineStageDialog} from "./EditPipelineStageDialog";
import {DialogMode} from "../helpers/DialogUtils";
import {
    toastDeleteError,
    toastDeleteSuccess,
    toastUpdateError,
    toastUpdateSuccess
} from "ndb-react-components";
import {DeletePipelineStageMutation, UpdatePipelineStageMutation} from "../../graphql/pipelineStage";
import {PreferencesManager} from "../../util/preferencesManager";

const previousStageIsAcquisitionRoot = "(acquisition root)";

interface IPipelineStageTableProps {
    style: any;
    pipelineStages: IPipelineStage[];
    selectedProjectId: string;
    tasks: ITaskDefinition[];
    projects: IProject[];
    isFiltered: boolean;

    updatePipelineStage?(project: IProject): any;
    deletePipelineStage?(id: string): any;
    onSelectedPipelineStageChanged(stage: IPipelineStage);
}

interface IPipelineStageTableState {
    selectedStage?: IPipelineStage;

    isUpdateDialogShown?: boolean;
    isDeleteDialogShown?: boolean;
}

class __PipelineStageTable extends React.Component<IPipelineStageTableProps, IPipelineStageTableState> {
    constructor(props) {
        super(props);

        this.state = {
            selectedStage: null,
            isUpdateDialogShown: false,
            isDeleteDialogShown: false
        }
    }

    getActivateText = isActive => isActive ? "pause" : "resume";

    getActivateGlyph = isActive => isActive ? "stop" : "play";

    public async onActiveClick(pipelineStage: IPipelineStage) {
        await this.onAcceptUpdatePipelineStage({
            id: pipelineStage.id,
            is_processing: !pipelineStage.is_processing
        }, false);
    };


    private onClickUpdatePipelineStage(evt: any) {
        evt.stopPropagation();

        this.setState({isUpdateDialogShown: true});
    }

    private onClickDeletePipelineStage(evt: any) {
        evt.stopPropagation();

        this.setState({isDeleteDialogShown: true});
    }

    private async onAcceptUpdatePipelineStage(pipelineStage: IPipelineStage, showSuccessToast: boolean = true) {
        this.setState({isUpdateDialogShown: false});

        try {
            const result = await this.props.updatePipelineStage(pipelineStage);

            if (!result.data.updatePipelineStage.pipelineStage) {
                toast.error(toastUpdateError(result.data.updatePipelineStage.error), {autoClose: false});
            } else if (showSuccessToast) {
                toast.success(toastUpdateSuccess(), {autoClose: 3000});
            }
        } catch (error) {
            toast.error(toastUpdateError(error), {autoClose: false});
        }
    }

    private async onDeletePipelineStage() {
        try {
            const result = await this.props.deletePipelineStage(this.state.selectedStage.id);

            if (result.data.deletePipelineStage.error) {
                toast.error(toastDeleteError(result.data.deletePipelineStage.error), {autoClose: false});
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

    private renderDeleteProjectConfirmation() {
        if (!this.state.isDeleteDialogShown) {
            return null;
        }

        return (
            <Confirm open={this.state.isDeleteDialogShown} header="Delete Stage"
                     content={`Are you sure you want to delete ${this.state.selectedStage.name} as a stage?`}
                     confirmButton="Delete" onCancel={() => this.onClearDeleteConfirmation()}
                     onConfirm={() => this.onDeletePipelineStage()}/>
        )
    }

    private renderSubMenu() {
        const disabled = this.state.selectedStage === null;

        const disabled_active = disabled || this.state.selectedStage.is_processing;

        return (
            <Menu size="mini" style={{borderBottom: "none"}}>
                <EditPipelineStageDialog
                    element={<MenuItem size="small" content="Edit Stage" icon="plus" disabled={disabled_active}
                                       onClick={(evt: any) => this.onClickUpdatePipelineStage(evt)}/>}
                    show={this.state.isUpdateDialogShown}
                    mode={DialogMode.Update}
                    sourceStage={this.state.selectedStage}
                    projects={this.props.projects}
                    tasks={this.props.tasks}
                    onCancel={() => this.setState({isUpdateDialogShown: false})}
                    onAccept={(s: IPipelineStage) => this.onAcceptUpdatePipelineStage(s)}/>
                <MenuItem size="mini" content="Duplicate" icon="clone" disabled={disabled}/>
                {this.state.selectedStage ? <Menu.Header>
                    <div style={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: "10px",
                    }}>
                        <h5>
                            {this.state.selectedStage.name}&nbsp;
                            <Icon name="remove" onClick={() => this.setState({selectedStage: null})}/>
                        </h5>
                    </div>
                </Menu.Header> : null}
                <Menu.Menu position="right">
                    <MenuItem size="mini" content="Delete" icon="trash" disabled={disabled_active}
                              onClick={(evt) => this.onClickDeletePipelineStage(evt)}/>
                </Menu.Menu>
            </Menu>
        );
    }

    public render() {
        let stages = this.props.pipelineStages.slice();

        if (this.props.selectedProjectId !== AllProjectsId) {
            stages = stages.filter((stage) => stage.project.id === this.props.selectedProjectId);
        }

        stages = stages.sort((a, b) => {
            if (a.project.id === b.project.id) {
                if (a.depth === b.depth) {
                    return a.depth - b.depth;
                }
                return a.name.localeCompare(b.name);
            }

            return a.project.name.localeCompare(b.project.name);
        });

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
                                disabled={!row.original.project.is_processing}
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
                width: 200
            }, {
                Header: "Task",
                accessor: "task",
                width: 200,
                Cell: ({value}) => {
                    return (
                        <div>{value.name}</div>
                    );
                }
            }, {
                Header: "Task",
                accessor: "previous_stage",
                width: 120,
                Cell: ({value}) => {
                    return (
                        <div>{value ? value.name : previousStageIsAcquisitionRoot}</div>
                    );
                }
            }, {
                Header: "Destination Path",
                accessor: "dst_path"
            }, {
                Header: "Queue",
                accessor: "performance",
                width: 60,
                Cell: ({value}) => {
                    return (
                        <div style={{margin: "auto"}}>{renderPerformance(value)}</div>
                    );
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
            data: stages,
            columns: columns,
            showPagination: false,
            minRows: 0,
            defaultSorted: PreferencesManager.Instance.StageTableSort,
            defaultFiltered: this.props.isFiltered ? PreferencesManager.Instance.StageTableFilter : [],
            filterable: this.props.isFiltered,
            onSortedChange: (newSorted) => {
                PreferencesManager.Instance.StageTableSort = newSorted;
            },
            onFilteredChange: (newFiltered) => {
                PreferencesManager.Instance.StageTableFilter = newFiltered;
            },
            getTrProps: (state, rowInfo) => {
                return {
                    onClick: (e, handleOriginal) => {
                        if (!handleOriginal) {
                            this.setState({selectedStage: rowInfo.original});
                            this.props.onSelectedPipelineStageChanged(rowInfo.original);
                        }

                        if (handleOriginal) {
                            handleOriginal()
                        }
                    },
                    style: this.state.selectedStage && rowInfo.original.id === this.state.selectedStage.id ? {backgroundColor: "rgb(233, 236, 239)"} : {}
                }
            }
        };

        return (
            <div style={Object.assign({width: "100%"}, this.props.style || {})}>
                {this.renderDeleteProjectConfirmation()}
                {this.renderSubMenu()}
                <ReactTable {...props} className="-highlight"/>
            </div>
        );
    }
}

const _PipelineStageTable = graphql<any, any>(UpdatePipelineStageMutation, {
    props: ({mutate}) => ({
        updatePipelineStage: (pipelineStage: IPipelineStage) => mutate({
            variables: {pipelineStage}
        })
    })
})(__PipelineStageTable);

export const PipelineStageTable = graphql<any, any>(DeletePipelineStageMutation, {
    props: ({mutate}) => ({
        deletePipelineStage: (id: string) => mutate({
            variables: {id}
        })
    })
})(_PipelineStageTable);

const renderPerformance = (performance) => {
    if (performance === null) {
        return "";
    }

    return `${performance.num_in_process} | ${performance.num_ready_to_process}`;
};

