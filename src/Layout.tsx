import * as React from "react";
import {PageHeader} from "react-bootstrap";

import {
    TaskDefinitionsWithQuery,
    PipelineWorkersWithQuery,
    ProjectsWithQuery,
    PipelineStagesWithQuery,
    PipelineGraphWithQuery
} from "./GraphQLComponents";

export class Layout extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {pipelineForProjectId: ""};
    }

    onPipelinesForProjectIdChanged = (id: string) => {
        this.setState({pipelineForProjectId: id}, null);
    };

    render() {
        let divStyle = {
            margin: "20px"
        };

        return (
            <div style={divStyle}>
                <PageHeader>Mouse Light Acquisition Dashboard
                    <small> Pipeline Server</small>
                </PageHeader>
                <PipelineGraphWithQuery/>
                <ProjectsWithQuery/>
                <PipelineStagesWithQuery pipelinesForProjectId={this.state.pipelineForProjectId}
                                         onPipelinesForProjectIdChanged={this.onPipelinesForProjectIdChanged}/>
                <PipelineWorkersWithQuery/>
                <TaskDefinitionsWithQuery/>
            </div>
        )
    }
}
