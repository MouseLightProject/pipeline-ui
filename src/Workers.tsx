import * as React from "react";
import {Panel} from "react-bootstrap"

import {WorkerTable} from "./WorkerTable";
import {Loading} from "./Loading";
import gql from "graphql-tag";
import {graphql} from "react-apollo";

export class Workers extends React.Component<any, any> {
    render() {
        return (
            <WorkersPanelQuery/>
        );
    }
}

class WorkersPanel extends React.Component<any, any> {
    render() {
        const loading = !this.props.data || this.props.data.loading;

        const workers = !loading ? this.props.data.pipelineWorkers : [];

        return (
            <Panel collapsible defaultExpanded header="Workers" bsStyle="primary">
                {loading ? <Loading/> : <WorkerTable workers={workers}/>}
            </Panel>
        );
    }
}

const WorkerQuery = gql`query { 
    pipelineWorkers {
      id
      name
      machine_id
      work_unit_capacity
      last_seen
      task_load
      status
      is_in_scheduler_pool
      is_cluster_proxy
    }
}`;

const WorkersPanelQuery = graphql(WorkerQuery, {
    options: {
        pollInterval: 5 * 1000
    }
})(WorkersPanel);