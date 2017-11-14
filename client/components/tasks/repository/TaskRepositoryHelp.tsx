import * as React from "react";
import {Container} from "semantic-ui-react";

interface ITaskRepositoryHelpPanelProps {
}

interface ITaskRepositoryHelpPanelState {
}

export class TaskRepositoryHelpPanel extends React.Component<ITaskRepositoryHelpPanelProps, ITaskRepositoryHelpPanelState> {
    public render() {
        return (
            <Container text textAlign="justified">
                <p>
                    Task repositories allow for collections of tasks whose associated scripts whose root location can be
                    updated as a group. For example, scripts that move to a different shared drive or mounted location
                    can be updated by updating the repository location, rather than updating each individual Task to
                    point to the new location.
                </p>
                <p>
                    You can also change a repository to point to a different location that contains scripts with the
                    same names, but have different implementations. In that way you could allow existing pipeline stages
                    to run variations of their tasks without changing each stage or task directly.
                </p>
                <p>
                    Tasks that do not use a repository can either use absolute paths, or relative paths will be
                    interpreted as relative to the execution path of this service (not recommended).
                </p>
                <p style={{fontStyle: "italic"}}>
                    Note that you can not delete a repository that has tasks assigned to it.
                </p>
            </Container>
        );
    }
}
