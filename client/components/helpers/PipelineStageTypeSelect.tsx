import * as React from "react";
import {Dropdown} from "semantic-ui-react";

import {PipelineStageType} from "../../models/pipelineStageType";

interface IPipelineStageTypeSelectProps {
    pipelineStageTypes: PipelineStageType[];
    selectedPipelineStageType: PipelineStageType;

    onSelectPipelineStageType(task: PipelineStageType): void;
}

interface IPipelineStageTypeSelectState {
}

export class PipelineStageTypeSelect extends React.Component<IPipelineStageTypeSelectProps, IPipelineStageTypeSelectState> {
    private onSelectPipelineStageType(evt, option) {
        if (option.value) {
            this.props.onSelectPipelineStageType(this.props.pipelineStageTypes[this.props.pipelineStageTypes.findIndex(p => p.id === option.value)]);
        } else {
            this.props.onSelectPipelineStageType(null);
        }
    }

    public render() {
        const options = this.props.pipelineStageTypes.map(p => {
            return {key: p.id, value:p.id, text: p.id}
        });

        return (
            <Dropdown
                onChange={(evt, option) => this.onSelectPipelineStageType(evt, option)}
                options={options}
                selection
                search
                placeholder="(required)"
                value={this.props.selectedPipelineStageType ? this.props.selectedPipelineStageType.id : null}
            />
        );
    }
}
