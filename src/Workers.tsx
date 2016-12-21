import * as React from "react";
import {Panel} from "react-bootstrap"

import {WorkerTable} from "./WorkerTable";
import {Loading} from "./Loading";

export class Workers extends React.Component<any, any> {
    render() {
        return (
            <div>
                {this.props.loading ? <Loading/> : <TablePanel workers={this.props.workers}/>}
            </div>
        );
    }
}

class TablePanel extends React.Component<any, any> {
    render() {
        return (
            <div>
                <Panel collapsible defaultExpanded header="Workers" bsStyle="primary">
                    <WorkerTable workers={this.props.workers}/>
                </Panel>
            </div>
        );
    }
}