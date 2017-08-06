import * as React from "react";
import {Panel, Button} from "react-bootstrap"
import {graphql} from 'react-apollo';
import {toast} from "react-toastify";

import {TaskRepositoryTable} from "./TaskRepositoryTable";
import {EditRepositoryDialog} from "./EditRepositoryDialog";
import {CreateTaskRepositoryMutation} from "../../../graphql/taskRepository";
import {ITaskRepository} from "../../../models/taskRepository";
import {ModalAlert, toastCreateError, toastCreateSuccess} from "ndb-react-components";
import FontAwesome = require("react-fontawesome");
import {panelHeaderStyles} from "../../../util/styleDefinitions";
import {TaskRepositoryHelpPanel} from "./TaskRepositoryHelp";
import {DialogMode} from "../../helpers/DialogUtils";

const styles = panelHeaderStyles;

interface ITaskRepositoryPanelProps {
    taskRepositories: ITaskRepository[];

    createTaskRepository?(taskRepository: ITaskRepository): any;
}

interface ITaskRepositoryPanelState {
    isAddDialogShown?: boolean;
    isHelpDialogShown?: boolean;
}

@graphql(CreateTaskRepositoryMutation, {
    props: ({mutate}) => ({
        createTaskRepository: (taskRepository: ITaskRepository) => mutate({
            variables: {taskRepository}
        })
    })
})
export class TaskRepositoryPanel extends React.Component<ITaskRepositoryPanelProps, ITaskRepositoryPanelState> {
    public constructor(props: ITaskRepositoryPanelProps) {
        super(props);

        this.state = {
            isAddDialogShown: false,
            isHelpDialogShown: false
        }
    }

    private onClickShowHelp(evt: any) {
        evt.stopPropagation();

        this.setState({isHelpDialogShown: true});
    }

    private onClickAddRepository(evt: any) {
        evt.stopPropagation();

        this.setState({isAddDialogShown: true});
    }

    private async onAcceptCreateRepository(repository: ITaskRepository) {
        this.setState({isAddDialogShown: false});

        try {
            const result = await this.props.createTaskRepository(repository);

            if (!result.data.createTaskRepository.taskRepository) {
                toast.error(toastCreateError(result.data.createTaskRepository.error), {autoClose: false});
            } else {
                toast.success(toastCreateSuccess(), {autoClose: 3000});
            }
        } catch (error) {
            toast.error(toastCreateError(error), {autoClose: false});
        }
    }

    private renderAddRepositoryDialog() {
        if (this.state.isAddDialogShown) {
            return (
                <EditRepositoryDialog show={this.state.isAddDialogShown}
                                      mode={DialogMode.Create}
                                      onCancel={() => this.setState({isAddDialogShown: false})}
                                      onAccept={(r: ITaskRepository) => this.onAcceptCreateRepository(r)}/>
            );
        } else {
            return null;
        }
    }

    private renderHelpDialog() {
        return this.state.isHelpDialogShown ? (
            <ModalAlert modalId="task-repository-help"
                        show={this.state.isHelpDialogShown}
                        style="success"
                        header="Task Repositories"
                        canCancel={false}
                        acknowledgeContent={"OK"}
                        onCancel={() => this.setState({isHelpDialogShown: false})}
                        onAcknowledge={() => this.setState({isHelpDialogShown: false})}>
                <TaskRepositoryHelpPanel/>
            </ModalAlert>) : null;
    }

    private renderHeader() {
        return (
            <div style={styles.flexContainer}>
                <h4 style={styles.titleItem}>Task Repositories</h4>
                <Button bsSize="sm" onClick={(evt: any) => this.onClickAddRepository(evt)}
                        style={styles.outlineButtonRight}>
                    <FontAwesome name="plus"/>
                    <span style={{paddingLeft: "10px"}}>
                        Add Repository
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
            <Panel header={this.renderHeader()} bsStyle="primary">
                {this.renderHelpDialog()}
                {this.renderAddRepositoryDialog()}
                <TaskRepositoryTable taskRepositories={this.props.taskRepositories}/>
            </Panel>
        );
    }
}
