import * as React from "react";
import {MenuItem, NavDropdown, DropdownButton} from "react-bootstrap"
import {IProject} from "../../models/project";

export const AllProjectsId = "AllProjectsId";

export const AllProjectsText = "All Projects";

export enum ProjectMenuStyle {
    DropDownButton,
    NavDropDown
}

export interface IProjectMenuProps {
    keyPrefix: string;
    projects: IProject[];
    selectedProjectId: string;
    menuStyle: ProjectMenuStyle;
    includeAllProjects?: boolean;

    onProjectSelectionChange(projectId: string);
}

export interface IProjectMenuState {
}

export class ProjectMenu extends React.Component<IProjectMenuProps, IProjectMenuState> {
    private handleChange(eventKey) {
        this.props.onProjectSelectionChange(eventKey);
    };

    public shouldComponentUpdate() {
        return true;
    }

    public render() {
        const includeAllProjects = this.props.includeAllProjects || false;

        let title = "";
        let rows = [];

        if (this.props.projects) {
            rows = this.props.projects.map(project => {
                if (this.props.selectedProjectId === project.id) {
                    title = `${project.name} (Sample Id ${project.sample_number})`;
                }

                return (<MenuItem key={this.props.keyPrefix + project.id}
                                  eventKey={project.id}>{`${project.name} (Sample Id ${project.sample_number})`}</MenuItem>)
            });
        }

        if (includeAllProjects) {
            if (this.props.selectedProjectId === AllProjectsId) {
                title = AllProjectsText;
            }

            rows = [(
                <MenuItem key={this.props.keyPrefix + AllProjectsId}
                          eventKey={AllProjectsId}>{AllProjectsText}</MenuItem>), (
                <MenuItem key={this.props.keyPrefix + "divider"} divider/>)].concat(rows);
        }

        if (this.props.menuStyle === ProjectMenuStyle.NavDropDown) {
            return (
                <NavDropdown id={this.props.keyPrefix + "project-nav-drop-down"} title={title}
                             onSelect={(eventKey) => this.handleChange(eventKey)}>
                    {rows}
                </NavDropdown>
            )
        } else {
            return (
                <DropdownButton id={this.props.keyPrefix + "project-drop-down"} title={title} bsSize="small"
                                onSelect={(eventKey) => this.handleChange(eventKey)}>
                    {rows}
                </DropdownButton>
            )
        }
    }
}
