import * as React from "react";
import {Table, Checkbox, Glyphicon} from "react-bootstrap";

import {IProject} from "./QueryInterfaces";

interface IProjectRowProps {
    project?: IProject;

    updateStatusCallback(id: string, shouldBeActive: boolean): void;
    deleteCallback(id: string): void;
}

class ProjectRow extends React.Component<IProjectRowProps, any> {
    onActivate = (event: any) => {
        this.props.updateStatusCallback(this.props.project.id, event.target.checked);
    };

    onDelete = () => {
        this.props.deleteCallback(this.props.project.id);
    };

    render() {
        let project = this.props.project;

        return (
            <tr key={"tr_" + project.id}>
                <td>{project.id}</td>
                <td>{project.sample_number}</td>
                <td><Checkbox checked={project.is_active} onChange={this.onActivate}/></td>
                <td>{project.name}</td>
                <td>{project.description}</td>
                <td>{project.root_path}</td>
                <td><Glyphicon glyph="trash" onClick={this.onDelete}/></td>
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
            <ProjectRow project={project} updateStatusCallback={this.props.updateStatusCallback}
                        deleteCallback={this.props.deleteCallback}/>));

        return (
            <Table striped condensed>
                <thead>
                <tr>
                    <td>ID</td>
                    <td>Sample Number</td>
                    <td>Active</td>
                    <td>Name</td>
                    <td>Description</td>
                    <td>Root Path</td>
                    <td></td>
                </tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </Table>
        );
    }
}
