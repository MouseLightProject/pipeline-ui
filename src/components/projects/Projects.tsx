import * as React from "react";

import {Loading} from "../../Loading";
import {graphql} from "react-apollo";
import {contentStyles} from "../../util/styleDefinitions";
import {ProjectsQuery} from "../../graphql/project";
import {ProjectsPanel} from "./ProjectsPanel";


@graphql(ProjectsQuery, {
    options: {
        pollInterval: 5 * 1000
    }
})
export class Projects extends React.Component<any, any> {
    public render() {
        const loading = !this.props.data || this.props.data.loading;

        if (loading) {
            return (<Loading/>);
        }

        if (this.props.data.error) {
            return (<span>{this.props.data.error}</span>);
        }

        return (
            <div style={contentStyles.body}>
                <ProjectsPanel projects={this.props.data.projects}/>
            </div>
        );
    }
}
