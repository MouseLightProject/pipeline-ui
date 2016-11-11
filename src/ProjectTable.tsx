import * as React from "react";
import {Table} from "react-bootstrap"

import {IProject} from "./QueryInterfaces";

interface IProjectRowProps {
    project: IProject;
}

class ProjectRow extends React.Component<IProjectRowProps, any> {
    render() {
        let project = this.props.project;

        return (
            <tr key={"tr_" + project.id}>
                <td>{project.id.slice(0, 8)}</td>
                <td>{project.sample_number}</td>
                <td>{project.name}</td>
                <td>{project.description}</td>
                <td>{project.root_path}</td>
            </tr>);
    }
}

interface IProjectTable {
    projects: IProject[];
}

export class ProjectTable extends React.Component<IProjectTable, any> {
    render() {
        let rows = this.props.projects.map(project => (<ProjectRow project={project}/>));

        return (
            <Table striped condensed>
                <thead>
                <tr>
                    <td>ID</td>
                    <td>Sample Number</td>
                    <td>Name</td>
                    <td>Description</td>
                    <td>Root Path</td>
                </tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </Table>
        );
    }
}
