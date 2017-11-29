import * as React from "react";
import {Dropdown} from "semantic-ui-react"

import {IPipelineStage} from "../../models/pipelineStage";

const ProjectText = "(acquisition root)";

export interface IPipelineStagesMenuProps {
    style?: any;
    keyPrefix: string;
    stages: IPipelineStage[];
    selectedStageId: string;
    projectId: string;
    includeProject?: boolean;

    onStageSelectionChange(projectId: string);
}

export interface IPipelineStagesMenuState {
}

export class PipelineStagesMenu extends React.Component<IPipelineStagesMenuProps, IPipelineStagesMenuState> {
    private handleChange(eventKey) {
        this.props.onStageSelectionChange(eventKey);
    };

    public render() {
        const includeProject = this.props.includeProject || false;

        let title = "";
        let rows = [];

        if (this.props.stages) {
            rows = this.props.stages.map(project => {
                if (this.props.selectedStageId === project.id) {
                    title = `${project.name}`;
                }

                return (
                    <Dropdown.Item key={this.props.keyPrefix + project.id}
                                   onClick={() => this.handleChange(project.id)}>
                        {`${project.name}`}
                    </Dropdown.Item>
                );
            });
        }

        if (includeProject) {
            if (this.props.selectedStageId === this.props.projectId) {
                title = ProjectText;
            }

            rows = [(
                <Dropdown.Item key={this.props.keyPrefix + this.props.projectId}
                               onClick={(event, data) => this.handleChange(this.props.projectId)}>
                    {ProjectText}
                </Dropdown.Item>), (
                <Dropdown.Divider key={"divider"}/>)].concat(rows);
        }

        const style = this.props.style || null;

        return (
            <Dropdown item text={title} style={style}>
                <Dropdown.Menu>
                    {rows}
                </Dropdown.Menu>
            </Dropdown>
        );
    }
}
