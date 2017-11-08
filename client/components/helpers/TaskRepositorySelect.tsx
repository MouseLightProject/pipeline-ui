import * as React from "react";

import {DynamicSimpleSelect} from "ndb-react-components";
import {ITaskRepository} from "../../models/taskRepository";

export class TaskRepositorySelect extends DynamicSimpleSelect<ITaskRepository> {
    protected selectLabelForOption(option: ITaskRepository): any {
        return option.name;
    }
}
