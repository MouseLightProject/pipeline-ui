import * as React from "react";
import {Container, Loader, Menu, Header} from "semantic-ui-react";

import {WorkerTable} from "./WorkerTable";
import {graphql} from "react-apollo";
import {WorkerQuery} from "../../graphql/workers";
import {themeHighlight} from "../../util/styleDefinitions";

class _Workers extends React.Component<any, any> {
    private renderMainMenu() {
        return (
            <Menu style={{borderTop: "none", borderLeft: "none", borderRight: "none"}}>
                <Menu.Header>
                    <div style={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: "10px",
                        paddingTop: "4px"
                    }}>
                        <Header style={{color: themeHighlight}}>
                            Workers
                        </Header>
                    </div>
                </Menu.Header>
            </Menu>
        );
    }

    public render() {
        const isLoading = !this.props.data || this.props.data.loading;

        if (isLoading) {
            return (
                <div style={{display: "flex", height: "100%", alignItems: "center"}}>
                    <Loader active inline="centered">Loading</Loader>
                </div>
            );
        }

        if (this.props.data.error) {
            return (<span>{this.props.data.error}</span>);
        }

        return (
            <Container fluid style={{display: "flex", flexDirection: "column"}}>
                {this.renderMainMenu()}
                <WorkerTable workers={this.props.data.pipelineWorkers} style={{padding: "20px"}}/>
            </Container>
        );
    }
}

export const Workers = graphql<any, any>(WorkerQuery, {
    options: {
        pollInterval: 5 * 1000
    }
})(_Workers);

