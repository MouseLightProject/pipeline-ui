import * as React from "react";

import {Workers} from "./Workers";
import {PipelineTileMapHighCharts} from "./PipelineTileMapHighCharts";
import {PipelineGraphWithQuery} from "./PipelineGraph";
import {ProjectsContainer} from "./Projects";
import {TaskDefinitions} from "./TaskDefinitions";
import {PipelineStagesContainer} from "./PipelineStages";

export class DevView extends React.Component<any, any> {
    render() {
        return (
            <div>
                <PipelineGraphWithQuery/>
                <PipelineTileMapHighCharts/>
                <ProjectsContainer/>
                <PipelineStagesContainer/>
                <Workers/>
                <TaskDefinitions/>
            </div>
        )
    }
}

