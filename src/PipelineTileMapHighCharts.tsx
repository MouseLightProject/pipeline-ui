import * as React from "react";
import gql from "graphql-tag/index";
import {Panel, NavItem, Nav, MenuItem, NavDropdown, Navbar} from "react-bootstrap"
let numeric = require("numeric");

const Highcharts = require("highcharts");
require("highcharts/modules/heatmap")(Highcharts);

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

enum TileStatusSortIndex {
    Incomplete = 0,
    Queued = 1,
    Complete = 2,
    Failed = 3,
}

const jet = [
    [0.00, "#00008F"],
    [0.02, "#00009F"],
    [0.03, "#0000AF"],
    [0.05, "#0000BF"],
    [0.06, "#0000CF"],
    [0.08, "#0000DF"],
    [0.10, "#0000EF"],
    [0.11, "#0000FF"],
    [0.13, "#0010FF"],
    [0.14, "#0020FF"],
    [0.16, "#0030FF"],
    [0.17, "#0040FF"],
    [0.19, "#0050FF"],
    [0.21, "#0060FF"],
    [0.22, "#0070FF"],
    [0.24, "#0080FF"],
    [0.25, "#008FFF"],
    [0.27, "#009FFF"],
    [0.29, "#00AFFF"],
    [0.30, "#00BFFF"],
    [0.32, "#00CFFF"],
    [0.33, "#00DFFF"],
    [0.35, "#00EFFF"],
    [0.37, "#00FFFF"],
    [0.38, "#10FFEF"],
    [0.40, "#20FFDF"],
    [0.41, "#30FFCF"],
    [0.43, "#40FFBF"],
    [0.44, "#50FFAF"],
    [0.46, "#60FF9F"],
    [0.48, "#70FF8F"],
    [0.49, "#80FF80"],
    [0.51, "#8FFF70"],
    [0.52, "#9FFF60"],
    [0.54, "#AFFF50"],
    [0.56, "#BFFF40"],
    [0.57, "#CFFF30"],
    [0.59, "#DFFF20"],
    [0.60, "#EFFF10"],
    [0.62, "#FFFF00"],
    [0.63, "#FFEF00"],
    [0.65, "#FFDF00"],
    [0.67, "#FFCF00"],
    [0.68, "#FFBF00"],
    [0.70, "#FFAF00"],
    [0.71, "#FF9F00"],
    [0.73, "#FF8F00"],
    [0.75, "#FF8000"],
    [0.76, "#FF7000"],
    [0.78, "#FF6000"],
    [0.79, "#FF5000"],
    [0.81, "#FF4000"],
    [0.83, "#FF3000"],
    [0.84, "#FF2000"],
    [0.86, "#FF1000"],
    [0.87, "#FF0000"],
    [0.89, "#EF0000"],
    [0.90, "#DF0000"],
    [0.92, "#CF0000"],
    [0.94, "#BF0000"],
    [0.95, "#AF0000"],
    [0.97, "#9F0000"],
    [0.98, "#8F0000"],
    [1.00, "#800000"],
];

