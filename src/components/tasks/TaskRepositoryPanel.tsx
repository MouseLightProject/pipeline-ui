import * as React from "react";
import {Panel, Button, Glyphicon} from "react-bootstrap"
import {graphql} from 'react-apollo';
import {toast} from "react-toastify";

import {TaskRepositoryTable} from "./TaskRepositoryTable";
import {EditRepositoryDialog, RepositoryDialogMode} from "./EditRepositoryDialog";
import {CreateTaskRepositoryMutation} from "../../graphql/taskRepository";
import {ITaskRepository} from "../../models/taskRepository";
import {toastCreateError, toastCreateSuccess} from "ndb-react-components";

const styles = {
    flexContainer: {
        display: "flex"
    },
    flexItem: {
        display: "inline",
        marginRight: "auto",
        marginTop: "auto",
        marginBottom: "auto",
        fontSize: "17px"
    },
    flexItemRight: {
        alignSelf: "flex-end" as "flex-end",
        marginTop: "auto",
        marginBottom: "auto",
        background: "transparent",
        color: "white",
        border: "none"
    }
};

interface ITaskRepositoryPanelProps {
    taskRepositories: ITaskRepository[];

    createTaskRepository?(taskRepository: ITaskRepository): any;
}

interface ITaskRepositoryPanelState {
    isAddDialogShown?: boolean;
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

    private renderAddRepositoryDialog() {
        if (this.state.isAddDialogShown) {
            return (
                <EditRepositoryDialog show={this.state.isAddDialogShown}
                                      mode={RepositoryDialogMode.Create}
                                      onCancel={() => this.setState({isAddDialogShown: false})}
                                      onAccept={(r: ITaskRepository) => this.onAcceptCreateRepository(r)}/>
            );
        } else {
            return null;
        }
    }

    private renderHeader() {
        return (
            <div style={styles.flexContainer}>
                <h4 style={styles.flexItem}>Task Repositories</h4>
                <Button bsSize="sm" onClick={(evt: any) => this.onClickAddRepository(evt)} style={styles.flexItemRight}>
                    <Glyphicon glyph="plus" style={{paddingRight: "10px"}}/>Add Repository</Button>
            </div>
        );
    }

    public render() {
        return (
            <Panel header={this.renderHeader()} bsStyle="primary">
                <TaskRepositoryTable taskRepositories={this.props.taskRepositories}/>
                {this.renderAddRepositoryDialog()}
            </Panel>
        );
    }
}
