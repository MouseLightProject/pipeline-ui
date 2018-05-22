import * as React from "react";
import {Loader} from "semantic-ui-react";
import {graphql} from "react-apollo";

import {ProjectsQuery} from "../../graphql/project";
import {ProjectsPanel} from "./ProjectsPanel";

export class Projects extends React.Component<any, any> {
    public render() {
        const loading = !this.props.data || this.props.data.loading;

        if (this.props.data.error) {
            return (<span>{this.props.data.error.message}</span>);
        }

        if (loading) {
            return (
                <div style={{display: "flex", height: "100%", alignItems: "center"}}>
                    <Loader active inline="centered">Loading</Loader>
                </div>
            );
        }

        return (
            <ProjectsPanel projects={this.props.data.projects}/>
        );
    }
}
/*
export const Projects = graphql<any, any>(ProjectsQuery, {
    options: {
        pollInterval: 5 * 1000
    }
})(_Projects);
*/