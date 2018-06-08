import * as React from "react";
import {Dropdown} from "semantic-ui-react";

import {IPipelineStage} from "../../models/pipelineStage";

interface IProjectPipelineStageSelectProps {
    disabled: boolean;
    stages: IPipelineStage[];
    selectedPipelineStage: IPipelineStage;

    onSelectPipelineStage(pipelineStage: IPipelineStage): void;
}

interface IPipelineStageSelectState {
}

export class PipelineStageSelect extends React.Component<IProjectPipelineStageSelectProps, IPipelineStageSelectState> {
    private onSelectPipelineStage(evt, option) {
        if (option.value) {
            this.props.onSelectPipelineStage(this.props.stages[this.props.stages.findIndex(p => p.id === option.value)]);
        } else {
            this.props.onSelectPipelineStage(null);
        }
    }

    public render() {
        const options = this.props.stages.map(p => {
            return {key: p.id, value:p.id, text: p.name}
        });

        options.unshift({key: "none", value: null, text: "(none - use acquisition root)"});

        return (
            <Dropdown
                onChange={(evt, option) => this.onSelectPipelineStage(evt, option)}
                options={options}
                selection
                search
                disabled={this.props.disabled}
                placeholder="(none - use acquisition root)"
                value={this.props.selectedPipelineStage ? this.props.selectedPipelineStage.id : null}
            />
        );
    }
}