(function (H) {
    H.wrap(H.Chart.prototype, 'pan', function (proceed) {
        let chart = this,
            hoverPoints = chart.hoverPoints,
            doRedraw,
            e = arguments[1],
            each = H.each;

        // remove active points for shared tooltip
        if (hoverPoints) {
            each(hoverPoints, function (point) {
                point.setState();
            });
        }

        let mousePosX = e.chartX,
            mousePosY = e.chartY,
            xAxis = chart.xAxis[0],
            yAxis = chart.yAxis[0],
            startPosX = chart.mouseDownX,
            startPosY = chart.mouseDownY,
            halfPointRangeX = (xAxis.pointRange || 0) / 2,
            halfPointRangeY = (yAxis.pointRange || 0) / 2,
            extremesX = xAxis.getExtremes(),
            newMinX = xAxis.toValue(startPosX - mousePosX, true) + halfPointRangeX,
            newMaxX = xAxis.toValue(startPosX + chart.plotWidth - mousePosX, true) - halfPointRangeX,
            extremesY = yAxis.getExtremes(),
            newMaxY = yAxis.toValue(startPosY - mousePosY, true) + halfPointRangeY,
            newMinY = yAxis.toValue(startPosY + chart.plotHeight - mousePosY, true) - halfPointRangeY;

        if (xAxis.series.length && newMinX > Math.min(extremesX.dataMin - 1, extremesX.min) && newMaxX < Math.max(extremesX.dataMax + 1, extremesX.max)) {
            xAxis.setExtremes(newMinX, newMaxX, false, false, {
                trigger: 'pan'
            });
            doRedraw = true;
        }

        if (xAxis.series.length && newMinY > Math.min(extremesY.dataMin - 1, extremesY.min) && newMaxY < Math.max(extremesY.dataMax + 1, extremesY.max)) {
            yAxis.setExtremes(newMinY, newMaxY, false, false, {
                trigger: 'pan'
            });
            doRedraw = true;
        }

        chart.mouseDownX = mousePosX;
        chart.mouseDownY = mousePosY;// set new reference for next run

        if (doRedraw) {
            chart.redraw(false);
        }
    });

}(Highcharts));

export class PipelineTileMapHighCharts extends React.Component<any, any> {
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
        };
    }

    componentDidMount() {
        if (this.state.projectId === "" && this.props.projects.length > 1) {
            this.onProjectChanged(this.props.projects[0].id);
        }
    };

    componentDidUpdate() {
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
                               loading={this.props.data && this.props.data.loading}/>
            </Panel>
        );
    }
}

