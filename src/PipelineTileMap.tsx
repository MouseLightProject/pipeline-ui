import * as React from "react";
import gql from "graphql-tag";
import {graphql} from "react-apollo";

import {NavItem, Nav, MenuItem, NavDropdown, Navbar} from "react-bootstrap"
let Plotly = require("plotly.js");
let numeric = require("numeric");

import {Loading} from "./Loading";
import {TilePipelineStatus, IProject} from "./models/QueryInterfaces";

enum TileStatusSortIndex {
    Incomplete = 0,
    Queued = 1,
    Complete = 2,
    Failed = 3,
}

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

interface IPlotlyHtmlElement extends HTMLElement {
    layout: any;
    data: any;
    on(event: string, eventFcn: any);
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

            return (<MenuItem key={"pipeline_project_" + project.id}
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
            plane: 0,
            minZ: 0,
            maxZ: 1,
        };
    }

    public componentDidMount() {
        if (this.state.projectId === "" && this.props.projects.length > 1) {
            this.onProjectChanged(this.props.projects[0].id);
        }
    };

    public componentDidUpdate() {
        if (this.state.projectId === "" && this.props.projects.length > 1) {
            this.onProjectChanged(this.props.projects[0].id);
        }
    };

    onProjectChanged = (eventKey) => {
        let project = this.props.projects.filter(x => x.id === eventKey);

        let minZ = 0;
        let maxZ = 1e6;

        if (project.length > 0 && project[0].id !== this.state.projectId) {
            project = project[0];

            if (project.region_z_min > -1) {
                minZ = project.region_z_min;
            }
            else if (project.sample_z_min > -1) {
                minZ = project.sample_z_min;
            }

            if (project.region_z_max > -1) {
                maxZ = project.region_z_max;
            }
            else if (project.sample_z_max > -1) {
                maxZ = project.sample_z_max;
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

    onLeftClickDouble = () => {
        let p = this.state.plane - 10;
        if (p < this.state.minZ) {
            p = this.state.minZ;
        }
        this.setState({plane: p}, null);
    };

    onRightClickDouble = () => {
        let p = this.state.plane + 10;
        if (p > this.state.maxZ) {
            p = this.state.maxZ;
        }
        this.setState({plane: p}, null);
    };

    render() {
        return (
            <div>
                <Navbar inverse fluid>
                    <Navbar.Header>
                        <Navbar.Brand>
                            Project
                        </Navbar.Brand>
                        <Navbar.Toggle />
                    </Navbar.Header>
                    <Nav>
                        <ProjectMenu selectedProjectId={this.state.projectId} projects={this.props.projects}
                                     onProjectSelectionChange={this.onProjectChanged}/>
                    </Nav>
                    <Nav pullRight>
                        <NavItem>Current Z Index</NavItem>
                        <NavItem>{this.state.plane}</NavItem>
                        <NavItem onClick={this.onLeftClickDouble}>{"<<"}</NavItem>
                        <NavItem onClick={this.onLeftClick}>{"<"}</NavItem>
                        <NavItem onClick={this.onRightClick}>{">"}</NavItem>
                        <NavItem onClick={this.onRightClickDouble}>{">>"}</NavItem>
                    </Nav>
                </Navbar>
                <PlotWithQuery project_id={this.state.projectId} plane={this.state.plane} projects={this.props.projects}
                               pipelineStages={this.props.pipelineStages} tasks={this.props.tasks}/>
            </div>
        );
    }
}


export class Plot extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            xRange: [],
            yRange: []
        }
    }

    private updateDimensions() {
        let tileMapDiv = document.getElementById("tile_map_plot") as IPlotlyHtmlElement;

        Plotly.Plots.resize(tileMapDiv);
    }

    createFigure = (props) => {
        let projects = props.projects.filter(x => x.id === props.project_id);

        let project: IProject = null;

        if (projects.length > 0) {
            project = projects[0];
        } else {
            project = null;
        }

        let pipelineStages = props.pipelineStages;

        let pipelineIds = pipelineStages.map(p => p.id);

        let x = [];
        let y = [];
        let z = [];
        let zMax = 0;
        let annotations = [];

        if (props.data && props.data.projectPlaneTileStatus) {
            let data = props.data.projectPlaneTileStatus;

            zMax = data.max_depth + 1;

            let xmin = findMinValue(project, "sample_x_min", data, "x_min");
            let xmax = findMinValue(project, "sample_x_max", data, "x_max");
            let ymin = findMinValue(project, "sample_y_min", data, "y_min");
            let ymax = findMinValue(project, "sample_y_max", data, "y_max");

            x = numeric.linspace(xmin, xmax);
            y = numeric.linspace(ymin, ymax);
            z = numeric.rep([y.length, x.length], 0);

            data.tiles.map((tile: ITileStatus) => {
                if (tile.x_index < xmin || tile.x_index > xmax) {
                    return;
                }

                if (tile.y_index < ymin || tile.y_index > ymax) {
                    return
                }

                let markedStages = tile.stages.reduce((depth, stage) => {
                    if (stage.status === TilePipelineStatus.Waiting) {
                        // Queued or processing
                        if (depth[TileStatusSortIndex.Incomplete] === null || stage.depth < depth[TileStatusSortIndex.Incomplete].depth)
                            depth[TileStatusSortIndex.Incomplete] = stage;
                    }

                    if (stage.status > TilePipelineStatus.Waiting && stage.status < TilePipelineStatus.Complete) {
                        // Queued or processing
                        if (depth[TileStatusSortIndex.Queued] === null || stage.depth < depth[TileStatusSortIndex.Queued].depth)
                            depth[TileStatusSortIndex.Queued] = stage;
                    }

                    if (stage.status === TilePipelineStatus.Complete) {
                        // Complete
                        if (depth[TileStatusSortIndex.Complete] === null || stage.depth > depth[TileStatusSortIndex.Complete].depth)
                            depth[TileStatusSortIndex.Complete] = stage;
                    }

                    if (stage.status === TilePipelineStatus.Failed) {
                        // Failed
                        if (depth[TileStatusSortIndex.Failed] === null || stage.depth > depth[TileStatusSortIndex.Failed].depth)
                            depth[TileStatusSortIndex.Failed] = stage;
                    }

                    return depth;
                }, [null, null, null, null]);

                // Have lowest incomplete, processing, complete, and failed stages.

                // Failed stages take priority to be down over anything else.

                // In a pipeline is done, incomplete and queued/processing should be NONE and we can
                // just show complete (at max-depth + 1).

                // Otherwise we want the lowest depth incomplete or queued/processing.  If it is a single branch, the
                // branch queued or processing the the one the use.  For multi-branch, until we show mixed info on a
                // tile show the lowest queued/processing depth.

                // If the all stages are incomplete it is waiting on the acquisition.

                let displayStage = null;

                if (markedStages[TileStatusSortIndex.Failed]) {
                    displayStage = markedStages[TileStatusSortIndex.Failed];
                } else if (!markedStages[TileStatusSortIndex.Incomplete] && !markedStages[TileStatusSortIndex.Queued]) {
                    if (markedStages[TileStatusSortIndex.Complete]) {
                        displayStage = markedStages[TileStatusSortIndex.Complete];
                    }
                } else {
                    if (markedStages[TileStatusSortIndex.Queued]) {
                        displayStage = markedStages[TileStatusSortIndex.Queued];
                    } else if (markedStages[TileStatusSortIndex.Incomplete]) {
                        displayStage = markedStages[TileStatusSortIndex.Incomplete];
                    }
                }

                let stageText = "";

                let tileMapDiv = document.getElementById("tile_map_plot") as IPlotlyHtmlElement;

                let useFullText = false;

                if (tileMapDiv && tileMapDiv.layout && tileMapDiv.layout.xaxis && tileMapDiv.layout.xaxis.range) {
                    useFullText = tileMapDiv.layout.xaxis.range.length > 1 && (tileMapDiv.layout.xaxis.range[1] - tileMapDiv.layout.xaxis.range[0] < 15);
                }

                let pseudoDepth = 0;

                if (displayStage) {
                    if (displayStage.status === TilePipelineStatus.Complete) {
                        pseudoDepth = displayStage.depth + 1
                    } else if (displayStage.depth === 1 && displayStage.status === TilePipelineStatus.Waiting) {
                        pseudoDepth = displayStage.depth - 0.5;
                    } else if (displayStage.status === TilePipelineStatus.Processing) {
                        pseudoDepth = displayStage.depth + 0.5;
                    } else {
                        pseudoDepth = displayStage.depth;
                    }
                } else {
                    pseudoDepth = 0;
                }

                if (displayStage) {
                    let pipelineStageIndex = pipelineIds.indexOf(displayStage.stage_id);

                    let status = displayStage.status;

                    if (pipelineStageIndex > -1) {
                        let pipelineStage = pipelineStages[pipelineStageIndex];

                        if (useFullText) {
                            if (displayStage.depth === 1 && status === TilePipelineStatus.Waiting) {
                                stageText = "OoS";
                            } else {
                                status = (status === TilePipelineStatus.Waiting) ? TilePipelineStatus.Queued : status;
                                stageText = `${pipelineStage.name}<br>` + TilePipelineStatus[status];
                            }
                        } else {
                            if (displayStage.depth === 1 && status === TilePipelineStatus.Waiting) {
                                stageText = "";
                            } else {
                                status = (status === TilePipelineStatus.Waiting) ? TilePipelineStatus.Queued : status;
                                stageText = `${pipelineStage.name.substr(0, 1)}-${TilePipelineStatus[status].substr(0, 1)}`;
                            }
                        }
                    }
                }

                let color = (pseudoDepth / zMax < 0.3 || pseudoDepth / zMax > 0.8) ? "#CCC" : "#111";
                let failed = displayStage && displayStage.status === TilePipelineStatus.Failed;
                let bold = displayStage && (displayStage.status === TilePipelineStatus.Processing || displayStage.status === TilePipelineStatus.Failed);

                let annotation = {
                    xref: "x1",
                    yref: "y1",
                    x: tile.x_index,
                    y: tile.y_index,
                    text: `${stageText}`,
                    font: {
                        family: "Arial",
                        size: bold ? 16 : 12,
                        color: color
                    },
                    bordercolor: failed ? "#FF0000" : "#00FF00",
                    borderwidth: 0,
                    showarrow: false
                };

                annotations.push(annotation);

                z[tile.y_index - ymin][tile.x_index - xmin] = pseudoDepth;
            });
        } else {
            let xmin = findMinValue(project, "sample_x_min");
            let xmax = findMinValue(project, "sample_x_max");
            let ymin = findMinValue(project, "sample_y_min");
            let ymax = findMinValue(project, "sample_y_max");

            x = numeric.linspace(xmin, xmax);
            y = numeric.linspace(ymin, ymax);
            z = numeric.rep([x.length, y.length], 0);

            zMax = 1;
        }

        return {
            x: x,
            y: y,
            z: z,
            zMax: zMax,
            annotations: annotations
        }
    };

    shouldComponentUpdate(nextProps, nextState) {
        if (nextState.xRange !== this.state.xRange) {
            return true;
        }

        if (nextState.yRange !== this.state.yRange) {
            return true;
        }

        // Not using a deep compare library so we can control how it is evaluated based on which properties change
        // most frequently.
        if (nextProps.project_id !== this.props.project_id) {
            return true;
        }

        if (nextProps.data !== this.props.data) {
            return true;
        }

        if (!nextProps.data) {
            return false;
        }

        if (nextProps.data.loading !== this.props.data.loading) {
            return true;
        }

        if (nextProps.data.projectPlaneTileStatus !== this.props.data.projectPlaneTileStatus) {
            return true;
        }

        if (!nextProps.data.projectPlaneTileStatus) {
            return false;
        }

        if (nextProps.data.projectPlaneTileStatus.max_depth !== this.props.data.projectPlaneTileStatus.max_depth) {
            return true;
        }


        if (nextProps.data.projectPlaneTileStatus.x_min !== this.props.data.projectPlaneTileStatus.x_min) {
            return true;
        }

        if (nextProps.data.projectPlaneTileStatus.x_max !== this.props.data.projectPlaneTileStatus.x_max) {
            return true;
        }

        if (nextProps.data.projectPlaneTileStatus.y_min !== this.props.data.projectPlaneTileStatus.y_min) {
            return true;
        }

        if (nextProps.data.projectPlaneTileStatus.y_max !== this.props.data.projectPlaneTileStatus.y_max) {
            return true;
        }

        let thisTiles = this.props.data.projectPlaneTileStatus.tiles;

        let nextTiles = nextProps.data.projectPlaneTileStatus.tiles;

        if (thisTiles.length !== nextTiles.length) {
            return true;
        }

        if (thisTiles.length === 0) {
            return false;
        }

        return thisTiles.some((thisTile, index) => {
            let nextTile = nextTiles[index];

            if (thisTile.stages.length != nextTile.stages.length) {
                return true;
            }

            if (thisTile.x_index != nextTile.x_index) {
                return true;
            }

            if (thisTile.y_index != nextTile.y_index) {
                return true;
            }

            if (thisTile.stages.length === 0) {
                return false;
            }

            return thisTile.stages.some((thisStage, index) => {
                let nextStage = nextTile.stages[index];

                if (thisStage.status != nextStage.status) {
                    return true;
                }

                if (thisStage.stage_id != nextStage.stage_id) {
                    return true;
                }

                return (thisStage.depth != nextStage.depth);
            });
        });
    }

    componentDidMount() {
        let data = this.createFigure(this.props);

        let tileMapDiv = document.getElementById("tile_map_plot") as IPlotlyHtmlElement;

        Plotly.newPlot(tileMapDiv, [{
            x: data.x,
            y: data.y,
            z: data.z,
            zmin: 0,
            zMax: data.zMax,
            margin: {
                t: 100
            },
            colorscale: 'Jet',
            colorbar: {
                tick0: 0,
                dtick: 1
            },
            type: "heatmap"
        }], {
            margin: {
                t: 20, r: 0, l: 30
            },
            xaxis: {
                showgrid: false,
                dtick: 1,
                autorage: this.state.xRange.length > 0,
                range: this.state.xRange
            },
            yaxis: {
                showgrid: false,
                dtick: 1,
                autorage: this.state.yRange.length > 0,
                range: this.state.yRange
            },
            annotations: data.annotations,
            shapes: data.x.slice(1).map(makeLineVert).concat(data.y.slice(1).map(makeLineHoriz))
        }, {
            displayModeBar: false
        });

        tileMapDiv.on("plotly_relayout", (eventData) => {
            if (eventData) {
                if (eventData["xaxis.autorange"]) {
                    this.setState({xRange: [], yRange: []}, null);
                    this.forceUpdate();
                } else if (eventData["xaxis.range[0]"]) {
                    let x = [eventData["xaxis.range[0]"], eventData["xaxis.range[1]"]];
                    let y = [eventData["yaxis.range[0]"], eventData["yaxis.range[1]"]];
                    this.setState({xRange: x, yRange: y}, null);
                    this.forceUpdate();
                }
            }
        });

        window.addEventListener("resize", this.updateDimensions);
    };

    componentWillReceiveProps(nextProps) {
        if (!this.shouldComponentUpdate(this.props, nextProps)) {
            return;
        }

        let data = this.createFigure(nextProps);

        let tileMapDiv = document.getElementById("tile_map_plot") as IPlotlyHtmlElement;

        tileMapDiv.data = [{
            x: data.x,
            y: data.y,
            z: data.z,
            zmin: 0,
            zMax: data.zMax,
            margin: {
                t: 100
            },
            colorscale: 'Jet',
            colorbar: {
                tick0: 0,
                dtick: 1
            },
            type: "heatmap"
        }];

        tileMapDiv.layout = {
            margin: {
                t: 20, r: 0, l: 30
            },
            xaxis: {
                showgrid: false,
                dtick: 1,
                autorage: this.state.xRange.length > 0,
                range: this.state.xRange
            },
            yaxis: {
                showgrid: false,
                dtick: 1,
                autorage: this.state.yRange.length > 0,
                range: this.state.yRange
            },
            annotations: data.annotations,
            shapes: data.x.slice(1).map(makeLineVert).concat(data.y.slice(1).map(makeLineHoriz))
        };

        Plotly.redraw(tileMapDiv);

    };

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions);
    }

    render() {
        let divStyle = {
            "width": "100%",
            "height": "100%"
        };

        return (
            <div style={divStyle} id="tile_map_plot"></div>
        );
    }
}

function findMinValue(project, property, backupSource = null, backupProperty = null) {
    if (project) {
        if (project[property]) {
            return project[property];
        }
    }

    if (backupSource) {
        if (backupSource[backupProperty]) {
            return backupSource[backupProperty];
        }
    }

    return 0;
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
        pollInterval: 60000,
        variables: {
            project_id: project_id,
            plane: plane
        }
    })
})(Plot);

function makeLineVert(x) {
    return {
        type: 'line',
        xref: 'x',
        yref: 'paper',
        x0: x - 0.5,
        y0: 0,
        x1: x - 0.5,
        y1: 1,
        line: {
            color: 'rgb(255, 255, 255)',
            width: 0.5
        }
    };
}

function makeLineHoriz(y) {
    return {
        type: 'line',
        xref: 'paper',
        yref: 'y',
        x0: 0,
        y0: y - 0.5,
        x1: 1,
        y1: y - 0.5,
        line: {
            color: 'rgb(255, 255, 255)',
            width: 0.5
        }
    };
}

