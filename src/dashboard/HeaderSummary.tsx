import * as React from "react";
import gql from "graphql-tag/index";
import graphql from "react-apollo/graphql";
import {Grid, Row, Col, Clearfix} from "react-bootstrap";
import * as moment from "moment";
import * as Radium from "radium";

import {IColumnLayout} from "../helpers/BootstrapUtils";
import {calculateDurationFromNow} from "../helpers/DateUtils";
import {Loading} from "../Loading";
import {IWorker, IProject, PipelineWorkerStatus} from "../QueryInterfaces";
import {ICountTileProps, CountTile, CountUnit} from "./CountTile";
import {NavTile} from "./NavTile";
import isValidElement = React.isValidElement;

// const HighCharts = require("highcharts");

const fullTextVisibilityStyle = {
    display: "none",

    "@media (min-width:992px)": {
        display: "block",
    }
};

const abbrevTextVisibilityStyle = {
    display: "none",

    "@media (min-width:767px) and (max-width:991px)": {
        display: "block",
    }
};

@Radium
class HeaderSummary extends React.Component<any, any> {
    private getAbbreviatedComponent(isNavTile: boolean) {
        if (isNavTile) {
            return ( <div style={isNavTile ? abbrevTextVisibilityStyle : {}}>
                <AbbreviatedTextSummary data={this.props.data} isNavTile={isNavTile}/>
            </div>);
        } else {
            return null;
        }
    }

    public render() {
        const isLoading = !this.props.data || this.props.data.loading;

        const isNavTile = this.props.isNavTile || false;

        if (isLoading) {
            return (<Loading/>);
        } else {
            return (
                <div>
                    {this.getAbbreviatedComponent(isNavTile)}
                    <div style={isNavTile ? fullTextVisibilityStyle : {}}>
                        <Grid fluid>
                            <FullTextSummary data={this.props.data} isNavTile={isNavTile}/>
                        </Grid>
                    </div>
                </div>
            );
        }
    }
}

const tileCountStyle = {
    marginBottom: "0px",
    marginTop: "0px",
    visibility: "visible",
};

interface ICumulativeStats {
    inProcess: number;
    toProcess: number;
    complete: number;
    errors: number;
}

interface ITextSummaryState {
    columnLayout?: IColumnLayout;
}

const NavTileColumnLayout: IColumnLayout = {
    lg: 2,
    md: 2,
    sm: 2,
    xs: 2
};

const DefaultTileColumnLayout: IColumnLayout = {
    lg: 2,
    md: 4,
    sm: 6,
    xs: 12
};

class AbstractSummary<P, S> extends React.Component<P, S> {
    protected buildWorkersProps(workers: IWorker[]): ICountTileProps {
        const now = new Date();

        let lastSeen = null;
        let maxElapsed = Infinity;

        let onlineWorkerCount = workers.filter(worker => {
            const elapsedTime = moment(now).subtract(worker.last_seen).minutes();

            if (elapsedTime > 2) {
                if (!lastSeen || elapsedTime < maxElapsed) {
                    lastSeen = worker.last_seen
                }
                return false;
            }

            return true;
        }).length;

        const duration = lastSeen ? calculateDurationFromNow(lastSeen.valueOf()) : null;

        const message = duration ? `${workers.length - onlineWorkerCount} missing ${duration.humanize(false)}` : "";

        return {
            title: "Workers Online",
            count: onlineWorkerCount,
            message: message
        }
    }

    protected buildWorkerLoadProps(workers: IWorker[]): ICountTileProps {
        let capacity = 0;
        let load = 0;

        workers.forEach(worker => {
            capacity += worker.work_unit_capacity;

            if (worker.status !== PipelineWorkerStatus.Unavailable && worker.task_load >= 0) {
                load += worker.task_load;
            }
        });

        return {
            title: "Worker Load",
            count: 100 * load / capacity,
            units: CountUnit.Percent,
            precision: 1,
            message: ``
        }
    }

    protected buildPipelineProps(projects: IProject[]): ICountTileProps {
        let activeCount = projects.filter(project => {
            return project.is_processing;
        }).length;

        return {
            title: "Active Pipelines",
            count: activeCount,
            message: `${projects.length - activeCount} idle`
        }
    }

    protected buildStageStats(projects: IProject[]): ICumulativeStats {
        let stats: ICumulativeStats = {
            inProcess: 0,
            toProcess: 0,
            complete: 0,
            errors: 0
        };

        return projects.map(project => project.stages)
        .reduce((prev, arrStages) => prev.concat(arrStages), [])
        .reduce((previous, stage) => {
            previous.inProcess += stage.performance.num_in_process;
            previous.toProcess += stage.performance.num_ready_to_process;
            previous.complete += stage.performance.num_complete;
            previous.errors += stage.performance.num_error;

            return previous;
        }, stats);
    }

    protected buildStageInProcessProps(stats: ICumulativeStats) {
        return {
            title: "Processing",
            count: stats.inProcess,
            message: ``
        }
    }

    protected buildStageToProcessProps(stats: ICumulativeStats) {
        return {
            title: "Queued",
            count: stats.toProcess,
            message: ``
        }
    }

    protected buildStageCompleteProps(stats: ICumulativeStats) {
        return {
            title: "Complete",
            count: stats.complete,
            message: `${stats.errors} errors`
        }
    }
}

