import * as React from "react";
import {Container} from "semantic-ui-react";

interface IStagesHelpPanelProps {
}

interface IStagesHelpPanelState {
}

export class StagesHelpPanel extends React.Component<IStagesHelpPanelProps, IStagesHelpPanelState> {
    public render() {
        return (
            <Container text textAlign="justified">
                <h4>Overview</h4>
                <p>
                    Pipeline projects contain one or more pipeline stages.  Each stage may in turn contain one or more downstream stages.  Stages provide a level of indirection from referencing task scripts directly and allow them to be applied to multiple pipelines, and to use different properties such as the output location for a given task.
                </p>
                <h4>General Management</h4>
                <p>
                    The state of a pipeline stage is contained in the pipeline-storage.sqlite3 file located in the stage's output location.  If you change the output location of a stage that has been running and do not move this file, the stage will restart as it will assume it has not processed any data.
                </p>
                <p>
                    You can change the output location and continue processing if you move this file along with any existing output data to the new output location.
                </p>
                <p>
                    If you change the project or the parent stage the stage will always restart even with the existing sqlite file present as the change in the parent stage id will cause processing to be tracked under a different table.
                </p>
                <h4>Limitations</h4>
                <ul>
                    <li>A pipeline stage can only have one parent stage or project root.  You can not merge to earlier stages into a single downstream stage.</li>
                    <li>Pipeline stages only have access to one specific tile (development is underway for stages that receive a tile and the tile at the same X/Y position in the previous Z plane).</li>
                </ul>
                <p style={{fontStyle: "italic"}}>
                    Note that you can not delete a pipeline stage that has child pipeline stages assigned to it.
                </p>
            </Container>
        );
    }
}
