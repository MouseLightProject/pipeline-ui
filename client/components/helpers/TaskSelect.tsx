import * as React from "react";
import {Dropdown} from "semantic-ui-react";

import {ITaskDefinition} from "../../models/taskDefinition";

interface ITaskSelectProps {
    tasks: ITaskDefinition[];
    selectedTask: ITaskDefinition;

    onSelectTask(task: ITaskDefinition): void;
}

interface ITaskSelectState {
}

export class TaskSelect extends React.Component<ITaskSelectProps, ITaskSelectState> {
    private onSelectTask(evt, option) {
        if (option.value) {
            this.props.onSelectTask(this.props.tasks[this.props.tasks.findIndex(p => p.id === option.value)]);
        } else {
            this.props.onSelectTask(null);
        }
    }

    public render() {
        const options = this.props.tasks.map(p => {
            return {key: p.id, value:p.id, text: p.name}
        });

        return (
            <Dropdown
                onChange={(evt, option) => this.onSelectTask(evt, option)}
                options={options}
                selection
                search
                placeholder="(required)"
                value={this.props.selectedTask ? this.props.selectedTask.id : null}
            />
        );
    }
}
