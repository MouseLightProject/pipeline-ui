import * as React from "react";
import {Panel} from "react-bootstrap"

import {PipelineStageTable} from "./PipelineStageTable";
import {Loading} from "./Loading";

export class PipelineStages extends React.Component<any, any> {
    render() {
        let pipelineStages = [];

        if (this.props.data && this.props.data.pipelineStages) {
            pipelineStages = this.props.data.pipelineStages;
        }

        return (
            <div>
                {this.props.data.loading ? <Loading/> : <TablePanel pipelineStages={pipelineStages}/>}
            </div>
        );
    }
}

class TablePanel extends React.Component<any, any> {
    render() {
        return (
            <div>
                <Panel collapsible defaultExpanded header="Pipeline Stages">
                    <PipelineStageTable pipelineStages={this.props.pipelineStages}/>
                </Panel>
            </div>
        );
    }
}