import * as React from "react";

import {IPipelineStage} from "../../../models/pipelineStage";
import {Tiles} from "./Tiles";

interface IPipelineStageDetailsProps {
    selectedPipelineStage?: IPipelineStage;
}

interface IPipelineStageDetailsState {
}

export class PipelineStageDetails extends React.Component<IPipelineStageDetailsProps, IPipelineStageDetailsState> {
    private renderHeader() {
        return (
            <div>
                <h4>Stage Details</h4>
            </div>
        );
    }

    public render() {
        if (!this.props.selectedPipelineStage) {
            return null;
        }

        return (
            <Tiles pipelineStage={this.props.selectedPipelineStage}/>
        );
    }
}
