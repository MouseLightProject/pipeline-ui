import * as React from "react";

import {DynamicSimpleSelect} from "ndb-react-components";
import {ITaskDefinition} from "../../models/taskDefinition";

export class TaskSelect extends DynamicSimpleSelect<ITaskDefinition> {
    protected selectLabelForOption(option: ITaskDefinition): any {
        return option.name;
    }
}
