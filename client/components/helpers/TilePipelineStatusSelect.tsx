import * as React from "react";

import {DynamicSimpleSelect} from "ndb-react-components";
import {TilePipelineStatusType} from "../../models/tilePipelineStatus";

export class TilePipelineStatusSelect extends DynamicSimpleSelect<TilePipelineStatusType> {
    protected selectLabelForOption(option: TilePipelineStatusType): any {
        return option.id;
    }
}