class AbbreviatedTextSummary extends AbstractSummary<any, ITextSummaryState> {
    public render() {

        let Component = this.props.isNavTile ? NavTile : CountTile;

        const cumulativeStats = this.buildStageStats(this.props.data.projects);

        return (
            <table style={tileCountStyle}>
                <tbody>
                <tr>
                    <td className="tile_stat">
                        <Component {...this.buildWorkerLoadProps(this.props.data.pipelineWorkers)}/>
                    </td>
                    <td className="tile_stat">
                        <Component {...this.buildStageInProcessProps(cumulativeStats)}/>
                    </td>
                    <td className="tile_stat">
                        <Component {...this.buildStageToProcessProps(cumulativeStats)}/>
                    </td>
                </tr>
                </tbody>
            </table>
        );
    }
}

class FullTextSummary extends AbstractSummary<any, ITextSummaryState> {
    public constructor(props) {
        super(props);

        this.state = {
            columnLayout: NavTileColumnLayout
        }
    }

    public render() {

        let Component = this.props.isNavTile ? NavTile : CountTile;

        const cumulativeStats = this.buildStageStats(this.props.data.projects);

        const layout = this.state.columnLayout;

        return (
            <Row style={tileCountStyle}>
                <Col lg={layout.lg} md={layout.md} sm={layout.sm} xs={layout.xs} className="tile_stat">
                    <Component {...this.buildWorkersProps(this.props.data.pipelineWorkers)}/>
                </Col>
                <Col lg={layout.lg} md={layout.md} sm={layout.sm} xs={layout.xs} className="tile_stat">
                    <Component {...this.buildWorkerLoadProps(this.props.data.pipelineWorkers)}/>
                </Col>
                <Col lg={layout.lg} md={layout.md} sm={layout.sm} xs={layout.xs} className="tile_stat">
                    <Component {...this.buildPipelineProps(this.props.data.projects)}/>
                </Col>
                <Col lg={layout.lg} md={layout.md} sm={layout.sm} xs={layout.xs} className="tile_stat">
                    <Component {...this.buildStageInProcessProps(cumulativeStats)}/>
                </Col>
                <Clearfix visibleSmBlock/>
                <Col lg={layout.lg} md={layout.md} sm={layout.sm} xs={layout.xs} className="tile_stat">
                    <Component {...this.buildStageToProcessProps(cumulativeStats)}/>
                </Col>
                <Col lg={layout.lg} md={layout.md} sm={layout.sm} xs={layout.xs} className="tile_stat">
                    <Component {...this.buildStageCompleteProps(cumulativeStats)}/>
                </Col>
            </Row>
        );
    }

    public componentDidMount() {
        this.setState({columnLayout: this.props.isNavTile ? NavTileColumnLayout : DefaultTileColumnLayout}, null);
    }
}

const HeaderSummaryQuery = gql`query {
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
  pipelineWorkers {
    id
    name
    machine_id
    work_unit_capacity
    last_seen
    task_load
    status
  }
}`;

export const HeaderSummaryWithQuery = graphql(HeaderSummaryQuery, {
    options: {
        pollInterval: 5 * 1000
    }
})(HeaderSummary);


/*
 class DonutSummary extends React.Component<any, any> {
 render() {
 const hStyle = {display: "inline", fontWeight: 800};

 const gridStyle = {textAlign: "center", maxWidth: "250px"};

 return (
 <Row>
 <Col lg={3} md={6} sm={12}>
 <Panel style={gridStyle}>
 <div className="count">3</div>
 <span> of 4 workers available (75%)</span>
 <WorkerSummaryWithQuery plotId="pies_status_1"/>
 <span>Last lost worker 20 minutes ago</span>
 </Panel>
 </Col>
 <Col lg={3} md={6} sm={12}>
 <Panel style={gridStyle}>
 <h1 style={hStyle}>1</h1><span> of 3 pipelines processing (33%)</span>
 <WorkerSummaryWithQuery plotId="pies_status_2"/>
 <span>Last lost worker 20 minutes ago</span>
 </Panel>
 </Col>
 <Col lg={3} md={6} sm={12}>
 <Panel style={gridStyle}>
 <h1 style={hStyle}>20</h1><span> of 30 tiles blocked (66%)</span>
 <WorkerSummaryWithQuery plotId="pies_status_3"/>
 <span>in 5 active stages</span>
 </Panel>
 </Col>
 <Col lg={3} md={6} sm={12}>
 <Panel style={gridStyle}>
 <h1 style={hStyle}>3</h1><span> of 4 workers available (100%)</span>
 <WorkerSummaryWithQuery plotId="pies_status_4"/>
 <span>Last lost worker 20 minutes ago</span>
 </Panel>
 </Col>
 </Row>
 );
 }
 }


 class WorkerSummary extends React.Component<any, any> {
 private chartContainer = null;

 constructor(props) {
 super(props);

 this.state = {};
 }

 componentDidMount() {
 this.chartContainer = HighCharts.chart(this.props.plotId, createConfig(this));
 };

 render() {
 return (
 <div id={this.props.plotId}></div>
 );
 }

 componentWillUpdate(nextProps) {
 // Update charts
 }

 componentDidUpdate() {
 this.chartContainer.redraw();
 }
 }

 HighCharts.getOptions().colors = HighCharts.map(HighCharts.getOptions().colors, function (color) {
 return {
 radialGradient: {
 cx: 0.5,
 cy: 0.3,
 r: 0.7
 },
 stops: [
 [0, color],
 [1, HighCharts.Color(color).brighten(-0.3).get('rgb')] // darken
 ]
 };
 });

 function createConfig(owner) {
 return {

 chart: {
 animation: true,
 type: "pie",
 height: 100
 },

 legend: {},

 plotOptions: {
 pie: {
 dataLabels: {
 enabled: false
 ,
 },
 startAngle: -160,
 endAngle: 160
 }
 },

 title: {
 text: null
 },

 series: [{
 name: "Workers",
 innerSize: "50%",
 data: [["Available", 2], ["Unavailable", 1]]
 }]
 };
 }
 */