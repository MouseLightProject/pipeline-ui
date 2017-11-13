import * as React from "react";
import {Dropdown} from "semantic-ui-react"
import {IProject} from "../../models/project";

export const AllProjectsId = "AllProjectsId";

export const AllProjectsText = "All Projects";

export interface IProjectMenuProps {
    style?: any;
    keyPrefix: string;
    projects: IProject[];
    selectedProjectId: string;
    includeAllProjects?: boolean;

    onProjectSelectionChange(projectId: string);
}

export interface IProjectMenuState {
}

export class ProjectMenu extends React.Component<IProjectMenuProps, IProjectMenuState> {
    private handleChange(eventKey) {
        this.props.onProjectSelectionChange(eventKey);
    };

    public render() {
        const includeAllProjects = this.props.includeAllProjects || false;

        let title = "";
        let rows = [];

        if (this.props.projects) {
            rows = this.props.projects.map(project => {
                if (this.props.selectedProjectId === project.id) {
                    title = `${project.name}`;
                }

                return (
                    <Dropdown.Item key={this.props.keyPrefix + project.id}
                                   onClick={() => this.handleChange(project.id)}>
                        {`${project.name}`}
                    </Dropdown.Item>
                );
            });
        }

        if (includeAllProjects) {
            if (this.props.selectedProjectId === AllProjectsId) {
                title = AllProjectsText;
            }

            rows = [(
                <Dropdown.Item key={this.props.keyPrefix + AllProjectsId}
                               onClick={(event, data) => this.handleChange(AllProjectsId)}>
                    {AllProjectsText}
                </Dropdown.Item>), (
                <Dropdown.Divider key={"divider"}/>)].concat(rows);
        }

        const style = this.props.style || null;

        return (
            <Dropdown item text={title} style={style}>
                <Dropdown.Menu>
                    {rows}
                </Dropdown.Menu>
            </Dropdown>
        );
    }
}
