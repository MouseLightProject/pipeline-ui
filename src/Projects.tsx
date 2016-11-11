import * as React from "react";
import {Panel} from "react-bootstrap"

import {ProjectTable} from "./ProjectTable";
import {Loading} from "./Loading";

export class Projects extends React.Component<any, any> {
    render() {
        let projects = [];

        if (this.props.data && this.props.data.projects) {
            projects = this.props.data.projects;
        }

        return (
            <div>
                {this.props.data.loading ? <Loading/> : <TablePanel projects={projects}/>}
            </div>
        );
    }
}

class TablePanel extends React.Component<any, any> {
    render() {
        return (
            <div>
                <Panel collapsible defaultExpanded header="Projects">
                    <ProjectTable projects={this.props.projects}/>
                </Panel>
            </div>
        );
    }
}