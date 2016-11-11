import * as React from "react";
import {PageHeader} from "react-bootstrap";

import {
    TaskDefinitionsWithQuery,
    WorkersWithQuery,
    ProjectsWithQuery,
    PipelineStagesWithQuery
} from "./GraphQLComponents";

export function Layout() {
    let divStyle = {
        margin: "20px"
    };

    return (
        <div style={divStyle}>
            <PageHeader>Mouse Light Acquisition Dashboard
                <small> Pipeline Server</small>
            </PageHeader>
            <ProjectsWithQuery/>
            <PipelineStagesWithQuery/>
            <WorkersWithQuery/>
            <TaskDefinitionsWithQuery/>
        </div>
    )
}