class Plot extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            xRange: [],
            yRange: []
        };
    }

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


        let xMin = 0;
        let xMax = 0;
        let yMin = 0;
        let yMax = 0;
        let zMax = 0;

        if (props.data && props.data.projectPlaneTileStatus) {
            let data = props.data.projectPlaneTileStatus;

            zMax = data.max_depth + 1;

            xMin = findMinValue(project, "sample_x_min", data, "x_min");
            xMax = findMinValue(project, "sample_x_max", data, "x_max");
            yMin = findMinValue(project, "sample_y_min", data, "y_min");
            yMax = findMinValue(project, "sample_y_max", data, "y_max");

            x = numeric.linspace(xMin, xMax);
            y = numeric.linspace(yMin, yMax);

            data.tiles.map((tile: ITileStatus) => {
                if (tile.x_index < xMin || tile.x_index > xMax) {
                    return;
                }

                if (tile.y_index < yMin || tile.y_index > yMax) {
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

                let stageText = "";
                let stageAbbr = "";

                if (displayStage) {
                    let pipelineStageIndex = pipelineIds.indexOf(displayStage.stage_id);

                    let status = displayStage.status;

                    if (pipelineStageIndex > -1) {
                        let pipelineStage = pipelineStages[pipelineStageIndex];

                        // if (useFullText) {
                        if (displayStage.depth === 1 && status === TilePipelineStatus.Waiting) {
                            stageText = "OoS";
                        } else {
                            status = (status === TilePipelineStatus.Waiting) ? TilePipelineStatus.Queued : status;
                            stageText = `${pipelineStage.name}<br>` + TilePipelineStatus[status];
                        }
                        // } else {
                        if (displayStage.depth === 1 && status === TilePipelineStatus.Waiting) {
                            stageAbbr = "";
                        } else {
                            status = (status === TilePipelineStatus.Waiting) ? TilePipelineStatus.Queued : status;
                            stageAbbr = `${pipelineStage.name.substr(0, 1)}-${TilePipelineStatus[status].substr(0, 1)}`;
                        }
                        // }
                    }
                }

                let annotation = {
                    text: stageText,
                    abbr: stageAbbr
                };

                z.push({
                    x: tile.x_index,
                    y: tile.y_index,
                    value: displayStage ? pseudoDepth : 0,
                    annotation: annotation
                })
            });
        } else {
            zMax = 1;
        }

        return {
            x: x,
            y: y,
            z: z,
            zMax: zMax,
            xRange: [xMin - 0.5, xMax + 0.5],
            yRange: [yMin - 0.5, yMax + 0.5]
        }
    };

    private chartContainer = null;

    componentDidMount() {
        this.chartContainer = Highcharts.chart("tile_map_plot", createConfig(this));
    };

    componentWillUpdate(nextProps) {
        let data = this.createFigure(nextProps);

        if (this.chartContainer) {
            if (!nextProps.loading) {
                this.chartContainer.hideLoading();
            } else {
                this.chartContainer.showLoading();
            }
        }

        let z = data.z.sort((a, b) => {
            if (a[2] === b[2]) {
                if (a[1] === b[1]) {
                    if (a[0] === b[0]) {
                        return 0;
                    } else {
                        return a[0] - b[0];
                    }
                } else {
                    return a[1] - b[1];
                }
            } else {
                return a[2] - b[2];
            }
        });

        this.chartContainer.update({
            xAxis: {
                min: data.xRange[0],
                max: data.xRange[1]
            },

            yAxis: {
                min: data.yRange[0],
                max: data.yRange[1]
            },
            colorAxis: {
                min: 0,
                max: data.zMax,
                stops: jet,
            },
        });

        if (this.chartContainer) {
            this.chartContainer.series[0].setData(z);
        }

        if (this.chartContainer.series[0].colorAxis) {
            this.chartContainer.series[0].colorAxis.update({
                max: data.zMax
            });
        }
    };

    render() {
        return (
            <div id="tile_map_plot"></div>
        );
    }

    componentDidUpdate() {
        this.chartContainer.redraw();
    }

    public onDataLabel(eventData) {
        let range = this.chartContainer.series[0].xAxis.getExtremes();

        let useFullText = (range.max - range.min) < 14;

        if (eventData.point.annotation) {
            if (useFullText) {
                return eventData.point.annotation.text;
            }
            {
                return eventData.point.annotation.abbr;
            }
        } else {
            return "";
        }
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

function createConfig(owner) {

    return {

        chart: {
            animation: true,
            type: "heatmap",
            height: 800,
            panKey: "shift",
            panning: true,
            marginTop: 10,
            marginBottom: 84,
            plotBorderWidth: 1,
            zoomType: "xy",
            events: {
                selection: function (event) {
                    // owner.onSelection(event);
                }
            },
        },

        title: {
            text: null
        },

        xAxis: {
            min: 0,
            tickInterval: 1,
            gridLineWidth: 0
        },

        yAxis: {
            title: null,
            tickInterval: 1,
            gridLineWidth: 0,
            startOnTick: false,
            endOnTick: false
        },

        colorAxis: {
            min: 0,
            max: 10,
            tickInterval: 1,
            stops: jet,
        },

        legend: {},

        tooltip: {
            // formatter: function () {
            //     return "<b>" + this.series.xAxis.categories[this.point.x] + "</b> sold <br><b>" +
            //         this.point.value + "</b> items on <br><b>" + this.series.yAxis.categories[this.point.y] + "</b>";
            // }
        },

        series: [{
            name: "Pipeline Status",
            borderWidth: 0.5,
            turboThreshold: 0,
            data: [],
            dataLabels: {
                enabled: true,
                align: "center",
                crop: true,
                color: "#000000",
                shadow: false,
                formatter: function () { // Note: arrow function would bind this to Component rather than highcharts data.
                    return owner.onDataLabel(this);
                },
                style: {
                    fontWeight: "normal",
                    textOutline: null
                },
                allowOverlap: false,
                oveflow: "none",
                verticalAlign: "middle"
            }
        }]
    };
}