import * as React from "react";
import {Table} from "react-bootstrap"

import {IPipelineStage} from "../../models/pipelineStage";
import {AllProjectsId} from "../helpers/ProjectMenu";
import {PipelineStageRow} from "./PipelineStageRow";
import {ITaskDefinition} from "../../models/taskDefinition";
import {IProject} from "../../models/project";

interface IPipelineStageTable {
    pipelineStages: IPipelineStage[];
    selectedProjectId: string;
    tasks: ITaskDefinition[];
    projects: IProject[];
}

export class PipelineStageTable extends React.Component<IPipelineStageTable, any> {
    render() {
        let stages = this.props.pipelineStages;

        if (this.props.selectedProjectId !== AllProjectsId) {
            stages = stages.filter((stage) => stage.project.id === this.props.selectedProjectId);
        }

        let rows = stages.map(pipelineStage => (
            <PipelineStageRow key={"tr_pipeline" + pipelineStage.id} pipelineStage={pipelineStage} tasks={this.props.tasks} projects={this.props.projects}/>));

        return (
            <Table condensed>
                <thead>
                <tr>
                    <th/>
                    <th/>
                    <th>Name</th>
                    <th>Project</th>
                    <th>Task</th>
                    <th>Previous Stage</th>
                    <th>Destination Path</th>
                    <th>Queue</th>
                    <th/>
                </tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </Table>
        );
    }
}
