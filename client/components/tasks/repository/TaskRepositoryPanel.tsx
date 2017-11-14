import * as React from "react";
import {Container, Header, Menu, MenuItem, Modal} from "semantic-ui-react";
import {graphql} from 'react-apollo';
import {toast} from "react-toastify";

import {TaskRepositoryTable} from "./TaskRepositoryTable";
import {EditRepositoryDialog} from "./EditRepositoryDialog";
import {CreateTaskRepositoryMutation} from "../../../graphql/taskRepository";
import {ITaskRepository} from "../../../models/taskRepository";
import {TaskRepositoryHelpPanel} from "./TaskRepositoryHelp";
import {DialogMode} from "../../helpers/DialogUtils";
import {themeHighlight} from "../../../util/styleDefinitions";
import {toastCreateError, toastCreateSuccess} from "../../../util/Toasts";

interface ITaskRepositoryPanelProps {
    taskRepositories: ITaskRepository[];
    pipelineVolume: string;

    createTaskRepository?(taskRepository: ITaskRepository): any;
}

interface ITaskRepositoryPanelState {
    isAddDialogShown?: boolean;
}

class _TaskRepositoryPanel extends React.Component<ITaskRepositoryPanelProps, ITaskRepositoryPanelState> {
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

    private renderPipelineVolume() {
        if (!this.props.pipelineVolume) {
            return null;
        }

        return (
            <div style={{padding: "6px", borderTop: "1px solid", backgroundColor:"#EFEFEF"}}>
                {`Note: /opt/pipeline maps to ${this.props.pipelineVolume}`}
            </div>
        )
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
                            Task Repositories
                        </Header>
                    </div>
                </Menu.Header>
                <Menu.Menu position="right">
                    <EditRepositoryDialog element={<MenuItem size="small" content="Add Repository" icon="plus"
                                                             onClick={(evt: any) => this.onClickAddRepository(evt)}/>}
                                          show={this.state.isAddDialogShown}
                                          mode={DialogMode.Create}
                                          onCancel={() => this.setState({isAddDialogShown: false})}
                                          onAccept={(r: ITaskRepository) => this.onAcceptCreateRepository(r)}/>
                    <Modal closeIcon={true} trigger={<MenuItem size="small" content="Help" icon="question"/>}>
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

export const TaskRepositoryPanel = graphql<any, any>(CreateTaskRepositoryMutation, {
    props: ({mutate}) => ({
        createTaskRepository: (taskRepository: ITaskRepository) => mutate({
            variables: {taskRepository}
        })
    })
})(_TaskRepositoryPanel);
