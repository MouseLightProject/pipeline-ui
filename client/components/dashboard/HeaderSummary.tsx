import * as React from "react";

import {Container, Statistic, Icon, Loader, Menu, Header, Message, SemanticWIDTHS} from "semantic-ui-react";
import * as moment from "moment";
import pluralize = require("pluralize");

import {IColumnLayout} from "../../util/bootstrapUtils";
import {calculateDurationFromNow} from "../../util/dateUtils";
import {ICountTileProps, CountTile, CountUnit} from "./CountTile";
import {NavTile} from "./NavTile";
import {IProject} from "../../models/project";
import {IWorker, PipelineWorkerStatus} from "../../models/worker";
import {themeHighlight} from "../../util/styleDefinitions";
import {IPipelineStageTileStatus} from "../../models/pipelineStage";
import {StatisticSizeProp} from "semantic-ui-react/dist/commonjs/views/Statistic/Statistic";

const visibility: "visible" = "visible";

const tileCountStyle = {
    marginBottom: "0px",
    marginTop: "0px",
    visibility,
    maxWidth: "750px"
};

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

            if (worker.status == PipelineWorkerStatus.Unavailable || elapsedTime > 2) {
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
            capacity += worker.local_work_capacity + worker.cluster_work_capacity;

            if (worker.status !== PipelineWorkerStatus.Unavailable) {
                if (worker.local_task_load >= 0) {
                    load += worker.local_task_load;
                }
                if (worker.cluster_task_load >= 0) {
                    load += worker.cluster_task_load;
                }
            }
        });

        return {
            title: "Worker Load",
            count: capacity !== 0 ? 100 * load / capacity : 0,
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

    protected buildStageStats(projects: IProject[]): IPipelineStageTileStatus {
        let stats: IPipelineStageTileStatus = {
            incomplete: 0,
            processing: 0,
            queued: 0,
            complete: 0,
            failed: 0,
            canceled: 0
        };

        return projects.map(project => project.stages)
            .reduce((prev, arrStages) => prev.concat(arrStages), [])
            .reduce((previous, stage) => {
                if (stage.is_processing && stage.tile_status) {
                    previous.incomplete += stage.tile_status.incomplete;
                    previous.processing += stage.tile_status.processing;
                    previous.queued += stage.tile_status.queued;
                    previous.complete += stage.tile_status.complete;
                    previous.failed += stage.tile_status.failed;
                    previous.canceled += stage.tile_status.canceled;
                }

                return previous;
            }, stats);
    }

    protected buildStageInProcessProps(stats: IPipelineStageTileStatus) {
        return {
            title: "Processing",
            count: stats.processing,
            message: ``
        }
    }

    protected buildStageToProcessProps(stats: IPipelineStageTileStatus) {
        return {
            title: "Queued",
            count: stats.queued,
            message: ``
        }
    }

    protected buildStageCompleteProps(stats: IPipelineStageTileStatus) {
        return {
            title: "Complete",
            count: stats.complete,
            message: `${stats.failed} errors`
        }
    }
}

class AbbreviatedTextSummary extends AbstractSummary<any, ITextSummaryState> {
    public render() {
        let Component = this.props.isNavTile ? NavTile : CountTile;

        const cumulativeStats = this.buildStageStats(this.props.projects);

        return (
            <table style={tileCountStyle}>
                <tbody>
                <tr>
                    <td className="tile_stat">
                        <Component {...this.buildWorkerLoadProps(this.props.workers)}/>
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

interface IFullTextSummaryProps {
    projects: IProject[];
    workers: IWorker[];
    isNavTile: boolean;
    size: StatisticSizeProp;
    width: SemanticWIDTHS;
    inverted: boolean;
}

interface IFullTextSummaryState {
    columnLayout: any;
}

class FullTextSummary extends AbstractSummary<IFullTextSummaryProps, IFullTextSummaryState> {
    public constructor(props) {
        super(props);

        this.state = {
            columnLayout: NavTileColumnLayout
        }
    }

    public componentDidMount() {
        this.setState({columnLayout: this.props.isNavTile ? NavTileColumnLayout : DefaultTileColumnLayout}, null);
    }

    public render() {
        const workers = this.buildWorkersProps(this.props.workers);
        const pipelineProps = this.buildPipelineProps(this.props.projects);
        const cumulativeStats = this.buildStageStats(this.props.projects);

        return (
            <Statistic.Group widths={this.props.width} size={this.props.size} inverted={this.props.inverted}>
                <Statistic>
                    <Statistic.Value>
                        <Icon name="server" size="mini"/>
                        &nbsp;{workers.count}
                    </Statistic.Value>
                    <Statistic.Label>{pluralize("Worker", workers.count)} Online</Statistic.Label>
                </Statistic>
                <Statistic>
                    <Statistic.Value>
                        {this.buildWorkerLoadProps(this.props.workers).count.toFixed(1) + "%"}
                    </Statistic.Value>
                    <Statistic.Label>Load</Statistic.Label>
                </Statistic>
                <Statistic>
                    <Statistic.Value>
                        <Icon name="cube" size="mini"/>
                        &nbsp;{pipelineProps.count}
                    </Statistic.Value>
                    <Statistic.Label>Active {pluralize("Pipeline", pipelineProps.count)} </Statistic.Label>
                </Statistic>
                <Statistic>
                    <Statistic.Value>
                        <Icon name="spinner" size="mini"/>
                        &nbsp;{this.buildStageInProcessProps(cumulativeStats).count}
                    </Statistic.Value>
                    <Statistic.Label>Processing</Statistic.Label>
                </Statistic>
                <Statistic>
                    <Statistic.Value>
                        <Icon name="wait" size="mini"/>
                        &nbsp;{this.buildStageToProcessProps(cumulativeStats).count}
                    </Statistic.Value>
                    <Statistic.Label>Queued</Statistic.Label>
                </Statistic>
                <Statistic>
                    <Statistic.Value>
                        <Icon name="checkmark" size="mini"/>
                        &nbsp;{this.buildStageCompleteProps(cumulativeStats).count}
                    </Statistic.Value>
                    <Statistic.Label>Complete</Statistic.Label>
                </Statistic>
            </Statistic.Group>
        );
    }
}

interface IHeaderSummaryProps {
    projects: IProject[];
    workers: IWorker[];
    isNavTile: boolean;
}

interface IHeaderSummaryState {
}

export class HeaderSummary extends React.Component<IHeaderSummaryProps, IHeaderSummaryState> {
    private getAbbreviatedComponent(isNavTile: boolean) {
        return (
            <div>
                <AbbreviatedTextSummary {...this.props} isNavTile={isNavTile}/>
            </div>
        );
    }

    public render() {
        const isNavTile = this.props.isNavTile || false;

        if (isNavTile) {
            return (
                <div style={{color: "white"}}>
                    {this.getAbbreviatedComponent(isNavTile)}
                </div>
            );
        } else {
            return (
                <Container fluid>
                    <Menu style={{borderTop: "none", borderLeft: "none", borderRight: "none", borderRadius: 0, boxShadow: "none", marginBottom: "15px"}}>
                        <Menu.Header>
                            <div style={{
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                paddingLeft: "10px",
                                paddingRight: "10px",
                                paddingTop: "4px"
                            }}>
                                <Header style={{color: themeHighlight}}>
                                    Activity
                                </Header>
                            </div>
                        </Menu.Header>
                    </Menu>
                    <Container fluid style={{padding: "20px"}}>
                        <FullTextSummary {...this.props} size="small" width={3} inverted={false}/>
                    </Container>
                </Container>
            );
        }
    }
}
