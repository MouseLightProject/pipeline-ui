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
        let stages = this.props.pipelineStages.slice();

        if (this.props.selectedProjectId !== AllProjectsId) {
            stages = stages.filter((stage) => stage.project.id === this.props.selectedProjectId);
        }

        stages = stages.sort((a, b) => {
           if  (a.project.id === b.project.id) {
               if (a.depth === b.depth) {
                   return a.depth - b.depth;
               }
               return a.name.localeCompare(b.name);
           }

           return a.project.name.localeCompare(b.project.name);
        });

        let rows = stages.map(pipelineStage => (
            <PipelineStageRow key={"tr_pipeline" + pipelineStage.id} pipelineStage={pipelineStage} tasks={this.props.tasks} projects={this.props.projects}/>));

        return (
            <Table condensed style={{marginBottom: "0"}}>
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
