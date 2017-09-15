import * as React from "react";
import {Panel, Button} from "react-bootstrap";
import FontAwesome = require("react-fontawesome");
import {graphql, InjectedGraphQLProps} from 'react-apollo';
import {toast} from "react-toastify";

import {PipelineStageTable} from "./PipelineStageTable";
import {AllProjectsId} from "../helpers/ProjectMenu";
import {IPipelineStage} from "../../models/pipelineStage";
import {panelHeaderStyles} from "../../util/styleDefinitions";
import {IProject} from "../../models/project";
import {ProjectMenuNavbar} from "../helpers/ProjectMenuNavbar";
import {StagesHelpPanel} from "./PipelineStagesHelp";
import {ModalAlert, toastCreateError, toastCreateSuccess} from "ndb-react-components";
import {EditPipelineStageDialog} from "./EditPipelineStageDialog";
import {CreateStageMutation} from "../../graphql/pipelineStage";
import {TaskQuery} from "../../graphql/taskDefinition";
import {ITaskRepository} from "../../models/taskRepository";
import {ITaskDefinition} from "../../models/taskDefinition";
import {DialogMode} from "../helpers/DialogUtils";

const styles = panelHeaderStyles;

interface ITaskQueryProps {
    taskDefinitions: ITaskDefinition[];
    taskRepositories: ITaskRepository[];
}

interface IPipelineStagesPanelProps extends InjectedGraphQLProps<ITaskQueryProps> {
    projects: IProject[];
    pipelineStages: IPipelineStage[];
    pipelinesForProjectId: string;
    selectedPipelineStage: IPipelineStage;

    onPipelinesForProjectIdChanged(id: string);
    onSelectedPipelineStageChanged(stage: IPipelineStage);

    createPipelineStage?(stage: IPipelineStage): any;
}

interface IIPipelineStagesPanelState {
    projectId: string;
    isAddDialogShown?: boolean;
    isHelpDialogShown?: boolean;
}

@graphql(TaskQuery, {
    options: {
        pollInterval: 5 * 1000
    }
})
@graphql(CreateStageMutation, {
    props: ({mutate}) => ({
        createPipelineStage: (pipelineStage: IPipelineStage) => mutate({
            variables: {pipelineStage}
        })
    })
})
export class PipelineStagesPanel extends React.Component<IPipelineStagesPanelProps, IIPipelineStagesPanelState> {
    constructor(props) {
        super(props);

        this.state = {
            projectId: AllProjectsId,
            isAddDialogShown: false,
            isHelpDialogShown: false
        };
    }

    private onClickShowHelp(evt: any) {
        evt.stopPropagation();

        this.setState({isHelpDialogShown: true});
    }

    private onClickAddStage(evt: any) {
        evt.stopPropagation();

        this.setState({isAddDialogShown: true});
    }

    private onProjectSelectionChange(eventKey) {
        this.setState({projectId: eventKey}, null);
    }

    private async onAcceptCreateStage(stage: IPipelineStage) {
        this.setState({isAddDialogShown: false});

        try {
            const result = await this.props.createPipelineStage(stage);

            if (!result.data.createPipelineStage.pipelineStage) {
                toast.error(toastCreateError(result.data.createStage.error), {autoClose: false});
            } else {
                toast.success(toastCreateSuccess(), {autoClose: 3000});
            }
        } catch (error) {
            toast.error(toastCreateError(error), {autoClose: false});
        }
    }

    private renderAddStageDialog() {
        if (this.state.isAddDialogShown) {
            return (
                <EditPipelineStageDialog show={this.state.isAddDialogShown}
                                         mode={DialogMode.Create}
                                         projects={this.props.projects}
                                         tasks={this.props.data.taskDefinitions}
                                         onCancel={() => this.setState({isAddDialogShown: false})}
                                         onAccept={(s: IPipelineStage) => this.onAcceptCreateStage(s)}/>
            );
        } else {
            return null;
        }
    }

    private renderHelpDialog() {
        return this.state.isHelpDialogShown ? (
            <ModalAlert modalId="pipeline-stages-help"
                        show={this.state.isHelpDialogShown}
                        style="success"
                        header="Pipeline Stages"
                        canCancel={false}
                        acknowledgeContent={"OK"}
                        onCancel={() => this.setState({isHelpDialogShown: false})}
                        onAcknowledge={() => this.setState({isHelpDialogShown: false})}>
                <StagesHelpPanel/>
            </ModalAlert>) : null;
    }

    private renderHeader() {
        return (
            <div style={styles.flexContainer}>
                <h4 style={styles.titleItem}>Pipeline Stages</h4>
                <Button bsSize="sm" onClick={(evt: any) => this.onClickAddStage(evt)}
                        style={styles.outlineButtonRight}>
                    <FontAwesome name="plus"/>
                    <span style={{paddingLeft: "10px"}}>
                        Add Pipeline
                    </span>
                </Button>
                <Button bsSize="sm" onClick={(evt: any) => this.onClickShowHelp(evt)} style={styles.buttonRight}>
                    <FontAwesome name="question" size="2x"/>
                </Button>
            </div>
        );
    }

    public render() {
        return (
            <div>
                <Panel header={this.renderHeader()} bsStyle="primary">
                    {this.renderHelpDialog()}
                    {this.renderAddStageDialog()}
                    <ProjectMenuNavbar keyPrefix="createStageSelectProjectTopLevel" projects={this.props.projects}
                                       selectedProjectId={this.state.projectId}
                                       onProjectSelectionChange={(eventKey) => this.onProjectSelectionChange(eventKey)}
                                       includeAllProjects={true}>
                    </ProjectMenuNavbar>
                    <PipelineStageTable selectedProjectId={this.state.projectId}
                                        pipelineStages={this.props.pipelineStages}
                                        tasks={this.props.data.taskDefinitions}
                                        projects={this.props.projects}
                                        selectedPipelineStage={this.props.selectedPipelineStage}
                                        onSelectedPipelineStageChanged={this.props.onSelectedPipelineStageChanged}/>
                </Panel>
            </div>
        );
    }
}
