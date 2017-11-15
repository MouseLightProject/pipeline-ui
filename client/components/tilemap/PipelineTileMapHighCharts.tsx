import * as React from "react";
import gql from "graphql-tag";
import {graphql} from "react-apollo";

let numeric = require("numeric");

const HighCharts = require("highcharts");
require("highcharts/modules/heatmap")(HighCharts);
require("highcharts/modules/map")(HighCharts);

import {IProject} from "../../models/project";
import {TilePipelineStatus} from "../../models/tilePipelineStatus";

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

}(HighCharts));

class _TileMapPlotPanel extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            xRange: [],
            yRange: []
        };
    }

    createFigure = (props) => {
        if (!props.data || !props.data.projects) {
            return null;
        }

        let projects = props.data.projects.filter(x => x.id === props.project_id);

        let project: IProject = null;

        if (projects.length > 0) {
            project = projects[0];
        } else {
            project = null;
        }

        // let pipelineStages = props.pipelineStages;

        let pipelineIds = project.stages.map(p => p.id);

        let x = [];
        let y = [];
        let z = [];


        let xMin = 0;
        let xMax = 0;
        let yMin = 0;
        let yMax = 0;
        let zMax = 0;

        if (props.data.projectPlaneTileStatus) {
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
                    if (stage.status === TilePipelineStatus.Incomplete) {
                        // Queued or processing
                        if (depth[TileStatusSortIndex.Incomplete] === null || stage.depth < depth[TileStatusSortIndex.Incomplete].depth)
                            depth[TileStatusSortIndex.Incomplete] = stage;
                    }

                    if (stage.status > TilePipelineStatus.Incomplete && stage.status < TilePipelineStatus.Complete) {
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
                    } else if (displayStage.depth === 1 && displayStage.status === TilePipelineStatus.Incomplete) {
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
                        let pipelineStage = project.stages[pipelineStageIndex];

                        // if (useFullText) {
                        if (displayStage.depth === 1 && status === TilePipelineStatus.Incomplete) {
                            stageText = "OoS";
                        } else {
                            status = (status === TilePipelineStatus.Incomplete) ? TilePipelineStatus.Queued : status;
                            stageText = `${pipelineStage.name}<br>` + TilePipelineStatus[status];
                        }
                        // } else {
                        if (displayStage.depth === 1 && status === TilePipelineStatus.Incomplete) {
                            stageAbbr = "";
                        } else {
                            status = (status === TilePipelineStatus.Incomplete) ? TilePipelineStatus.Queued : status;
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
        this.chartContainer = HighCharts.chart("tile_map_plot", createConfig(this));
    };

    componentWillUpdate(nextProps) {
        let data = this.createFigure(nextProps);

        if (this.chartContainer) {
            if (nextProps.data && !nextProps.data.loading) {
                this.chartContainer.hideLoading();
            } else {
                this.chartContainer.showLoading("Waiting for update");
            }
        }

        if (data) {
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
        } else {
            this.chartContainer.series[0].setData([]);
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

    public onZoomIn() {
        if (!this.chartContainer.resetZoomButton) {
            this.chartContainer.showResetZoom();
        }
        this.chartContainer.mapZoom(0.5);
    }

    public onZoomOut() {
        if (!this.chartContainer.resetZoomButton) {
            this.chartContainer.showResetZoom();
        }
        this.chartContainer.mapZoom(2);
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
  projects {
    id
    name
    description
    root_path
    sample_number
    sample_x_min
    sample_x_max
    sample_y_min
    sample_y_max
    sample_z_min
    sample_z_max
    region_x_min
    region_x_max
    region_y_min
    region_y_max
    region_z_min
    region_z_max
    is_processing
    stages {
      id
      name
      depth
      previous_stage_id
      task_id
      task {
        id
        name
      }
      performance {
        id
        num_in_process
        num_ready_to_process
        num_execute
        num_complete
        num_error
        num_cancel
        cpu_average
        cpu_high
        cpu_low
        memory_average
        memory_high
        memory_low
        duration_average
        duration_high
        duration_low
      }
    }
  }
}`;
export const TileMapPlotPanel = graphql<any, any>(PipelineTileMapQuery, {
    options: ({project_id, plane}) => ({
        pollInterval: 5000,
        variables: {
            project_id: project_id,
            plane: plane
        }
    })
})(_TileMapPlotPanel);

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
            marginLeft: 30,
            marginTop: 10,
            marginBottom: 90,
            plotBorderWidth: 1,
            zoomType: "xy",
            backgroundColor: "#f4f7fa"
        },

        mapNavigation: {
            enabled: true,
            enableButtons: true,
            enableMouseWheelZoom: false,
            mouseWheelSensitivity: 1.1,
            buttons: {
                zoomIn: {
                    onclick: function (event) {
                        owner.onZoomIn(event);
                    }
                },
                zoomOut: {
                    onclick: function (event) {
                        owner.onZoomOut(event);
                    }
                }
            }
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