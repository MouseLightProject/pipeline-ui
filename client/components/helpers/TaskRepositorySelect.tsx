import * as React from "react";
import {Dropdown} from "semantic-ui-react";

import {ITaskRepository} from "../../models/taskRepository";

interface IRepositorySelectProps {
    repositories: ITaskRepository[];
    selectedRepository: ITaskRepository;

    onSelectRepository(project: ITaskRepository): void;
}

interface IRepositorySelectState {
}

export class TaskRepositorySelect extends React.Component<IRepositorySelectProps, IRepositorySelectState> {
    private onSelectRepository(evt, option) {
        if (option.value) {
            this.props.onSelectRepository(this.props.repositories[this.props.repositories.findIndex(p => p.id === option.value)]);
        } else {
            this.props.onSelectRepository(null);
        }
    }

    public render() {
        const options = this.props.repositories.map(p => {
            return {key: p.id, value:p.id, text: p.name}
        });

        return (
            <Dropdown
                onChange={(evt, option) => this.onSelectRepository(evt, option)}
                options={options}
                selection
                search
                placeholder="(recommended)"
                value={this.props.selectedRepository ? this.props.selectedRepository.id : null}
            />
        );
    }
}
