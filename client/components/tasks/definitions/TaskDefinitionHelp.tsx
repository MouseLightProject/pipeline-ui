import * as React from "react";
import {Container} from "semantic-ui-react";

interface ITaskDefinitionHelpPanelProps {
}

interface ITaskDefinitionHelpPanelState {
}

export class TaskDefinitionHelpPanel extends React.Component<ITaskDefinitionHelpPanelProps, ITaskDefinitionHelpPanelState> {
    public render() {
        return (
            <Container text textAlign="justified">
                <h4>Summary</h4>
                <p>
                    Tasks provide the link between a pipeline stage and the specific script or application that is called for each tile in that stage. It also associates a relative level of resource usage (work units), and custom arguments sent to the script.
                </p>
                <p>
                    It is possible to have different tasks that call the same underlying task using different arguments, and possibly assigned a different number of work units.
                </p>
                <p>
                    Tasks are called <i>per tile</i> not per file in a given tile directory.
                </p>
                <p>
                    Note that tasks can not be deleted if they are referenced by a pipeline stage.
                </p>
                <h4>Standard Arguments</h4>
                <p>
                    All scripts and applications are called with seven standard arguments (e.g., $1 - $9 in a bash script):
                </p>
                <ol>
                    <li>Project name</li>
                    <li>Project root path</li>
                    <li>Stage input root path</li>
                    <li>Stage output root path</li>
                    <li>Relative path to tile (from stage input)</li>
                    <li>Tile name</li>
                    <li>Log root path</li>
                    <li>Expected exit code</li>
                    <li>Cluster job flag</li>
                </ol>
                <h5>Paths</h5>
                <p>
                    Note that the tile name is the root of the tile, independent of any channels or filename extensions.  For example, to construct the full path to a specific image file from the microscope output:
                </p>
                <pre style={{fontSize: "10px"}}>
                        input_file1="$pipeline_input_root/$tile_relative_path/$tile_name-ngc.0.tif"
                    </pre>
                <h4>Additional Arguments</h4>
                <p>
                    Additional arguments can be added to follow to the above standard arguments. These are entered as a whitespace-separated list. Whitespace as part of an additional argument is not currently supported.
                </p>
                <h4>Work Units</h4>
                <p>
                    Work units are a relative unit of of measure that determines how many concurrent tasks a worker node will execute. Values only have meaning relative other tasks the work unit capacity defined for each worker.
                </p>
                <p>
                    For example, defining a task with a work unit value greater than the maximum value of any worker node will effectively prevent a stage referencing that task from executing.
                </p>
            </Container>
        );
    }
}
