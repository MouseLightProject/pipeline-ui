import * as React from "react";

import {DynamicSimpleSelect} from "ndb-react-components";
import {PipelineStageType} from "../../models/pipelineStageType";

export class PipelineStageTypeSelect extends DynamicSimpleSelect<PipelineStageType> {
    protected selectLabelForOption(option: PipelineStageType): any {
        return option ? option.id : "";
    }
}
