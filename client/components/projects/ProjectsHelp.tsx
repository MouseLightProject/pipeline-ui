import * as React from "react";
import {Container, Icon} from "semantic-ui-react";

interface IProjectsHelpPanelProps {
}

interface IProjectsHelpPanelState {
}

export class ProjectsHelpPanel extends React.Component<IProjectsHelpPanelProps, IProjectsHelpPanelState> {
    public render() {
        return (
            <Container text textAlign="justified">
                <h4>Overview</h4>
                <p>
                    A project defines an acquisition pipeline. It is primarily a reference to the root location of acquisition data, which corresponds to the location of the dashboard.json file. This is currently the mechanism the project uses to identify the root tile inputs for the pipeline.
                </p>
                <p>
                    Additional properties include the sample number to associate with the neuron database and selecting a sub-region within the full sample acquisition volume to process.
                </p>
                <p>
                    Pipelines can run on both active samples during acquisition and inactive acquisitions that are complete.
                </p>
                <h4>Input Source</h4>
                <p>
                    The primary input source is a file named pipeline-input.json located at the Root Path location.  If the file does not exist, the system looks for dashboard.json.  If that file is also not present, the project does not update the source tile states.  The icon next to the Root Path in the projects table indicates the status:
                    <ul>
                        <li><Icon name="question" color="red"/><i>Unknown</i> - the project was just created and has not been scanned for the first time</li>
                        <li><Icon name="folder" color="red"/><i>Bad Location</i> - the root path folder does not exist</li>
                        <li><Icon name="times circle" color="red"/><i>Missing</i> - can not find pipeline.json or dashboard.json at the root path</li>
                        <li><Icon name="check" color="green"/><i>Ok</i> - pipeline.json or dashboard.json present at the last update</li>
                    </ul>
                </p>
                <h4>Selected Region</h4>
                <p>
                    By default a pipeline will process all tiles marked complete during the acquisition.
                </p>
                <h4>Artifacts</h4>
                <p>
                    The pipeline stores a file in the same directory as the dashboard.json file "pipeline-storage.sqlite" that tracks the known acquisition tiles. This file should generally not be removed. However, if an error occurs that can not be recovered, the first step in resetting a project is to remove this file.
                </p>
                <p>
                    There is also "pipeline-storage.json" in the same directory. This is a lighter-weight version of dashboard.json that removes much of the otherwise duplicated information to facilitate faster loading of tile information by other tools.
                </p>
                <h4>Moving Projects</h4>
                <p>
                    If the acquisition data is moved it you can edit the pipeline to update the Root Path property that points to the dashboard.json location. So long as the "pipeline-storage.sqlite" file is moved with the acquisition data the state of the pipeline will remain intact.
                </p>
                <h4>Additional Info</h4>
                <p>
                    You can have more than one pipeline project defined for an acquisition. You generally would not want the output locations for individual stages that use the same task to be the same because there would likely be output file naming conflicts. Otherwise there are no constraints for multiple pipelines for a single acquisition.
                </p>
                <p style={{fontStyle: "italic"}}>
                    Note that you can not delete a project that has pipeline stages assigned to it.
                </p>
            </Container>
        );
    }
}
