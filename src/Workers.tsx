import * as React from "react";
import {Panel} from "react-bootstrap"

import {WorkerTable} from "./WorkerTable";
import {Loading} from "./Loading";
import gql from "graphql-tag";
import {graphql} from "react-apollo";

const styles = {
    content: {
        padding: "10px"
    },
    flexContainer: {
        display: "flex"
    },
    flexItem: {
        display: "inline",
        marginRight: "auto",
        marginTop: "auto",
        marginBottom: "auto",
        fontSize: "17px"
    },
    flexItemRight: {
        alignSelf: "flex-end" as "flex-end",
        marginTop: "auto",
        marginBottom: "auto",
        background: "transparent",
        color: "white",
        border: "none",
        height: "26px"
    }
};

export class Workers extends React.Component<any, any> {
    render() {
        return (
            <WorkersPanelQuery/>
        );
    }
}

class WorkersPanel extends React.Component<any, any> {
    private renderHeader() {
        return (
            <div style={styles.flexContainer}>
                <h4 style={styles.flexItem}>Workers</h4>
                <div style={styles.flexItemRight}/>
            </div>);
    }

    public render() {
        const loading = !this.props.data || this.props.data.loading;

        const workers = !loading ? this.props.data.pipelineWorkers : [];

        return (
            <div style={styles.content}>
                <Panel header={this.renderHeader()} bsStyle="primary">
                    {loading ? <Loading/> : <WorkerTable workers={workers}/>}
                </Panel>
            </div>
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