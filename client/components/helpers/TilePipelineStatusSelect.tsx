import * as React from "react";
import {Dropdown} from "semantic-ui-react";

import {TilePipelineStatusType} from "../../models/tilePipelineStatus";

interface ITilePipelineStatusProps {
    statusTypes: TilePipelineStatusType[];
    selectedStatus: TilePipelineStatusType;

    onSelectStatus(task: TilePipelineStatusType): void;
}

interface ITilePipelineStatusState {
}

export class TilePipelineStatusSelect extends React.Component<ITilePipelineStatusProps, ITilePipelineStatusState> {
    private onSelectStatus(evt, option) {
        if (option.value) {
            this.props.onSelectStatus(this.props.statusTypes[this.props.statusTypes.findIndex(p => p.id === option.value)]);
        } else {
            this.props.onSelectStatus(null);
        }
    }

    public render() {
        const options = this.props.statusTypes.map(p => {
            return {key: p.id, value:p.id, text: p.id}
        });

        return (
            <Dropdown
                onChange={(evt, option) => this.onSelectStatus(evt, option)}
                options={options}
                search
                item
                placeholder="(required)"
                value={this.props.selectedStatus ? this.props.selectedStatus.id : null}
            />
        );
    }
}
