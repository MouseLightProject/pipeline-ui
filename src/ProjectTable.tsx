import * as React from "react";
import {Table, Glyphicon, Button} from "react-bootstrap";

import {IProject} from "./QueryInterfaces";
import graphql from "react-apollo/graphql";
import gql from "graphql-tag/index";
import {
    DynamicEditField, nonNegativeIntegerFilterFunction,
    clickToEditFormatFunction, nonNegativeIntegerFormatFunction
} from "./helpers/DynamicEditField";

interface IProjectRowProps {
    project?: IProject;

    onUpdateProject(project: any);
    updateStatusCallback(id: string, shouldBeActive: boolean): void;
    deleteCallback(id: string): void;
}

const spanStyle = {
    color: "#AAAAAA",
    width: "100%"
};

class ProjectRow extends React.Component<IProjectRowProps, any> {
    constructor(props) {
        super(props);

        this.state = {
            project: props.project,
            revertValue: null,
        }
    }

    onDelete = () => {
        this.props.deleteCallback(this.state.project.id);
    };

    onActiveClick = () => {
        this.props.updateStatusCallback(this.state.project.id, !this.state.project.is_processing);
    };

    onAcceptNameEdit(value): boolean {
        let project = {id: this.state.project.id, name: value};

        this.props.onUpdateProject(project);

        return true;
    };

    onAcceptDescriptionEdit(value): boolean {
        let project = {id: this.state.project.id, description: value};

        this.props.onUpdateProject(project);

        return true;
    };

    onAcceptRootPathEdit(value): boolean {
        let project = {id: this.state.project.id, root_path: value};

        this.props.onUpdateProject(project);

        return true;
    };

    onAcceptSampleEdit(value): boolean {
        let project = {id: this.state.project.id, sample_number: value};

        this.props.onUpdateProject(project);

        return true;
    };

    getActivateText = isActive => isActive ? "Stop" : "Start";

    getActivateGlyph = isActive => isActive ? "stop" : "play";

    getActivateStyle = isActive => isActive ? "info" : "success";

    getRegionText = (value, isMin) => value < 0 ? (isMin ? "any" : "any") : value.toString();

    getRegionMinDescription = project => {
        return `[${this.getRegionText(project.region_x_min, true)}, ${this.getRegionText(project.region_y_min, true)}, ${this.getRegionText(project.region_z_min, true)}]`;
    };

    getRegionMaxDescription = project => {
        return `[${this.getRegionText(project.region_x_max, false)}, ${this.getRegionText(project.region_y_max, false)}, ${this.getRegionText(project.region_z_max, false)}]`;
    };

    componentWillReceiveProps(nextProps) {
        this.setState({project: nextProps.project}, null);
    }

    render() {
        let project = this.state.project;

        const columnLimitStyle = {
            "maxWidth": "200px"
        };

        return (
            <tr>
                <td><Button bsSize="xsmall" bsStyle={this.getActivateStyle(project.is_processing)}
                            onClick={this.onActiveClick}><Glyphicon
                    glyph={this.getActivateGlyph(project.is_processing)}/> {this.getActivateText(project.is_processing)}
                </Button></td>
                <td>
                    <DynamicEditField style={spanStyle} initialValue={project.sample_number}
                                      acceptFunction={value => this.onAcceptSampleEdit(value)}
                                      filterFunction={nonNegativeIntegerFilterFunction}
                                      formatFunction={nonNegativeIntegerFormatFunction}/>
                </td>
                <td>
                    <DynamicEditField style={columnLimitStyle} initialValue={project.name}
                                      acceptFunction={value => this.onAcceptNameEdit(value)}
                                      formatFunction={clickToEditFormatFunction}/>
                    <DynamicEditField style={spanStyle} initialValue={project.description}
                                      acceptFunction={value => this.onAcceptDescriptionEdit(value)}
                                      formatFunction={clickToEditFormatFunction}/>
                </td>
                <td>
                    <DynamicEditField initialValue={project.root_path}
                                      canEditFunction={() => !this.state.project.is_processing}
                                      canEditFailMessage="The path to the pipeline root can not be modified while the pipeline is running"
                                      acceptFunction={value => this.onAcceptRootPathEdit(value)}
                                      formatFunction={clickToEditFormatFunction}/>
                </td>
                <td>{this.getRegionMinDescription(project)}<br/><span>{this.getRegionMaxDescription(project)}</span>
                </td>
                <td>{`${project.id.slice(0, 8)}`}</td>
                <td><Button bsSize="xsmall" bsStyle="warning" onClick={this.onDelete}><Glyphicon glyph="trash"/> Remove</Button>
                </td>
            </tr>);
    }
}

interface IProjectTable {
    projects: IProject[];
    updateProjectMutation(project: any);
    updateStatusCallback(id: string, shouldBeActive: boolean): void;
    deleteCallback(id: string): void;
}

class ProjectTable extends React.Component<IProjectTable, any> {
    onUpdateProject = (project) => {
        this.props.updateProjectMutation(project)
        .then(() => {
        }).catch((err) => {
            console.log(err);
        });
    };

    render() {
        let rows = [];

        if (this.props.projects) {
            rows = this.props.projects.map(project => (
                <ProjectRow key={"tr_project_" + project.id} project={project}
                            updateStatusCallback={this.props.updateStatusCallback}
                            deleteCallback={this.props.deleteCallback}
                            onUpdateProject={this.onUpdateProject}/>));
        }

        return (
            <Table condensed>
                <thead>
                <tr key="project_header">
                    <th>Active</th>
                    <th>Sample</th>
                    <th>Name<br/><span style={spanStyle}>Description</span></th>
                    <th>Path to Dashboard Root</th>
                    <th>Selected Region</th>
                    <th>Id</th>
                    <th/>
                </tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </Table>
        );

    }
}

const UpdateProjectMutation = gql`
  mutation UpdateProjectMutation($project: ProjectInput) {
    updateProject(project:$project) {
      id
      name
      description
      root_path
      sample_number
      is_processing
    }
  }
`;

export const ProjectTableWithQuery = graphql(UpdateProjectMutation, {
    props: ({mutate}) => ({
        updateProjectMutation: (project: any) => mutate({
            variables: {
                project: project
            }
        })
    })
})(ProjectTable);
