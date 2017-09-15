import * as React from "react";
import {Panel} from "react-bootstrap";

import {IPipelineStage} from "../../../models/pipelineStage";
import {panelHeaderStyles} from "../../../util/styleDefinitions";
import {TaskExecutions} from "./TaskExecutions";

const styles = panelHeaderStyles;

interface IPipelineStageDetailsProps {
    selectedPipelineStage?: IPipelineStage;
}

interface IPipelineStageDetailsState {
}

export class PipelineStageDetails extends React.Component<IPipelineStageDetailsProps, IPipelineStageDetailsState> {
    private renderHeader() {
        return (
            <div style={styles.flexContainer}>
                <h4 style={styles.titleItem}>Stage Details</h4>
            </div>
        );
    }

    public render() {
        if (!this.props.selectedPipelineStage) {
            return null;
        }

        return (
            <Panel header={this.renderHeader()} bsStyle="primary">
               <TaskExecutions/>
            </Panel>
        );
    }
}
