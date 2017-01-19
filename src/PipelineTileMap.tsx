import * as React from "react";
import gql from "graphql-tag/index";

import {Panel, NavItem, Nav, MenuItem, NavDropdown, Navbar} from "react-bootstrap"
let Plotly = require("plotly.js");
let numeric = require("numeric");

import {Loading} from "./Loading";
import graphql from "react-apollo/graphql";
import {TilePipelineStatus} from "./QueryInterfaces";

interface IStageStatus {
    stage_id: string;
    depth: number;
    status: TilePipelineStatus
}

interface ITileStatus {
    x_index: number;
    y_index: number;
    stages: IStageStatus[];
}

export class PipelineTileMap extends React.Component<any, any> {
    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div>
                {this.props.loading ? <Loading/> :
                    <MapPanel projects={this.props.projects} pipelineStages={this.props.pipelineStages}
                              tasks={this.props.tasks}/>}
            </div>
        );
    }
}

class ProjectMenu extends React.Component<any, any> {
    handleChange = (eventKey) => {
        this.props.onProjectSelectionChange(eventKey);
    };

    render() {
        let title = "";

        let rows = this.props.projects.map(project => {
            if (project.id === this.props.selectedProjectId) {
                title = `${project.name} (Sample Id ${project.sample_number})`;
            }

            return (<MenuItem key={"pipeline_project_" +project.id}
                              eventKey={project.id}>{`${project.name} (Sample Id ${project.sample_number})`}</MenuItem>)
        });

        return (
            <NavDropdown id="tilemap-project-dropdown" title={title} onSelect={this.handleChange}>
                {rows}
            </NavDropdown>
        )
    }
}

class MapPanel extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            projectId: "",
            minZ: 0,
            maxZ: 1e6,
            plane: -1
        };
    }

    onProjectChanged = (eventKey) => {
        let project = this.props.projects.filter(x => x.id === eventKey);

        console.log(project);

        let minZ = 0;
        let maxZ = 1e6;

        if (project.length > 0 && project[0].id !== this.state.projectId) {
            project = project[0];

            if (project.region_z_min > -1) {
                minZ = project.region_z_min;
            }

            if (project.region_z_max > -1) {
                maxZ = project.region_z_max;
            }

            this.setState({projectId: eventKey, minZ: minZ, maxZ: maxZ, plane: minZ}, null);
        }
    };

    onLeftClick = () => {
        if (this.state.plane > this.state.minZ) {
            this.setState({plane: this.state.plane - 1}, null);
        }
    };

    onRightClick = () => {
        if (this.state.plane < this.state.maxZ) {
            this.setState({plane: this.state.plane + 1}, null);
        }
    };

    render() {
        let project_id = "af8cb0d4-56c0-4db8-8a1b-7b39540b2d04";
        // let project_id = "44e49773-1c19-494b-b283-54466b94b70f";

        return (

            <Panel collapsible defaultExpanded header="Pipeline Tile Map" bsStyle="info">
                <Navbar inverse fluid>
                    <Navbar.Header>
                        <Navbar.Brand>
                            Project
                        </Navbar.Brand>
                        <Navbar.Toggle />
                    </Navbar.Header>
                    <Nav>
                        <ProjectMenu projects={this.props.projects} onProjectSelectionChange={this.onProjectChanged}/>
                    </Nav>
                    <Nav pullRight>
                        <NavItem>Current Z Index</NavItem>
                        <NavItem>{this.state.plane}</NavItem>
                        <NavItem onClick={this.onLeftClick}>{"<"}</NavItem>
                        <NavItem onClick={this.onRightClick}>{">"}</NavItem>
                    </Nav>
                </Navbar>
                <PlotWithQuery project_id={project_id} plane={this.state.plane} projects={this.props.projects}
                               pipelineStages={this.props.pipelineStages} tasks={this.props.tasks}/>
            </Panel>
        );
    }
}

