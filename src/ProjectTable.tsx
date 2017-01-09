import * as React from "react";
import {Table, Glyphicon, Button} from "react-bootstrap";

import {IProject} from "./QueryInterfaces";

interface IProjectRowProps {
    project?: IProject;

    updateStatusCallback(id: string, shouldBeActive: boolean): void;
    deleteCallback(id: string): void;
}

const spanStyle = {
    color: "#aaaaaa"
};


class ProjectRow extends React.Component<IProjectRowProps, any> {
    onDelete = () => {
        this.props.deleteCallback(this.props.project.id);
    };

    onActiveClick = () => {
        this.props.updateStatusCallback(this.props.project.id, !this.props.project.is_active);
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

    render() {
        let project = this.props.project;

        const columnLimitStyle = {
            "maxWidth": "200px"
        };

        return (
            <tr>
                <td><Button bsSize="xsmall" bsStyle={this.getActivateStyle(project.is_active)}
                            onClick={this.onActiveClick}><Glyphicon
                    glyph={this.getActivateGlyph(project.is_active)}/> {this.getActivateText(project.is_active)}
                </Button></td>
                <td>{project.sample_number}</td>
                <td style={columnLimitStyle}>{project.name}<br/><span style={spanStyle}>{project.description}</span>
                </td>
                <td>{project.root_path}</td>
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
    updateStatusCallback(id: string, shouldBeActive: boolean): void;
    deleteCallback(id: string): void;
}

export class ProjectTable extends React.Component<IProjectTable, any> {
    render() {
        let rows = this.props.projects.map(project => (
            <ProjectRow key={"tr_project_" + project.id} project={project}
                        updateStatusCallback={this.props.updateStatusCallback}
                        deleteCallback={this.props.deleteCallback}/>));
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
