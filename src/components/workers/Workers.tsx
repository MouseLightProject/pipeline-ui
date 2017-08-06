import * as React from "react";
import {Panel} from "react-bootstrap"

import {WorkerTable} from "./WorkerTable";
import {Loading} from "../../Loading";
import {graphql} from "react-apollo";
import {contentStyles, panelHeaderStyles} from "../../util/styleDefinitions";
import {WorkerQuery} from "../../graphql/workers";

const styles = panelHeaderStyles;

@ graphql(WorkerQuery, {
    options: {
        pollInterval: 5 * 1000
    }
})
export class Workers extends React.Component<any, any> {
    private renderHeader() {
        return (
            <div style={styles.flexContainer}>
                <h4 style={styles.titleItem}>Workers</h4>
                <div style={styles.buttonRight}/>
            </div>);
    }

    public render() {
        const loading = !this.props.data || this.props.data.loading;

        const workers = !loading ? this.props.data.pipelineWorkers : [];

        return (
            <div style={contentStyles.body}>
                <Panel header={this.renderHeader()} bsStyle="primary">
                    {loading ? <Loading/> : <WorkerTable workers={workers}/>}
                </Panel>
            </div>
        );
    }
}
