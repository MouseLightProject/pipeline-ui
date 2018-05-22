import * as React from "react";
import {graphql} from "react-apollo";
import {Loader} from "semantic-ui-react";

import {PipelineStagesPanel} from "./PipelineStagesPanel";
import {PipelineStagesQuery} from "../../graphql/pipelineStage";
import {ProjectsQuery} from "../../graphql/project";
import {IPipelineStage} from "../../models/pipelineStage";
import {PipelineStageDetails} from "./details/PipelineStageDetails";
import {PreferencesManager} from "../../util/preferencesManager";

interface IPipelineStagesProps {
    projectsData?: any;
    data?: any;
}

interface IPipelineStagesState {
    pipelinesForProjectId?: string;
    selectedStage?: IPipelineStage;
}

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

        if (stage !== null) {
            PreferencesManager.Instance.PreferredStageId = stage.id;
        }
    };

    public render() {
        const loading = !this.props.data || this.props.data.loading || !this.props.projectsData || this.props.projectsData.loading;

        if (this.props.data.error) {
            return (<span>{this.props.data.error.message}</span>);
        }

        if (loading) {
            return (
                <div style={{display: "flex", height: "100%", alignItems: "center"}}>
                    <Loader active inline="centered">Loading</Loader>
                </div>
            );
        }

        if (this.props.projectsData.error) {
            return this.props.projectsData.error;
        }

        return (
            <div>
                <PipelineStagesPanel projects={this.props.projectsData.projects}
                                     pipelineStages={this.props.data.pipelineStages}
                                     pipelinesForProjectId={this.state.pipelinesForProjectId}
                                     onPipelinesForProjectIdChanged={(id: string) => this.onPipelinesForProjectIdChanged(id)}
                                     onSelectedPipelineStageChanged={(s: IPipelineStage) => this.onSelectedPipelineStageChanged(s)}/>
                <PipelineStageDetails selectedPipelineStage={this.state.selectedStage}/>
            </div>
        );
    }
}
/*
const _PipelineStages = graphql<any, any>(ProjectsQuery, {
    name: "projectsData",
    options: {
        pollInterval: 5 * 1000
    }
})(__PipelineStages);

export const PipelineStages = graphql<any, any>(PipelineStagesQuery, {
    options: {
        pollInterval: 5 * 1000
    }
})(_PipelineStages);
*/