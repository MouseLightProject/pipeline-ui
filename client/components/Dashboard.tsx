import * as React from "react";

import {HeaderSummary} from "./dashboard/HeaderSummary";
import {IProject} from "../models/project";
import {IWorker} from "../models/worker";

export interface IDashboardProps {
    projects: IProject[];
    workers: IWorker[];
}

export const Dashboard = (props: IDashboardProps) => (
    <HeaderSummary {...props} isNavTile={false}/>
);
