import * as React from "react";
import gql from "graphql-tag/index";

import {Panel, NavItem, Nav, MenuItem, NavDropdown, Navbar} from "react-bootstrap"
let Plotly = require("plotly.js");
let numeric = require("numeric");

import {Loading} from "./Loading";
import graphql from "react-apollo/graphql";
import {TilePipelineStatus, IProject} from "./QueryInterfaces";

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
            minZ: 0,
            maxZ: 1e6,
            plane: -1,
            autozoom: true
        };
    }

    componentDidMount = () => {
        if (this.state.projectId === "" && this.props.projects.length > 1) {
            this.onProjectChanged(this.props.projects[0].id);
        }
    };

    componentDidUpdate = () => {
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

    onResetZoom = () => {
        this.setState({autozoom: true}, null);
    };

    onManualZoom = () => {
        this.setState({autozoom: false}, null);
    }

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
            <Panel collapsible defaultExpanded header="Pipeline Tile Map" bsStyle="info">
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
                               pipelineStages={this.props.pipelineStages} tasks={this.props.tasks}
                               autozoom={this.state.autozoom} onManualZoom={this.onManualZoom}/>
            </Panel>
        );
    }
}

class Plot extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            autorange: true,
            xrange: [],
            yrange: []
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        console.log("----");
        console.log(nextProps);
        console.log(this.props);
        if (nextProps.project_id !== this.props.project_id) {
            console.log("shouldUpdate 1");
            return true;
        }

        if (nextProps.data !== this.props.data) {
            console.log("shouldUpdate 2");
            return true;
        }

        if (!nextProps.data) {
            console.log("shouldNotUpdate 3");
            return false;
        }

        if (nextProps.data.loading !== this.props.data.loading) {
            console.log("shouldUpdate 4a");
            return true;
        }

        if (nextProps.data.projectPlaneTileStatus !== this.props.data.projectPlaneTileStatus) {
            console.log("shouldUpdate 4");
            return true;
        }

        if (!nextProps.data.projectPlaneTileStatus) {
            console.log("shouldNotUpdate 5");
            return false;
        }

        if (nextProps.data.projectPlaneTileStatus.max_depth !== this.props.data.projectPlaneTileStatus.max_depth) {
            console.log("shouldUpdate 5a");
            return true;
        }


        if (nextProps.data.projectPlaneTileStatus.x_min !== this.props.data.projectPlaneTileStatus.x_min) {
            console.log("shouldUpdate 5a");
            return true;
        }

        if (nextProps.data.projectPlaneTileStatus.x_max !== this.props.data.projectPlaneTileStatus.x_max) {
            console.log("shouldUpdate 5b");
            return true;
        }

        if (nextProps.data.projectPlaneTileStatus.y_min !== this.props.data.projectPlaneTileStatus.y_min) {
            console.log("shouldUpdate 5c");
            return true;
        }

        if (nextProps.data.projectPlaneTileStatus.y_max !== this.props.data.projectPlaneTileStatus.y_max) {
            console.log("shouldUpdate 5d");
            return true;
        }

        let thisTiles = this.props.data.projectPlaneTileStatus.tiles;

        let nextTiles = nextProps.data.projectPlaneTileStatus.tiles;

        if (thisTiles.length !== nextTiles.length) {
            console.log("shouldUpdate 6");
            return true;
        }

        if (thisTiles.length === 0) {
            console.log("shouldNotUpdate 7");
            return false;
        }

        let shouldUpdate = thisTiles.some((thisTile, index) => {
            let nextTile = nextTiles[index];

            if (thisTile.stages.length != nextTile.stages.length) {
                console.log("shouldUpdate 8");
                return true;
            }

            if (thisTile.x_index != nextTile.x_index) {
                console.log("shouldUpdate 9");
                return true;
            }

            if (thisTile.y_index != nextTile.y_index) {
                console.log("shouldUpdate 10");
                return true;
            }

            if (thisTile.stages.length === 0) {
                return false;
            }

            let shouldUpdate2 = thisTile.stages.some((thisStage, index) => {
                let nextStage = nextTile.stages[index];

                if (thisStage.status != nextStage.status) {
                    console.log("shouldUpdate 11");
                    return true;
                }

                if (thisStage.stage_id != nextStage.stage_id) {
                    console.log("shouldUpdate 12");
                    return true;
                }

                if (thisStage.depth != nextStage.depth) {
                    console.log("shouldUpdate 13");
                    return true;
                }

                return false;
            });

            return shouldUpdate2;
        });

        console.log(`${shouldUpdate ? "shouldUpdate" : "shouldNotUpdate"}`);

        return shouldUpdate;
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
        let zmax = 0;
        let annotations = [];

        console.log("***");
        console.log(props);

        if (props.data && props.data.projectPlaneTileStatus) {
            let data = props.data.projectPlaneTileStatus;

            zmax = data.max_depth + 1;

            let xmin = project ? (project.sample_x_min >= 0 ? project.sample_x_min : data.x_min) : data.x_min;
            let xmax = project ? (project.sample_x_max >= 0 ? project.sample_x_max : data.x_max) : data.x_max;
            let ymin = project ? (project.sample_y_min >= 0 ? project.sample_y_min : data.y_min) : data.y_min;
            let ymax = project ? (project.sample_y_max >= 0 ? project.sample_y_max : data.y_max) : data.y_max;

            x = numeric.linspace(xmin, xmax);
            y = numeric.linspace(ymin, ymax);
            z = numeric.rep([y.length, x.length], 0);

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

                let stageText = "";

                let useFullText = this.state.xrange.length > 1 && (this.state.xrange[1] - this.state.xrange[0] < 15);

                let pseudoDepth = displayStage ? (displayStage.status === TilePipelineStatus.Complete ? displayStage.depth + 1 : (displayStage.status === TilePipelineStatus.Waiting ? displayStage.depth - 0.5 : displayStage.depth)) : 0;

                if (displayStage) {
                    let pipelineStageIndex = pipelineIds.indexOf(displayStage.stage_id);

                    if (pipelineStageIndex > -1) {
                        let pipelineStage = pipelineStages[pipelineStageIndex];

                        if (useFullText) {
                            if (displayStage.depth === 1 && displayStage.status === TilePipelineStatus.Waiting) {
                                stageText = "OoS";
                            } else {
                                stageText = `${pipelineStage.name}<br>` + TilePipelineStatus[displayStage.status];
                            }
                        } else {
                            if (displayStage.depth === 1 && displayStage.status === TilePipelineStatus.Waiting) {
                                stageText = "";
                            } else {
                                stageText = `${pipelineStage.name.substr(0, 1)}-${TilePipelineStatus[displayStage.status].substr(0, 1)}`;
                            }
                        }
                    }
                }

                let result = {
                    xref: "x1",
                    yref: "y1",
                    x: tile.x_index,
                    y: tile.y_index,
                    text: `${stageText}`,
                    font: {
                        family: "Arial",
                        size: 12,
                        color: "white"
                    },
                    showarrow: false
                };

                annotations.push(result);

                if (displayStage) {
                    z[tile.y_index - ymin][tile.x_index - xmin] = pseudoDepth;
                } else {
                    z[tile.y_index - ymin][tile.x_index - xmin] = 0;
                }
            });
        } else {
            let xmin = project ? (project.sample_x_min >= 0 ? project.sample_x_min : 0) : 0;
            let xmax = project ? (project.sample_x_max >= 0 ? project.sample_x_max : 0) : 0;
            let ymin = project ? (project.sample_y_min >= 0 ? project.sample_y_min : 0) : 0;
            let ymax = project ? (project.sample_y_max >= 0 ? project.sample_y_max : 0) : 0;

            x = numeric.linspace(xmin, xmax);
            y = numeric.linspace(ymin, ymax);
            z = numeric.rep([x.length, y.length], 0);

            zmax = 1;
        }


        let xrange = this.state.autorage ? [] : this.state.xrange;
        let yrange = this.state.autorage ? [] : this.state.yrange;

        return {
            x: x,
            y: y,
            z: z,
            zmax: zmax,
            xrange: xrange,
            yrange: yrange,
            annotations: annotations
        }
    };

    componentDidMount = () => {
        let data = this.createFigure(this.props);

        let tileMapDiv = document.getElementById("tile_map_plot");

        Plotly.newPlot(tileMapDiv, [{
            x: data.x,
            y: data.y,
            z: data.z,
            zmin: 0,
            zmax: data.zmax,
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
                // autorange: this.state.autorange,
                //  range: data.xrange
            },
            yaxis: {
                showgrid: false,
                //  autorange: this.state.autorange,
                //  range: data.yrange
            },
            annotations: data.annotations,
            shapes: data.x.slice(1).map(makeLineVert).concat(data.y.slice(1).map(makeLineHoriz))
        }, {
            displayModeBar: false
        });

        tileMapDiv.on("plotly_doubleclick", (eventdata) => {
            this.setState({autorange: true, xrange: [], yrange: []}, null);
        });

        tileMapDiv.on("plotly_relayout", (eventdata) => {
            if (eventdata && eventdata["xaxis.range[0]"]) {
                //    this.props.onManualZoom();
                this.setState({
                    autorange: false,
                    xrange: [eventdata["xaxis.range[0]"], eventdata["xaxis.range[1]"]],
                    yrange: [eventdata["yaxis.range[0]"], eventdata["yaxis.range[1]"]]
                }, null);
            }
        });
    };

    componentWillReceiveProps = (props) => {
        // if (this.state.autozoom) {
        //     this.setState({autorange: true, xrange: [], yrange: []}, null);
        // }

        // this.componentDidMount();

        let data = this.createFigure(props);

        console.log(data);

        let tileMapDiv = document.getElementById("tile_map_plot");
        /*
         console.log(data);

         Plotly.restyle(tileMapDiv, [{
         x: data.x,
         y: data.y,
         z: data.z,
         zmax: data.zmax
         }]);

         Plotly.relayout(tileMapDiv, {
         xaxis: {
         showgrid: false,
         autorange: this.state.autorange,
         range: data.xrange
         },
         yaxis: {
         showgrid: false,
         autorange: this.state.autorange,
         range: data.yrange
         },
         annotations: data.annotations,
         shapes: data.x.slice(1).map(makeLineVert).concat(data.y.slice(1).map(makeLineHoriz))
         });
         */
        tileMapDiv.data = [{
            x: data.x,
            y: data.y,
            z: data.z,
            zmin: 0,
            zmax: data.zmax,
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
                autorange: this.state.autorange,
                range: data.xrange
            },
            yaxis: {
                showgrid: false,
                autorange: this.state.autorange,
                range: data.yrange
            },
            annotations: data.annotations,
            shapes: data.x.slice(1).map(makeLineVert).concat(data.y.slice(1).map(makeLineHoriz))
        };

        Plotly.redraw(tileMapDiv);
    };

    render() {

        let divStyle = {
            "height": "1000px"
        };

        return (
            <div style={divStyle} id="tile_map_plot"></div>
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

