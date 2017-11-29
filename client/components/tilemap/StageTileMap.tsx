import * as React from "react";
let numeric = require("numeric");

const HighCharts = require("highcharts");
require("highcharts/modules/heatmap")(HighCharts);
require("highcharts/modules/map")(HighCharts);

import {IProject} from "../../models/project";
import {TilePipelineStatus} from "../../models/tilePipelineStatus";
import {jet} from "../../util/colors";
import {ITileStatus} from "./Tilemaps";

enum TileStatusSortIndex {
    Incomplete = 0,
    Queued = 1,
    Complete = 2,
    Failed = 3,
}

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

interface ITileMapPlotPanelProps {
    project: IProject;
    plane: number;
    projectPlaneTileStatus: any;
}

export class TileMapPlotPanel extends React.Component<ITileMapPlotPanelProps, any> {
    constructor(props) {
        super(props);

        this.state = {
            xRange: [],
            yRange: []
        };
    }

    public createFigure(props: ITileMapPlotPanelProps) {
        if (!props.project || !props.projectPlaneTileStatus) {
            return null;
        }

        let project = props.project;

        let pipelineIds = project.stages.map(p => p.id);

        let x = [];
        let y = [];
        let z = [];

        let xMin = 0;
        let xMax = 0;
        let yMin = 0;
        let yMax = 0;
        let zMax = 0;

        if (props.projectPlaneTileStatus && props.projectPlaneTileStatus.tiles) {
            const data = props.projectPlaneTileStatus;
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

    public componentDidMount() {
        this.chartContainer = HighCharts.chart("tile_map_plot", createConfig(this));
        this.componentWillUpdate(this.props);
    };

    public componentWillUpdate(nextProps) {
        let data = this.createFigure(nextProps);

        if (this.chartContainer) {
            if (nextProps.projectPlaneTileStatus && nextProps.projectPlaneTileStatus.tiles) {
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

    public render() {
        return (
            <div id="tile_map_plot"/>
        );
    }

    public componentDidUpdate() {
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
                overflow: "none",
                verticalAlign: "middle"
            }
        }]
    };
}