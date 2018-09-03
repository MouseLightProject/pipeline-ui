import * as React from "react";
import {Container, Header, Menu, MenuItem, Modal} from "semantic-ui-react";
import {Mutation} from "react-apollo";
import {toast} from "react-toastify";

import {ProjectTable} from "./ProjectTable";
import {ProjectsHelpPanel} from "./ProjectsHelp";
import {EditProjectDialog} from "./EditProjectDialog";
import {CreateProjectMutation} from "../../graphql/project";
import {IProject, IProjectInput} from "../../models/project";
import {DialogMode} from "../helpers/DialogUtils";
import {PreferencesManager} from "../../util/preferencesManager";
import {themeHighlight} from "../../util/styleDefinitions";
import {toastError, toastSuccess} from "../../util/Toasts";
import {BaseQuery} from "../../graphql/baseQuery";

interface IProjectsPanelProps {
    projects: IProject[];

    createProject?(project: IProjectInput): any;
}

interface IProjectsPanelState {
    isAddDialogShown?: boolean;
    isFiltered?: boolean;
}

export class ProjectsPanel extends React.Component<IProjectsPanelProps, IProjectsPanelState> {
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

    private onCompleteAddProject = (data) => {
        if (data.createProject.error) {
            toast.error(toastError("Create", data.createProject.error), {autoClose: false});
        } else {
            toast.success(toastSuccess("Create"), {autoClose: 3000});
        }
    };

    private onAddProjectError = (error) => {
        toast.error(toastError("Create", error), {autoClose: false});
    };

    private onToggleIsFiltered() {
        PreferencesManager.Instance.IsProjectTableFiltered = !this.state.isFiltered;

        this.setState({isFiltered: !this.state.isFiltered})
    }

    private renderMainMenu() {
        const icon = this.state.isFiltered ? "remove" : "filter";
        const content = this.state.isFiltered ? "Remove Filters" : "Apply Filters";

        return (
            <Menu style={{borderTop: "none", borderLeft: "none", borderRight: "none", borderRadius: 0, boxShadow: "none"}}>
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
                    <Mutation mutation={CreateProjectMutation} onCompleted={this.onCompleteAddProject}
                              onError={this.onAddProjectError}
                              update={(cache, {data: {createProject: {project}}}) => {
                                  const data: any = cache.readQuery({query: BaseQuery});
                                  cache.writeQuery({
                                      query: BaseQuery,
                                      data: Object.assign(data, {projects: data.projects.concat([project])})
                                  });
                              }}>
                        {(createProject) => (
                            <EditProjectDialog trigger={<MenuItem size="small" content="Add Pipeline" icon="plus"
                                                                  onClick={(evt: any) => this.onClickAddProject(evt)}/>}
                                               isOpen={this.state.isAddDialogShown}
                                               mode={DialogMode.Create}
                                               onCancel={() => this.setState({isAddDialogShown: false})}
                                               onAccept={(p: IProject) => {
                                                   this.setState({isAddDialogShown: false});
                                                   createProject({variables: {project: p}});
                                               }}/>
                        )
                        }
                    </Mutation>

                    <MenuItem size="mini" content="Import Pipeline" icon="add circle" disabled={true}/>
                    <MenuItem size="mini" content={content} icon={icon} onClick={() => this.onToggleIsFiltered()}/>

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
