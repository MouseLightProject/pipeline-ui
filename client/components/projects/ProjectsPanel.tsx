import * as React from "react";
import {Panel, Button} from "react-bootstrap"
import FontAwesome = require("react-fontawesome");
import {graphql} from 'react-apollo';
import {toast} from "react-toastify";

import {ProjectTable} from "./ProjectTable";
import {panelHeaderStyles} from "../../util/styleDefinitions";
import {ProjectsHelpPanel} from "./ProjectsHelp";
import {ModalAlert, toastCreateError, toastCreateSuccess} from "ndb-react-components";
import {EditProjectDialog} from "./EditProjectDialog";
import {CreateProjectMutation} from "../../graphql/project";
import {IProject, IProjectInput} from "../../models/project";
import {DialogMode} from "../helpers/DialogUtils";
import {PreferencesManager} from "../../util/preferencesManager";

const styles = panelHeaderStyles;

interface IProjectsPanelProps {
    projects: IProject[];

    createProject?(project: IProjectInput): any;
}

interface IProjectsPanelState {
    isAddDialogShown?: boolean;
    isHelpDialogShown?: boolean;
    isFiltered?: boolean;
}

@graphql(CreateProjectMutation, {
    props: ({mutate}) => ({
        createProject: (project: IProject) => mutate({
            variables: {project}
        })
    })
})
export class ProjectsPanel extends React.Component<IProjectsPanelProps, IProjectsPanelState> {
    public constructor(props: IProjectsPanelProps) {
        super(props);

        this.state = {
            isAddDialogShown: false,
            isHelpDialogShown: false,
            isFiltered: PreferencesManager.Instance.IsProjecTableFiltered
        }
    }

    private onClickShowHelp(evt: any) {
        evt.stopPropagation();

        this.setState({isHelpDialogShown: true});
    }

    private onClickAddProject(evt: any) {
        evt.stopPropagation();

        this.setState({isAddDialogShown: true});
    }

    private toggleIsFiltered() {
        PreferencesManager.Instance.IsProjecTableFiltered = !this.state.isFiltered;

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

    private renderAddProjectDialog() {
        if (this.state.isAddDialogShown) {
            return (
                <EditProjectDialog show={this.state.isAddDialogShown}
                                   mode={ DialogMode.Create}
                                   onCancel={() => this.setState({isAddDialogShown: false})}
                                   onAccept={(p: IProject) => this.onAcceptCreateProject(p)}/>
            );
        } else {
            return null;
        }
    }

    private renderHelpDialog() {
        return this.state.isHelpDialogShown ? (
            <ModalAlert modalId="projects-help"
                        show={this.state.isHelpDialogShown}
                        style="success"
                        header="Pipeline Projects"
                        canCancel={false}
                        acknowledgeContent={"OK"}
                        onCancel={() => this.setState({isHelpDialogShown: false})}
                        onAcknowledge={() => this.setState({isHelpDialogShown: false})}>
                <ProjectsHelpPanel/>
            </ModalAlert>) : null;
    }

    private renderHeader() {
        return (
            <div style={styles.flexContainer}>
                <h4 style={styles.titleItem}>Pipeline Projects</h4>
                <Button bsSize="sm" onClick={() => this.toggleIsFiltered()}
                        style={Object.assign({marginRight: "20px"}, styles.buttonRight)}>
                    <FontAwesome name={this.state.isFiltered ? "remove" : "filter"} size="2x"/>
                </Button>
                <Button bsSize="sm" onClick={(evt: any) => this.onClickAddProject(evt)}
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
                    {this.renderAddProjectDialog()}
                    <ProjectTable projects={this.props.projects} isFiltered={this.state.isFiltered}/>
                </Panel>
            </div>
        );
    }
}
