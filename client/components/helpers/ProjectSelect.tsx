import * as React from "react";
import {Dropdown} from "semantic-ui-react";

import {IProject} from "../../models/project";

interface IProjectSelectProps {
    projects: IProject[];
    selectedProject: IProject;

    onSelectProject(project: IProject): void;
}

interface IProjectSelectState {
}

export class ProjectSelect extends React.Component<IProjectSelectProps, IProjectSelectState> {
    private onSelectProject(evt, option) {
        if (option.value) {
            this.props.onSelectProject(this.props.projects[this.props.projects.findIndex(p => p.id === option.value)]);
        } else {
            this.props.onSelectProject(null);
        }
    }

    public render() {
        const options = this.props.projects.map(p => {
            return {key: p.id, value:p.id, text: p.name}
        });

        return (
            <Dropdown
                onChange={(evt, option) => this.onSelectProject(evt, option)}
                options={options}
                selection
                search
                placeholder="(required)"
                value={this.props.selectedProject ? this.props.selectedProject.id : null}
            />
        );
    }
}
