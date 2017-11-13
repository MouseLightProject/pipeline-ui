import * as React from "react";
import {Panel} from "react-bootstrap"

import {WorkerTable} from "./WorkerTable";
import {Loading} from "../../Loading";
import {graphql} from "react-apollo";
import {WorkerQuery} from "../../graphql/workers";
import {contentStyles, panelHeaderStyles} from "../../util/styleDefinitions";

const styles = panelHeaderStyles;

class _Workers extends React.Component<any, any> {
    private renderHeader() {
        return (
            <div style={styles.flexContainer}>
                <h4 style={styles.titleItem}>Workers</h4>
                <div style={styles.buttonRight}/>
            </div>
        );
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

export const Workers = graphql<any, any>(WorkerQuery, {
    options: {
        pollInterval: 5 * 1000
    }
})(_Workers);

