import * as React from "react";
import {Panel} from "react-bootstrap"

import {ProjectTable} from "./ProjectTable";
import {Loading} from "./Loading";
import {ProjectCreateComponent} from "./ProjectCreateComponent";

export class Projects extends React.Component<any, any> {
    onCreateProject = (name, desc, root, sample) => {
        this.props.createProjectMutation(name, desc, root, sample)
        .then(() => {
            this.props.refetch();
        }).catch((err) => {
            console.log(err);
        });
    };

    onSetProjectStatus = (id: string, shouldBeActive: boolean) => {
        this.props.setProjectStatusMutation(id, shouldBeActive)
        .then(() => {
            this.props.refetch();
        }).catch((err) => {
            console.log(err);
        });
    };

    onDeleteProject = (id: string) => {
        this.props.deleteProjectMutation(id)
        .then(() => {
            this.props.refetch();
        }).catch((err) => {
            console.log(err);
        });
    };

    render() {
        let projects = this.props.projects;

        return (
            <div>
                {this.props.loading ? <Loading/> :<TablePanel projects={projects} createCallback={this.onCreateProject}
                                                              updateStatusCallback={this.onSetProjectStatus}
                                                              deleteCallback={this.onDeleteProject}/>}
            </div>
        );
    }
}

class TablePanel extends React.Component<any, any> {
    render() {
        return (
            <div>
                <Panel collapsible defaultExpanded header="Sample Acquisition Pipelines" bsStyle="primary">
                    <ProjectTable projects={this.props.projects} updateStatusCallback={this.props.updateStatusCallback}
                                  deleteCallback={this.props.deleteCallback}/>
                </Panel>
                <ProjectCreateComponent createCallback={this.props.createCallback}/>
            </div>
        );
    }
}
