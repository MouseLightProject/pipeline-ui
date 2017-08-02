import * as React from "react";

import {DynamicSimpleSelect} from "ndb-react-components";
import {IPipelineStage} from "../../models/pipelineStage";

export class PipelineStageSelect extends DynamicSimpleSelect<IPipelineStage> {
    protected selectLabelForOption(option: IPipelineStage): any {
        return option.name;
    }
}
