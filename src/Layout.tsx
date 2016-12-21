import * as React from "react";

import {BodyContainerWithQuery} from "./GraphQLComponents";

export class Layout extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {pipelinesForProjectId: ""};
    }

    onPipelinesForProjectIdChanged = (id: string) => {
        this.setState({pipelinesForProjectId: id}, null);
    };

    render() {
        return (
            <BodyContainerWithQuery pipelinesForProjectId={this.state.pipelinesForProjectId}
                                    onPipelinesForProjectIdChanged={this.onPipelinesForProjectIdChanged}/>
        )
    }
}
