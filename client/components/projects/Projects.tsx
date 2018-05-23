import * as React from "react";

import {ProjectsPanel} from "./ProjectsPanel";
import {IProject} from "../../models/project";

interface IProjectsProps {
    projects: IProject[]
}

export const Projects = (props: IProjectsProps) => (
    <ProjectsPanel projects={props.projects}/>
);
