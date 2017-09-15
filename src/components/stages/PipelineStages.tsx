import * as React from "react";
import {graphql} from "react-apollo";

import {Loading} from "../../Loading";
import {contentStyles} from "../../util/styleDefinitions";
import {PipelineStagesPanel} from "./PipelineStagesPanel";
import {PipelineStagesQuery} from "../../graphql/pipelineStage";
import {ProjectsQuery} from "../../graphql/project";
import {IPipelineStage} from "../../models/pipelineStage";
import {PipelineStageDetails} from "./details/PipelineStageDetails";

const styles = contentStyles;

interface IPipelineStagesProps {
    projectsData?: any;
    data?: any;
}

interface IPipelineStagesState {
    pipelinesForProjectId?: string;
    selectedStage?: IPipelineStage;
}

@graphql(ProjectsQuery, {
    name: "projectsData",
    options: {
        pollInterval: 5 * 1000
    }
})
@graphql(PipelineStagesQuery, {
    options: {
        pollInterval: 5 * 1000
    }
})
export class PipelineStages extends React.Component<IPipelineStagesProps, IPipelineStagesState> {
    constructor(props) {
        super(props);
        this.state = {pipelinesForProjectId: "", selectedStage: null};
    }

    private onPipelinesForProjectIdChanged(id: string) {
        this.setState({pipelinesForProjectId: id});
    };

    private onSelectedPipelineStageChanged(stage: IPipelineStage) {
        this.setState({selectedStage: stage});
    };

    public render() {
        const loading = !this.props.data || this.props.data.loading || !this.props.projectsData || this.props.projectsData.loading;

        if (loading) {
            return (<Loading/>);
        }

        if (this.props.data.error) {
            return (<span>{this.props.data.error}</span>);
        }

        if (this.props.projectsData.error) {
            return (<span>{this.props.projectsData.error}</span>);
        }

        return (
            <div style={styles.body}>
                <PipelineStagesPanel projects={this.props.projectsData.projects}
                                     pipelineStages={this.props.data.pipelineStages}
                                     pipelinesForProjectId={this.state.pipelinesForProjectId}
                                     selectedPipelineStage={this.state.selectedStage}
                                     onPipelinesForProjectIdChanged={(id: string) => this.onPipelinesForProjectIdChanged(id)}
                                     onSelectedPipelineStageChanged={(s: IPipelineStage) => this.onSelectedPipelineStageChanged(s)}/>
                {/*<PipelineStageDetails selectedPipelineStage={this.state.selectedStage}/>*/}
            </div>
        );
    }
}