class Plot extends React.Component<any, any> {
    componentDidMount() {
        let pipelineStages = this.props.pipelineStages;

        let pipelineIds = pipelineStages.map(p => p.id);

        let x = [];
        let y = [];
        let z = [];
        let zmax = 0;
        let annotations = [];

        if (this.props.data && this.props.data.projectPlaneTileStatus && this.props.data.projectPlaneTileStatus.tiles.length > 0) {
            let data = this.props.data.projectPlaneTileStatus;

            zmax = data.max_depth + 1;

            x = numeric.linspace(data.x_min, data.x_max);
            y = numeric.linspace(data.y_min, data.y_max);
            z = numeric.rep([x.length, y.length], 0);

            data.tiles.map((tile: ITileStatus) => {
                let markedStages = tile.stages.reduce((depth, stage) => {
                    if (stage.status === TilePipelineStatus.Waiting) {
                        // Queued or processing
                        if (depth[0] === null || stage.depth < depth[0].depth)
                            depth[0] = stage;
                    }

                    if (stage.status > TilePipelineStatus.Waiting && stage.status < TilePipelineStatus.Complete) {
                        // Queued or processing
                        if (depth[1] === null || stage.depth < depth[1].depth)
                            depth[1] = stage;
                    }

                    if (stage.status === TilePipelineStatus.Complete) {
                        // Queued or processing
                        if (depth[2] === null || stage.depth > depth[2].depth)
                            depth[2] = stage;
                    }
                    return depth;
                }, [null, null, null]);

                // Have lowest incomplete, lowest processing, and lowest complete.

                // In a pipeline is done, incomplete and queued/processing should be NONE and we can
                // just show complete (at max-depth + 1).

                // Otherwise we want the lowest depth incomplete or queued/processing.  If it is a single branch, the
                // branch queued or processing the the one the use.  For multi-branch, until we show mixed info on a
                // tile show the lowest queued/processing depth.

                // If the all stages are incomplete it is waiting on the acquisition.

                let displayStage = null;

                if (!markedStages[0] && !markedStages[1]) {
                    if (markedStages[2]) {
                        displayStage = markedStages[2];
                    }
                } else {
                    if (markedStages[1]) {
                        displayStage = markedStages[1];
                    } else if (markedStages[0]) {
                        displayStage = markedStages[0];
                    }
                }

                let foo = {
                    x: tile.x_index,
                    y: tile.y_index,
                    sa: markedStages,
                    ds: displayStage
                };

                console.log(foo);

                let stageText = "acquisition<br>WAITING";

                if (displayStage) {
                    let pipelineStageIndex = pipelineIds.indexOf(displayStage.stage_id);

                    if (pipelineStageIndex > -1) {
                        let pipelineStage = pipelineStages[pipelineStageIndex];
                        stageText = `${pipelineStage.name}<br>` + TilePipelineStatus[displayStage.status];
                    }
                }

                let pseudoDepth = displayStage ? (displayStage.status === TilePipelineStatus.Complete ? displayStage.depth + 1 : (displayStage.status === TilePipelineStatus.Waiting ? displayStage.depth - 0.5 : displayStage.depth)) : 0;

                console.log(`${tile.x_index} ${tile.y_index} ${pseudoDepth}`);
                let result = {
                    xref: 'x1',
                    yref: 'y1',
                    x: tile.x_index,
                    y: tile.y_index,
                    text: `${stageText}`,
                    font: {
                        family: 'Arial',
                        size: 12,
                        color: 'white'
                    },
                    showarrow: false
                };

                annotations.push(result);

                if (displayStage) {
                    z[tile.y_index - data.y_min][tile.x_index - data.x_min] = pseudoDepth;
                } else {
                    z[tile.y_index - data.y_min][tile.x_index - data.x_min] = 0;
                }
            });
        } else {
            x = numeric.linspace(0, 0);
            y = numeric.linspace(0, 0);
            z = numeric.rep([1, 1], 0);
            zmax = 1;
        }

        Plotly.newPlot('tile_map_plot', [{
            x: x,
            y: y,
            z: z,
            zmin: 0,
            zmax: zmax,
            margin: {
                t: 100
            },
            colorscale: [
                [0, 'black'],
                [.2, 'red'],
                [1, 'green']
            ],
            type: "heatmap"
        }], {
            margin: {
                t: 20, r: 0, l: 30
            },
            xaxis: {
                gridcolor: 'black',
                //    type: 'category'
            },
            yaxis: {
                gridcolor: 'black',
                //    type: 'category'
            },
            annotations: annotations
        }, {
            displayModeBar: false
        });
    }

    componentWillUpdate = () => {
        this.componentDidMount();
    }

    render() {

        return (
            <div id="tile_map_plot"></div>
        );
    }
}

const PipelineTileMapQuery = gql`query($project_id: String, $plane: Int) { 
  projectPlaneTileStatus(project_id: $project_id, plane: $plane) {
    max_depth
    x_min
    x_max
    y_min
    y_max
    tiles {
      x_index
      y_index
      stages {
        stage_id
        depth
        status
      }
    }
  }
}`;

const PlotWithQuery = graphql(PipelineTileMapQuery, {
    options: ({project_id, plane}) => ({
        pollInterval: 5000,
        variables: {
            project_id: project_id,
            plane: plane
        }
    })
})(Plot);