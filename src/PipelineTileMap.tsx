import * as React from "react";
import gql from "graphql-tag/index";

import {Panel} from "react-bootstrap"
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

class PipelineTileMap extends React.Component<any, any> {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        let tasks = this.props.tasks;

        let pipelineStages = this.props.pipelineStages;

        let pipelineIds = pipelineStages.map(p => p.id);

        let x = [];
        let y = [];
        let z = [];
        let zmax = 0;
        let annotations = [];

        if (this.props.data && this.props.data.projectPlaneTileStatus) {
            let data = this.props.data.projectPlaneTileStatus;

            console.log(data);

            zmax = data.max_depth + 1;

            x = numeric.linspace(data.x_min, data.x_max);
            y = numeric.linspace(data.y_min, data.y_max);
            z = numeric.rep([x.length, y.length], -1);

            data.tiles.map((tile: ITileStatus) => {
                let markedStages = tile.stages.reduce((depth, stage) => {
                    if (stage.status === TilePipelineStatus.Incomplete) {
                        // Queued or processing
                        if (depth[0] === null || stage.depth < depth[0].depth)
                            depth[0] = stage;
                    }

                    if (stage.status > TilePipelineStatus.Incomplete && stage.status < TilePipelineStatus.Complete) {
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

                let stageText = "";

                if (displayStage) {
                    let pipelineStageIndex = pipelineIds.indexOf(displayStage.stage_id);

                    if (pipelineStageIndex > -1) {
                        let pipelineStage = pipelineStages[pipelineStageIndex];
                        stageText = pipelineStage.id.slice(0, 8) + "<br>";

                    }
                }

                let pseudoDepth = displayStage ? (displayStage.status === TilePipelineStatus.Complete ? displayStage.depth + 1 : (displayStage.status === TilePipelineStatus.Incomplete ? displayStage.depth - 0.5 : displayStage.depth)) : 0;


                console.log(`${tile.x_index} ${tile.y_index} ${pseudoDepth}`);
                let result = {
                    xref: 'x1',
                    yref: 'y1',
                    x: tile.x_index,
                    y: tile.y_index,
                    text: `${stageText}${pseudoDepth}`,
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
            x = numeric.linspace(0, 4);
            y = numeric.linspace(0, 6);
            z = numeric.random([5, 7], 0);
        }

        x// = x.map(v => v.toString());
        //y = y.map(v => v.toString());

        //console.log(z);

        return (
            <div>
                {this.props.loading ? <Loading/> :
                    <MapPanel xdata={x} ydata={y} zdata={z} zmax={zmax} annotations={annotations}/>}
            </div>
        );
    }
}

class MapPanel extends React.Component<any, any> {
    render() {
        return (

            <Panel collapsible defaultExpanded header="Pipeline Tile Map" bsStyle="info">
                <Plot xdata={this.props.xdata} ydata={this.props.ydata} zdata={this.props.zdata} zmax={this.props.zmax}
                      annotations={this.props.annotations}/>
            </Panel>
        );
    }
}

class Plot extends React.Component<any, any> {
    componentDidMount() {
        Plotly.newPlot('tile_map_plot', [{
            x: this.props.xdata,
            y: this.props.ydata,
            z: this.props.zdata,
            zmin: 0,
            zmax: this.props.zmax,
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
            annotations: this.props.annotations
        }, {
            displayModeBar: false
        });
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

export const PipelineTileMapWithQuery = graphql(PipelineTileMapQuery, {
    options: ({project_id, plane}) => ({
        pollInterval: 5000,
        variables: {
            project_id: project_id,
            plane: plane
        }
    })
})(PipelineTileMap);