import * as React from "react";
import {Panel} from "react-bootstrap"

import {ProjectTable} from "./ProjectTable";
import {Loading} from "./Loading";
import {ProjectCreateComponent} from "./ProjectCreateComponent";
import gql from "graphql-tag";
import {graphql} from "react-apollo";
import {IProject} from "./models/QueryInterfaces";
import {contentStyles, panelHeaderStyles} from "./util/styleDefinitions";

const styles = panelHeaderStyles;

export class ProjectsContainer extends React.Component<any, any> {
    render() {
        return (
            <ProjectsQuery/>
        );
    }
}

class Projects extends React.Component<any, any> {
    onCreateProject = (project) => {
        this.props.createProjectMutation(project)
        .then(async () => {
            await this.props.data.refetch();
        }).catch((err) => {
            console.log(err);
        });
    };

    onSetProjectStatus = (id: string, shouldBeActive: boolean) => {
        this.props.setProjectStatusMutation(id, shouldBeActive)
        .then(async () => {
            await this.props.data.refetch();
        }).catch((err) => {
            console.log(err);
        });
    };

    onDeleteProject = (id: string) => {
        this.props.deleteProjectMutation(id)
        .then(async () => {
            await this.props.data.refetch();
        }).catch((err) => {
            console.log(err);
        });
    };

    public render() {
        const loading = !this.props.data || this.props.data.loading;

        const projects = !loading ? this.props.data.projects : [];

        return (
            <div style={contentStyles.body}>
                {this.props.loading ? <Loading/> :
                    <ProjectsPanel projects={projects} createCallback={this.onCreateProject}
                                   updateStatusCallback={this.onSetProjectStatus}
                                   deleteCallback={this.onDeleteProject}/>}
            </div>
        );
    }
}

interface IProjectsPanelProps {
    projects: IProject[];

    createCallback(project: IProject);
    updateStatusCallback(id: string, shouldBeActive: boolean): void;
    deleteCallback(id: string): void;
}

class ProjectsPanel extends React.Component<IProjectsPanelProps, any> {
    private renderHeader() {
        return (<div style={styles.flexContainer}><h4 style={styles.titleItem}>Acquisition Pipelines</h4>
            <div style={styles.buttonRight}/>
        </div>);
    }

    public render() {
        return (
            <div>
                <Panel header={this.renderHeader()} bsStyle="primary">
                    <ProjectTable projects={this.props.projects}
                                  updateStatusCallback={this.props.updateStatusCallback}
                                  deleteCallback={this.props.deleteCallback}/>
                </Panel>
                <ProjectCreateComponent createCallback={this.props.createCallback}/>
            </div>
        );
    }
}


const ProjectQuery = gql`query { 
    projects {
      id
      name
      description
      root_path
      sample_number
      sample_x_min
      sample_x_max
      sample_y_min
      sample_y_max
      sample_z_min
      sample_z_max
      region_x_min
      region_x_max
      region_y_min
      region_y_max
      region_z_min
      region_z_max
      is_processing
    }
}`;

const CreateProjectMutation = gql`mutation CreateProjectMutation($project: ProjectInput) {
  createProject(project: $project) {
      project {
        id
        name
        description
        root_path
        sample_number
        sample_x_min
        sample_x_max
        sample_y_min
        sample_y_max
        sample_z_min
        sample_z_max
        region_x_min
        region_x_max
        region_y_min
        region_y_max
        region_z_min
        region_z_max
        is_processing
        stages {
          id
          name
          depth
          previous_stage_id
          task_id
          task {
            id
            name
          }
          performance {
            id
            num_in_process
            num_ready_to_process
            num_execute
            num_complete
            num_error
            num_cancel
            cpu_average
            cpu_high
            cpu_low
            memory_average
            memory_high
            memory_low
            duration_average
            duration_high
            duration_low
          }
        }
    }
    error
  }
}`;

const SetProjectStatusMutation = gql`
  mutation SetProjectStatusMutation($id: String, $shouldBeActive: Boolean) {
    setProjectStatus(id:$id, shouldBeActive:$shouldBeActive) {
        project {
            id
            is_processing
        }
    }
  }
`;

const DeleteProjectMutation = gql`
  mutation DeleteProjectMutation($id: String!) {
    deleteProject(id:$id) {
        id
        error
    }
  }
`;


const ProjectsQuery = graphql(ProjectQuery, {
    options: {
        pollInterval: 5 * 1000
    }
})(graphql(CreateProjectMutation, {
    props: ({mutate}) => ({
        createProjectMutation: (project: any) => mutate({
            variables: {
                project: project
            }
        })
    })
})(graphql(SetProjectStatusMutation, {
    props: ({mutate}) => ({
        setProjectStatusMutation: (id: string, shouldBeActive: boolean) => mutate({
            variables: {
                id: id,
                shouldBeActive: shouldBeActive
            }
        })
    })
})(graphql(DeleteProjectMutation, {
    props: ({mutate}) => ({
        deleteProjectMutation: (id: string) => mutate({
            variables: {
                id: id
            }
        })
    })
})(Projects))));
