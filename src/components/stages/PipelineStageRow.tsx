import * as React from "react";
import {Glyphicon, Button, Badge} from "react-bootstrap";
import FontAwesome = require("react-fontawesome");
import pluralize = require("pluralize");
import {toast} from "react-toastify";

import {graphql} from "react-apollo";
import {tableButtonStyles, tableCellStyles} from "../../util/styleDefinitions";
import {ModalAlert, toastDeleteError, toastDeleteSuccess, toastUpdateError, toastUpdateSuccess} from "ndb-react-components";
import {IProject} from "../../models/project";
import {IPipelineStage} from "../../models/pipelineStage";
import {DeletePipelineStageMutation, UpdatePipelineStageMutation} from "../../graphql/pipelineStage";
import {EditPipelineStageDialog, PipelineStageDialogMode} from "./EditPipelineStageDialog";
import {ITaskDefinition} from "../../models/taskDefinition";

const previousStageIsAcquisitionRoot = "(acquisition root)";

interface IPipelineStageRowProps {
    pipelineStage?: IPipelineStage;

    projects: IProject[];
    tasks: ITaskDefinition[];

    updatePipelineStage?(project: IProject): any;
    deletePipelineStage?(project: IProject): any;
}

interface IPipelineStageRowState {
    isDeleted?: boolean;

    isUpdateDialogShown?: boolean;
    isDeleteDialogShown?: boolean;
}

const spanStyle = {
    color: "#AAAAAA",
    width: "100%"
};

@graphql(UpdatePipelineStageMutation, {
    props: ({mutate}) => ({
        updatePipelineStage: (pipelineStage: IPipelineStage) => mutate({
            variables: {pipelineStage}
        })
    })
})
@graphql(DeletePipelineStageMutation, {
    props: ({mutate}) => ({
        deletePipelineStage: (id: string) => mutate({
            variables: {id}
        })
    })
})
export class PipelineStageRow extends React.Component<IPipelineStageRowProps, IPipelineStageRowState> {
    constructor(props) {
        super(props);

        this.state = {
            isDeleted: false,
            isUpdateDialogShown: false,
            isDeleteDialogShown: false
        }
    }

    private onClickUpdatePipelineStage(evt: any) {
        evt.stopPropagation();

        this.setState({isUpdateDialogShown: true});
    }

    private onClickDeletePipelineStage(evt: any) {
        evt.stopPropagation();

        this.setState({isDeleteDialogShown: true});
    }

    getActivateText = isActive => isActive ? "pause" : "resume";

    getActivateGlyph = isActive => isActive ? "stop" : "play";

    getActivateStyle = isActive => isActive ? "info" : "success";

    public async onActiveClick() {
        await this.onAcceptUpdatePipelineStage({id: this.props.pipelineStage.id, is_processing: !this.props.pipelineStage.is_processing}, false);
    };

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
            const result = await this.props.deletePipelineStage(this.props.pipelineStage.id);

            if (result.data.deletePipelineStage.error) {
                toast.error(toastDeleteError(result.data.deletePipelineStage.error), {autoClose: false});
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

    private renderUpdatePipelineStageDialog() {
        if (this.state.isUpdateDialogShown) {
            return (
                <EditPipelineStageDialog show={this.state.isUpdateDialogShown}
                                         mode={PipelineStageDialogMode.Update}
                                         sourceStage={this.props.pipelineStage}
                                         projects={this.props.projects}
                                         tasks={this.props.tasks}
                                         onCancel={() => this.setState({isUpdateDialogShown: false})}
                                         onAccept={(p: IPipelineStage) => this.onAcceptUpdatePipelineStage(p)}/>
            );
        } else {
            return null;
        }
    }

    private renderDeletePipelineStageConfirmation() {
        if (!this.state.isDeleteDialogShown) {
            return null;
        }

        return (
            <ModalAlert show={this.state.isDeleteDialogShown} style="danger" header="Delete Pipeline Stage"
                        message={`Are you sure you want to delete ${this.props.pipelineStage.name} as a pipeline stage?`}
                        acknowledgeContent="Delete" canCancel={true} onCancel={() => this.onClearDeleteConfirmation()}
                        onAcknowledge={() => this.onDeletePipelineStage()}/>
        )
    }

    private renderPerformance(performance) {
        if (performance === null) {
            return "";
        }

        return `${performance.num_in_process} | ${performance.num_ready_to_process}`;
    };

    public render() {
        const pipelineStage = this.props.pipelineStage;

        if (this.state.isDeleted) {
            return null;
        }

        return (
            <tr>
                {this.renderUpdatePipelineStageDialog()}
                {this.renderDeletePipelineStageConfirmation()}
                <td style={tableCellStyles.middle}>
                    <Button bsSize="xs" bsStyle={this.getActivateStyle(pipelineStage.is_processing)} onClick={() => this.onActiveClick()}
                            style={{marginLeft: "10px"}} disabled={!pipelineStage.project.is_processing}>
                        <Glyphicon glyph={this.getActivateGlyph(pipelineStage.is_processing)}/>
                        {this.getActivateText(pipelineStage.is_processing)}
                    </Button>
                </td>
                <td style={{paddingLeft: "10px"}}>
                    <Button bsSize="sm" bsStyle="info" style={tableButtonStyles.edit} onClick={(evt) => this.onClickUpdatePipelineStage(evt)} disabled={pipelineStage.is_processing}>
                        <span>
                        <FontAwesome name="pencil"/>
                        </span>
                    </Button>
                </td>
                <td style={tableCellStyles.middle}>
                    {pipelineStage.name}<br/>
                    <span style={spanStyle}>{pipelineStage.description}</span>
                </td>
                <td style={tableCellStyles.middle}>
                    {pipelineStage.project.name}<br/>
                </td>
                <td style={tableCellStyles.middle}>
                    {pipelineStage.task.name}
                </td>
                <td style={tableCellStyles.middle}>
                    {pipelineStage.previous_stage ? pipelineStage.previous_stage.name : previousStageIsAcquisitionRoot}
                </td>
                <td style={tableCellStyles.middle}>
                    {pipelineStage.dst_path}
                </td>
                <td style={tableCellStyles.middle}>
                    {this.renderPerformance(pipelineStage.performance)}
                </td>
                <td style={{textAlign: "center", paddingRight: "10px", width: "20px", verticalAlign: "middle"}}>
                    {pipelineStage.child_stages.length === 0 ?
                        <Button bsSize="sm" bsStyle="danger" style={tableButtonStyles.remove} disabled={pipelineStage.is_processing}
                                onClick={(evt) => this.onClickDeletePipelineStage(evt)}>
                        <span>
                            <FontAwesome name="trash"/>
                        </span>
                        </Button>
                        : <Badge>{pipelineStage.child_stages.length} {pluralize("stage", pipelineStage.child_stages.length)}</Badge>}
                </td>
            </tr>);
    }
}

