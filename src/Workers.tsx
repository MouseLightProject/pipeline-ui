import * as React from "react";
import {Panel} from "react-bootstrap"

import {WorkerTable} from "./WorkerTable";
import {Loading} from "./Loading";

export class Workers extends React.Component<any, any> {
    render() {
        let workers = [];

        if (this.props.data && this.props.data.pipelineWorkers) {
            workers = this.props.data.pipelineWorkers;
        }

        return (
            <div>
                {this.props.data.loading ? <Loading/> : <TablePanel workers={workers}/>}
            </div>
        );
    }
}

class TablePanel extends React.Component<any, any> {
    render() {
        return (
            <div>
                <Panel collapsible defaultExpanded header="Workers">
                    <WorkerTable workers={this.props.workers}/>
                </Panel>
            </div>
        );
    }
}