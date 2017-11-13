import * as React from "react";
import {graphql} from 'react-apollo';
import {Container, Header, Menu, MenuItem, Modal} from "semantic-ui-react";
import {toast} from "react-toastify";

import {ProjectTable} from "./ProjectTable";
import {ProjectsHelpPanel} from "./ProjectsHelp";
import {toastCreateError, toastCreateSuccess} from "ndb-react-components";
import {EditProjectDialog} from "./EditProjectDialog";
import {CreateProjectMutation} from "../../graphql/project";
import {IProject, IProjectInput} from "../../models/project";
import {DialogMode} from "../helpers/DialogUtils";
import {PreferencesManager} from "../../util/preferencesManager";
import {themeHighlight} from "../../util/styleDefinitions";

interface IProjectsPanelProps {
    projects: IProject[];

    createProject?(project: IProjectInput): any;
}

interface IProjectsPanelState {
    isAddDialogShown?: boolean;
    isFiltered?: boolean;
}

export class _ProjectsPanel extends React.Component<IProjectsPanelProps, IProjectsPanelState> {
    public constructor(props: IProjectsPanelProps) {
        super(props);

        this.state = {
            isAddDialogShown: false,
            isFiltered: PreferencesManager.Instance.IsProjectTableFiltered
        }
    }

    private onClickAddProject(evt: any) {
        evt.stopPropagation();

        this.setState({isAddDialogShown: true});
    }

    private onToggleIsFiltered() {
        PreferencesManager.Instance.IsProjectTableFiltered = !this.state.isFiltered;

        this.setState({isFiltered: !this.state.isFiltered})
    }

    private async onAcceptCreateProject(project: IProjectInput) {
        this.setState({isAddDialogShown: false});

        try {
            const result = await this.props.createProject(project);

            if (!result.data.createProject.project) {
                toast.error(toastCreateError(result.data.createProject.error), {autoClose: false});
            } else {
                toast.success(toastCreateSuccess(), {autoClose: 3000});
            }
        } catch (error) {
            toast.error(toastCreateError(error), {autoClose: false});
        }
    }

    private renderMainMenu() {
        const icon = this.state.isFiltered ? "remove" : "filter";
        const content = this.state.isFiltered ? "Remove Filters" : "Apply Filters";

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
                            Pipeline Projects
                        </Header>
                    </div>
                </Menu.Header>
                <Menu.Menu position="right">
                    <EditProjectDialog element={<MenuItem size="small" content="Add Pipeline" icon="plus"
                                                          onClick={(evt: any) => this.onClickAddProject(evt)}/>}
                                       show={this.state.isAddDialogShown}
                                       mode={DialogMode.Create}
                                       onCancel={() => this.setState({isAddDialogShown: false})}
                                       onAccept={(p: IProject) => this.onAcceptCreateProject(p)}/>

                    <MenuItem size="mini" content={content} icon={icon}
                              onClick={() => this.onToggleIsFiltered()}/>

                    <Modal closeIcon={true} trigger={<MenuItem size="small" content="Help" icon="question"/>}>
                        <Modal.Header>Pipeline Projects</Modal.Header>
                        <Modal.Content image>
                            <Modal.Description>
                                <ProjectsHelpPanel/>
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
                <ProjectTable style={{padding: "20px"}} projects={this.props.projects}
                              isFiltered={this.state.isFiltered}/>
            </Container>
        );
    }
}

export const ProjectsPanel = graphql<any, any>(CreateProjectMutation, {
    props: ({mutate}) => ({
        createProject: (project: IProject) => mutate({
            variables: {project}
        })
    })
})(_ProjectsPanel);