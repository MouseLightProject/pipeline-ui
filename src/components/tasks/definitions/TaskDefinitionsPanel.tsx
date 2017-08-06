import * as React from "react";
import {Panel, Button} from "react-bootstrap"
import {graphql} from 'react-apollo';
import {toast} from "react-toastify";

import FontAwesome = require("react-fontawesome");
import {ITaskDefinition} from "../../../models/taskDefinition";
import {TaskDefinitionsTable} from "./TaskDefinitionTable";
import {EditTaskDefinitionDialog} from "./EditTaskDefinitionDialog";
import {ModalAlert, toastCreateError, toastCreateSuccess} from "ndb-react-components";
import {ITaskRepository} from "../../../models/taskRepository";
import {CreateTaskDefinitionMutation} from "../../../graphql/taskDefinition";
import {panelHeaderStyles} from "../../../util/styleDefinitions";
import {TaskDefinitionHelpPanel} from "./TaskDefinitionHelp";
import {DialogMode} from "../../helpers/DialogUtils";

const styles = panelHeaderStyles;

interface ITaskDefinitionPanelProps {
    taskDefinitions: ITaskDefinition[];
    taskRepositories: ITaskRepository[];

    createTaskDefinition?(taskDefinition: ITaskDefinition): any;
}

interface ITaskDefinitionPanelState {
    isAddDialogShown: boolean;
    isHelpDialogShown: boolean;
}

@graphql(CreateTaskDefinitionMutation, {
    props: ({mutate}) => ({
        createTaskDefinition: (taskDefinition: ITaskDefinition) => mutate({
            variables: {taskDefinition}
        })
    })
})
export class TaskDefinitionsPanel extends React.Component<ITaskDefinitionPanelProps, ITaskDefinitionPanelState> {
    public constructor(props: ITaskDefinitionPanelProps) {
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

    private onClickAddTaskDefinition(evt: any) {
        evt.stopPropagation();

        this.setState({isAddDialogShown: true});
    }

    private async onAcceptCreateTaskDefinition(taskDefinition: ITaskDefinition) {
        this.setState({isAddDialogShown: false});

        try {
            const result = await this.props.createTaskDefinition(taskDefinition);

            if (!result.data.createTaskDefinition.taskDefinition) {
                toast.error(toastCreateError(result.data.createTaskDefinition.error), {autoClose: false});
            } else {
                toast.success(toastCreateSuccess(), {autoClose: 3000});
            }
        } catch (error) {
            toast.error(toastCreateError(error), {autoClose: false});
        }
    }

    private renderAddTaskDefinitionDialog() {
        if (this.state.isAddDialogShown) {
            return (
                <EditTaskDefinitionDialog show={this.state.isAddDialogShown}
                                          mode={DialogMode.Create}
                                          taskRepositories={this.props.taskRepositories}
                                          onCancel={() => this.setState({isAddDialogShown: false})}
                                          onAccept={(r: ITaskDefinition) => this.onAcceptCreateTaskDefinition(r)}/>
            );
        } else {
            return null;
        }
    }

    private renderHelpDialog() {
        return this.state.isHelpDialogShown ? (
            <ModalAlert modalId="task-definition-help"
                        show={this.state.isHelpDialogShown}
                        style="success"
                        header="Tasks"
                        bsSize="large"
                        canCancel={false}
                        acknowledgeContent={"OK"}
                        onCancel={() => this.setState({isHelpDialogShown: false})}
                        onAcknowledge={() => this.setState({isHelpDialogShown: false})}>
                <TaskDefinitionHelpPanel/>
            </ModalAlert>) : null;
    }

    private renderHeader() {
        return (
            <div style={styles.flexContainer}>
                <h4 style={styles.titleItem}>Tasks</h4>
                <Button bsSize="sm" onClick={(evt: any) => this.onClickAddTaskDefinition(evt)}
                        style={styles.outlineButtonRight}>
                    <FontAwesome name="plus"/>
                    <span style={{paddingLeft: "10px"}}>
                        Add Task
                    </span>
                </Button>
                <Button bsSize="sm" onClick={(evt: any) => this.onClickShowHelp(evt)} style={styles.buttonRight}>
                    <FontAwesome name="question" size="2x"/>
                </Button>
            </div>);
    }

    public render() {
        return (
            <Panel header={this.renderHeader()} bsStyle="primary">
                {this.renderHelpDialog()}
                {this.renderAddTaskDefinitionDialog()}
                <TaskDefinitionsTable taskDefinitions={this.props.taskDefinitions}
                                      taskRepositories={this.props.taskRepositories}/>
            </Panel>
        );
    }
}
