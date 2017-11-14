import * as React from "react";
import {Dropdown} from "semantic-ui-react";

import {IPipelineStage} from "../../models/pipelineStage";

interface IProjectPipelineStageSelectProps {
    pipelineStages: IPipelineStage[];
    selectedPipelineStage: IPipelineStage;

    onSelectPipelineStage(pipelineStage: IPipelineStage): void;
}

interface IPipelineStageSelectState {
}

export class PipelineStageSelect extends React.Component<IProjectPipelineStageSelectProps, IPipelineStageSelectState> {
    private onSelectPipelineStage(evt, option) {
        if (option.value) {
            this.props.onSelectPipelineStage(this.props.pipelineStages[this.props.pipelineStages.findIndex(p => p.id === option.value)]);
        } else {
            this.props.onSelectPipelineStage(null);
        }
    }

    public render() {
        const options = this.props.pipelineStages.map(p => {
            return {key: p.id, value:p.id, text: p.name}
        });

        return (
            <Dropdown
                onChange={(evt, option) => this.onSelectPipelineStage(evt, option)}
                options={options}
                selection
                search
                placeholder="(none - use acquisition root)"
                value={this.props.selectedPipelineStage ? this.props.selectedPipelineStage.id : null}
            />
        );
    }
}
