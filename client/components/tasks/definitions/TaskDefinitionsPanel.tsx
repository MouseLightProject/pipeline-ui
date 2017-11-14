import * as React from "react";
import {Panel, Button} from "react-bootstrap"
import {graphql} from 'react-apollo';
import {toast} from "react-toastify";
import {Container, Header, Menu} from "semantic-ui-react";

import {ITaskDefinition} from "../../../models/taskDefinition";
import {TaskDefinitionsTable} from "./TaskDefinitionTable";
import {EditTaskDefinitionDialog} from "./EditTaskDefinitionDialog";
import {ModalAlert, toastCreateError, toastCreateSuccess} from "ndb-react-components";
import {ITaskRepository} from "../../../models/taskRepository";
import {CreateTaskDefinitionMutation} from "../../../graphql/taskDefinition";
import {TaskDefinitionHelpPanel} from "./TaskDefinitionHelp";
import {DialogMode} from "../../helpers/DialogUtils";
import {themeHighlight} from "../../../util/styleDefinitions";

interface ITaskDefinitionPanelProps {
    taskDefinitions: ITaskDefinition[];
    taskRepositories: ITaskRepository[];

    createTaskDefinition?(taskDefinition: ITaskDefinition): any;
}

interface ITaskDefinitionPanelState {
    isAddDialogShown: boolean;
    isHelpDialogShown: boolean;
}

export class _TaskDefinitionsPanel extends React.Component<ITaskDefinitionPanelProps, ITaskDefinitionPanelState> {
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
            <div>
                <h4>Tasks</h4>
                <Button bsSize="sm" onClick={(evt: any) => this.onClickAddTaskDefinition(evt)}>
                    {/*<FontAwesome name="plus"/>*/}
                    <span style={{paddingLeft: "10px"}}>
                        Add Task
                    </span>
                </Button>
                <Button bsSize="sm" onClick={(evt: any) => this.onClickShowHelp(evt)}>
                    {/*<FontAwesome name="question" size="2x"/>*/}
                </Button>
            </div>);
    }

    private renderMainMenu() {
        return (
            <Menu style={{borderTop: "none", borderLeft: "none", borderRight: "none"}}>
                <Menu.Header>
                    <div style={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: "10px",
                        paddingTop: "4px"
                    }}>
                        <Header style={{color: themeHighlight}}>
                            Tasks
                        </Header>
                    </div>
                </Menu.Header>
            </Menu>
        );
    }

    public render() {
        return (
            <Container fluid style={{display: "flex", flexDirection: "column"}}>
                {this.renderMainMenu()}
                {this.renderHelpDialog()}
                {this.renderAddTaskDefinitionDialog()}
                <TaskDefinitionsTable style={{padding: "20px"}}
                                      taskDefinitions={this.props.taskDefinitions}
                                      taskRepositories={this.props.taskRepositories}/>
            </Container>
        );
    }
}

export const TaskDefinitionsPanel = graphql<ITaskDefinitionPanelProps, any>(CreateTaskDefinitionMutation, {
    props: ({mutate}) => ({
        createTaskDefinition: (taskDefinition: ITaskDefinition) => mutate({
            variables: {taskDefinition}
        })
    })
})(_TaskDefinitionsPanel);
