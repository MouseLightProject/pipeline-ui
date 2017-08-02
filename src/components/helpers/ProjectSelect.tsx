import * as React from "react";

import {DynamicSimpleSelect} from "ndb-react-components";
import {IProject} from "../../models/project";

export class ProjectSelect extends DynamicSimpleSelect<IProject> {
    protected selectLabelForOption(option: IProject): any {
        return option.name;
    }
}
