import * as React from "react";
import {Table} from "react-bootstrap";
import {toast} from "react-toastify";

import {IProject} from "../../models/project";
import {ProjectRow} from "./ProjectRow";

const spanStyle = {
    color: "#AAAAAA",
    width: "100%"
};

interface IProjectTableProps {
    projects: IProject[];
}

interface IProjectTableState {
}

export class ProjectTable extends React.Component<IProjectTableProps, IProjectTableState> {
    public render() {
        let rows = [];

        if (this.props.projects) {
            rows = this.props.projects.map(project => (
                <ProjectRow key={"tr_project_" + project.id} project={project}/>));
        }

        return (
            <Table condensed style={{marginBottom: "0"}}>
                <thead>
                <tr key="project_header">
                    <th/>
                    <th/>
                    <th>Sample</th>
                    <th>Name<br/><span style={spanStyle}>Description</span></th>
                    <th>Path to Dashboard Root</th>
                    <th>Sample Limits</th>
                    <th>Selected Region</th>
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
