import * as React from "react";
import {Nav, Navbar} from "react-bootstrap"
import {ProjectMenu, ProjectMenuStyle} from "./ProjectMenu";
import {IProject} from "../../models/project";

export interface IProjectMenuProps {
    keyPrefix: string;
    projects: IProject[];
    selectedProjectId: string;
    includeAllProjects?: boolean;

    onProjectSelectionChange(projectId: string);
}

export interface IProjectMenuState {
}

const navBarStyle = {
    marginBottom: "0px"
};

export class ProjectMenuNavbar extends React.Component<IProjectMenuProps, IProjectMenuState> {

    public render() {
        return (
        <Navbar inverse fluid style={navBarStyle}>
            <Navbar.Header>
                <Navbar.Brand>
                    Project
                </Navbar.Brand>
                <Navbar.Toggle />
            </Navbar.Header>
            <Nav>
                <ProjectMenu keyPrefix={this.props.keyPrefix}
                             menuStyle={ProjectMenuStyle.NavDropDown}
                             onProjectSelectionChange={this.props.onProjectSelectionChange}
                             projects={this.props.projects}
                             selectedProjectId={this.props.selectedProjectId}
                             includeAllProjects={true}/>
            </Nav>
            <Nav pullRight>
                {this.props.children}
            </Nav>
        </Navbar>
        );
    }
}
