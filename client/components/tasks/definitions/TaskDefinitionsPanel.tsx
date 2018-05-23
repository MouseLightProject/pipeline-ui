import * as React from "react";
import {Container, Header, Menu, MenuItem, Modal} from "semantic-ui-react";
import {Mutation} from "react-apollo";
import {toast} from "react-toastify";

import {ITaskDefinition} from "../../../models/taskDefinition";
import {TaskDefinitionsTable} from "./TaskDefinitionTable";
import {EditTaskDefinitionDialog} from "./EditTaskDefinitionDialog";
import {ITaskRepository} from "../../../models/taskRepository";
import {CreateTaskDefinitionMutation} from "../../../graphql/taskDefinition";
import {TaskDefinitionHelpPanel} from "./TaskDefinitionHelp";
import {DialogMode} from "../../helpers/DialogUtils";
import {themeHighlight} from "../../../util/styleDefinitions";
import {toastError, toastSuccess} from "../../../util/Toasts";
import {BaseQuery} from "../../../graphql/baseQuery";

interface ITaskDefinitionPanelProps {
    taskDefinitions: ITaskDefinition[];
    taskRepositories: ITaskRepository[];

    createTaskDefinition?(taskDefinition: ITaskDefinition): any;
}

interface ITaskDefinitionPanelState {
    isAddDialogShown: boolean;
    isHelpDialogShown: boolean;
}

export class TaskDefinitionsPanel extends React.Component<ITaskDefinitionPanelProps, ITaskDefinitionPanelState> {
    public constructor(props: ITaskDefinitionPanelProps) {
        super(props);

        this.state = {
            isAddDialogShown: false,
            isHelpDialogShown: false
        }
    }

    private onClickAddTaskDefinition(evt: any) {
        evt.stopPropagation();
        this.setState({isAddDialogShown: true});
    }

    private onCompleteAddDefinition = (data) => {
        if (!data.createTaskDefinition.taskDefinition) {
            toast.error(toastError("Create", data.createTaskDefinition.error), {autoClose: false});
        } else {
            toast.success(toastSuccess("Create"), {autoClose: 3000});
        }
    };

    private onAddTaskDefinitionError = (error) => {
        toast.error(toastError("Create", error), {autoClose: false});
    };

    private renderMainMenu() {
        return (
            <Mutation mutation={CreateTaskDefinitionMutation} onCompleted={this.onCompleteAddDefinition}
                      onError={this.onAddTaskDefinitionError}
                      update={(cache, {data: {createTaskDefinition: {taskDefinition}}}) => {
                          const data: any = cache.readQuery({query: BaseQuery});
                          cache.writeQuery({
                              query: BaseQuery,
                              data: Object.assign(data, {taskDefinitions: data.taskDefinitions.concat([taskDefinition])})
                          });
                      }}>
                {(createTaskDefinition) => {
                    return (
                        <Menu style={{borderLeft: "none", borderRight: "none"}}>
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
                            <Menu.Menu position="right">
                                <EditTaskDefinitionDialog element={<MenuItem size="small" content="Add Task" icon="plus"
                                                                             onClick={(evt: any) => this.onClickAddTaskDefinition(evt)}/>}
                                                          show={this.state.isAddDialogShown}
                                                          mode={DialogMode.Create}
                                                          taskRepositories={this.props.taskRepositories}
                                                          onCancel={() => this.setState({isAddDialogShown: false})}
                                                          onAccept={(t: ITaskDefinition) => {
                                                              this.setState({isAddDialogShown: false});
                                                              createTaskDefinition({variables: {taskDefinition: t}});
                                                          }}/>
                                <Modal closeIcon={true}
                                       trigger={<MenuItem size="small" content="Help" icon="question"/>}>
                                    <Modal.Header>Tasks</Modal.Header>
                                    <Modal.Content image>
                                        <Modal.Description>
                                            <TaskDefinitionHelpPanel/>
                                        </Modal.Description>
                                    </Modal.Content>
                                </Modal>
                            </Menu.Menu>
                        </Menu>
                    );
                }
                }
            </Mutation>
        );
    }

    public render() {
        return (
            <Container fluid style={{display: "flex", flexDirection: "column"}}>
                {this.renderMainMenu()}
                <TaskDefinitionsTable style={{padding: "20px"}}
                                      taskDefinitions={this.props.taskDefinitions}
                                      taskRepositories={this.props.taskRepositories}/>
            </Container>
        );
    }
}
