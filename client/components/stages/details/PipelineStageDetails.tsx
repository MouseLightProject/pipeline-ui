import * as React from "react";

import {IPipelineStage} from "../../../models/pipelineStage";
import {Tiles} from "./Tiles";

interface IPipelineStageDetailsProps {
    selectedPipelineStage?: IPipelineStage;
}

interface IPipelineStageDetailsState {
}

export class PipelineStageDetails extends React.Component<IPipelineStageDetailsProps, IPipelineStageDetailsState> {
    public render() {
        if (!this.props.selectedPipelineStage) {
            return null;
        }

        return (
            <Tiles pipelineStage={this.props.selectedPipelineStage}/>
        );
    }
}
