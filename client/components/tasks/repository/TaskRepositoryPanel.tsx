import * as React from "react";
import {Container, Header, Menu, MenuItem, Modal} from "semantic-ui-react";
import {Mutation} from "react-apollo";
import {toast} from "react-toastify";

import {TaskRepositoryTable} from "./TaskRepositoryTable";
import {EditRepositoryDialog} from "./EditRepositoryDialog";
import {CreateTaskRepositoryMutation} from "../../../graphql/taskRepository";
import {ITaskRepository} from "../../../models/taskRepository";
import {TaskRepositoryHelpPanel} from "./TaskRepositoryHelp";
import {DialogMode} from "../../helpers/DialogUtils";
import {themeHighlight} from "../../../util/styleDefinitions";
import {toastError, toastSuccess} from "../../../util/Toasts";
import {BaseQuery} from "../../../graphql/baseQuery";

interface ITaskRepositoryPanelProps {
    taskRepositories: ITaskRepository[];
    pipelineVolume: string;

    createTaskRepository?(taskRepository: ITaskRepository): any;
}

interface ITaskRepositoryPanelState {
    isAddDialogShown?: boolean;
}

export class TaskRepositoryPanel extends React.Component<ITaskRepositoryPanelProps, ITaskRepositoryPanelState> {
    public constructor(props: ITaskRepositoryPanelProps) {
        super(props);

        this.state = {
            isAddDialogShown: false
        }
    }

    private onClickAddRepository(evt: any) {
        evt.stopPropagation();

        this.setState({isAddDialogShown: true});
    }

    private onCompleteAddRepository = (data) => {
        if (!data.createTaskRepository.taskRepository) {
            toast.error(toastError("Create", data.createTaskRepository.error), {autoClose: false});
        } else {
            toast.success(toastSuccess("Create"), {autoClose: 3000});
        }
    };

    private onAddRepositoryError = (error) => {
        toast.error(toastError("Create", error), {autoClose: false});
    };

    private renderPipelineVolume() {
        if (!this.props.pipelineVolume) {
            return null;
        }

        return (
            <div style={{padding: "6px", borderTop: "1px solid", backgroundColor: "#EFEFEF"}}>
                {`Note: /opt/pipeline maps to ${this.props.pipelineVolume}`}
            </div>
        )
    }

    private renderMainMenu() {
        return (
            <Mutation mutation={CreateTaskRepositoryMutation} onCompleted={this.onCompleteAddRepository}
                      onError={this.onAddRepositoryError}
                      update={(cache, {data: {createTaskRepository: {taskRepository}}}) => {
                          const data: any = cache.readQuery({query: BaseQuery});
                          cache.writeQuery({
                              query: BaseQuery,
                              data: Object.assign(data, {taskRepositories: data.taskRepositories.concat([taskRepository])})
                          });
                      }}>
                {(createTaskRepository) => {
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
                                        Task Repositories
                                    </Header>
                                </div>
                            </Menu.Header>
                            <Menu.Menu position="right">
                                <EditRepositoryDialog
                                    trigger={<MenuItem size="small" content="Add Repository" icon="plus"
                                                       onClick={(evt: any) => this.onClickAddRepository(evt)}/>}
                                    isOpen={this.state.isAddDialogShown}
                                    mode={DialogMode.Create}
                                    onCancel={() => this.setState({isAddDialogShown: false})}
                                    onAccept={(r: ITaskRepository) => {
                                        this.setState({isAddDialogShown: false});
                                        createTaskRepository({variables: {taskRepository: r}});
                                    }}/>
                                <Modal closeIcon={true}
                                       trigger={<MenuItem size="small" content="Help" icon="question"/>}>
                                    <Modal.Header>Task Repositories</Modal.Header>
                                    <Modal.Content image>
                                        <Modal.Description>
                                            <TaskRepositoryHelpPanel/>
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
                <TaskRepositoryTable style={{padding: "20px"}} taskRepositories={this.props.taskRepositories}/>
                {this.renderPipelineVolume()}
            </Container>
        );
    }
}
