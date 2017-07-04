import * as React from "react";

interface ITaskDefinitionHelpProps {
}

interface ITaskDefinitionState {
}

export class TaskDefinitionHelp extends React.Component<ITaskDefinitionHelpProps, ITaskDefinitionState> {
    public render() {
        return (
            <div>
            <h2>Script</h2>
            <p>
                Use an absolute path to the script that will be called for each tile in the stage.  The path may also be
                relative to the working directory of the worker, however this is not recommended.
            </p>
            </div>
        );
    }
}
