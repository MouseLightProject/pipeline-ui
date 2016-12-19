import * as React from "react";
import {Table, Checkbox, Glyphicon, Button} from "react-bootstrap";

import {IProject} from "./QueryInterfaces";

interface IProjectRowProps {
    project?: IProject;

    updateStatusCallback(id: string, shouldBeActive: boolean): void;
    deleteCallback(id: string): void;
}

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

    render() {
        let project = this.props.project;

        return (
            <tr>
                <td><Button bsSize="xsmall" bsStyle={this.getActivateStyle(project.is_active)} onClick={this.onActiveClick}><Glyphicon glyph={this.getActivateGlyph(project.is_active)} /> {this.getActivateText(project.is_active)}</Button></td>
                <td>{project.sample_number}</td>
                <td>{project.name}</td>
                <td>{project.root_path}</td>
                <td>{project.description}</td>
                <td>{`${project.id.slice(0, 8)}`}</td>
                <td><Button bsSize="xsmall" bsStyle="warning" onClick={this.onDelete}><Glyphicon glyph="trash" /> Remove</Button></td>
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
            <ProjectRow key={"tr_project_" + project.id} project={project} updateStatusCallback={this.props.updateStatusCallback}
                        deleteCallback={this.props.deleteCallback}/>));

        return (
            <Table condensed>
                <thead>
                <tr key="project_header">
                    <th>Active</th>
                    <th>Sample</th>
                    <th>Name</th>
                    <th>Root Path</th>
                    <th>Description</th>
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
