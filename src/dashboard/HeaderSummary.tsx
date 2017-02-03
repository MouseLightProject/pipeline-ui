import * as React from "react";
import gql from "graphql-tag/index";
import graphql from "react-apollo/graphql";
import {Grid, Row, Col, Panel} from "react-bootstrap";

import * as moment from "moment";
import {WorkersOnlineTile, IWorkersOnlineTileProps} from "./WorkersOnlineTile";
import {Loading} from "../Loading";
import {IWorker} from "../QueryInterfaces";
import {calculateDurationFromNow} from "../helpers/Utils";
import {ICountTileProps, CountTile} from "./CountTile";
// const HighCharts = require("highcharts");

const lgCol = 2;
const mdCol = 4;
const smCol = 6;
const xsCol = 12;

class HeaderSummary extends React.Component<any, any> {
    render() {
        const isLoading = !this.props.data || this.props.data.loading;

        if (isLoading) {
            return (<Loading/>);
        } else {
            return (
                <Grid fluid>
                    <TextSummary data={this.props.data}/>
                </Grid>
            );
        }
    }
}

const tileCountStyle = {
    marginBottom: "20px",
    marginTop: "20px"
};

class TextSummary extends React.Component<any, any> {
    public constructor(props) {
        super(props);
    }

    private buildWorkersProps(workers: IWorker[]): ICountTileProps {
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

    public render() {
        console.log(this.props);

        const workerProps = this.buildWorkersProps(this.props.data.pipelineWorkers);

        return (
            <Row style={tileCountStyle}>
                <Col lg={lgCol} md={mdCol} sm={smCol} xs={xsCol} className="tile_stat">
                    <CountTile {...workerProps}/>
                </Col>
            </Row>
        );
    }
}

const HeaderSummaryQuery = gql`query { 
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