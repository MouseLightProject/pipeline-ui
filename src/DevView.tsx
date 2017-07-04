import * as React from "react";

import {Workers} from "./Workers";
import {ProjectsContainer} from "./Projects";
import {TasksPanel} from "./components/tasks/Tasks";
import {PipelineStagesContainer} from "./PipelineStages";

export class DevView extends React.Component<any, any> {
    render() {
        return (
            <div>
                <ProjectsContainer/>
                <PipelineStagesContainer/>
                <Workers/>
                <TasksPanel/>
            </div>
        )
    }
}

