import * as React from "react";
import {Pagination, ControlLabel, Row, Col} from "react-bootstrap"

import {graphql} from "react-apollo";
import gql from "graphql-tag";

import {ITaskExecution} from "../../../models/taskExecution";
import {IPipelineStage} from "../../../models/pipelineStage";
import {TilesTable} from "./TilesTable";
import {
    TILE_PIPELINE_STATUS_FAILED, TILE_PIPELINE_STATUS_TYPES,
    TilePipelineStatusType
} from "../../../models/tilePipelineStatus";
import {TilePipelineStatusSelect} from "../../helpers/TilePipelineStatusSelect";

export interface ITilesPage {
    offset: number;
    limit: number;
    totalCount: number;
    hasNextPage: boolean;
    items: ITaskExecution[]
}

interface ITilesProps {
    pipelineStage: IPipelineStage;
}

interface ITilesState {
    offset?: number;
    limit?: number;
    totalCount?: number;
    requestedOffset?: number;
    requestedStatus?: TilePipelineStatusType;
}

export class Tiles extends React.Component<ITilesProps, ITilesState> {
    public constructor(props: any) {
        super(props);

        this.state = {
            offset: 0,
            limit: 20,
            totalCount: -1,
            requestedOffset: 0,
            requestedStatus: TILE_PIPELINE_STATUS_FAILED
        }
    }

    private onTilePipelineStatusTypeChanged(t: TilePipelineStatusType) {
        this.setState({requestedStatus: t});
    }

    private updateOffset(offset: number) {
        if (offset != this.state.requestedOffset) {
            this.setState({requestedOffset: offset});
        }
    }

    private updateCursor(page: ITilesPage) {
        if (page.offset !== this.state.offset || page.limit !== this.state.limit || page.totalCount !== this.state.totalCount) {
            this.setState({
                offset: page.offset,
                limit: page.limit,
                totalCount: page.totalCount
            });
        }
    }

    public render() {
        return (
            <div>
                <TablePanelWithQuery pipelineStage={this.props.pipelineStage}
                                     offset={this.state.offset}
                                     limit={this.state.limit}
                                     totalCount={this.state.totalCount}
                                     requestedOffset={this.state.requestedOffset}
                                     requestedStatus={this.state.requestedStatus}
                                     onUpdateOffset={(offset: number) => this.updateOffset(offset)}
                                     onCursorChanged={(page: ITilesPage) => this.updateCursor(page)}
                                     onRequestedStatusChanged={(t: TilePipelineStatusType) => this.onTilePipelineStatusTypeChanged(t)}/>
            </div>
        );
    }
}


interface ITilesTablePanelProps {
    data?: any;

    pipelineStage: IPipelineStage;

    offset: number;
    limit: number;
    totalCount: number;
    requestedOffset: number;
    requestedStatus?: TilePipelineStatusType;

    onUpdateOffset(offset: number): void;
    onCursorChanged(page: ITilesPage): void;
    onRequestedStatusChanged(t: TilePipelineStatusType): void;
}

interface ITilesTablePanelState {
}

class TablePanel extends React.Component<ITilesTablePanelProps, ITilesTablePanelState> {
    private onTilePipelineStatusTypeChanged(t: TilePipelineStatusType) {
        this.props.onRequestedStatusChanged(t);
    }

    public render() {
        let tilesForStage = [];

        if (this.props.data && this.props.data.tilesForStage) {
            tilesForStage = this.props.data.tilesForStage.items;
        }

        const pageCount = Math.ceil(this.props.totalCount / this.props.limit);

        const activePage = this.props.offset ? (Math.floor(this.props.offset / this.props.limit) + 1) : 1;

        return (
            <div>
                <div style={{padding: "10px"}}>
                    <Row>
                        <Col xs={2}>
                            <ControlLabel>Status</ControlLabel>
                            <TilePipelineStatusSelect idName="filter-mode"
                                                      options={TILE_PIPELINE_STATUS_TYPES}
                                                      placeholder="required"
                                                      clearable={false}
                                                      selectedOption={this.props.requestedStatus}
                                                      onSelect={(v: TilePipelineStatusType) => this.onTilePipelineStatusTypeChanged(v)}/>
                        </Col>
                    </Row>
                </div>
                {pageCount > 1 ?
                    <Pagination prev next first last ellipsis boundaryLinks items={pageCount} maxButtons={10}
                                activePage={activePage}
                                onSelect={(page: any) => {
                                    this.props.onUpdateOffset(this.props.limit * (page - 1))
                                }}/> : null}
                {tilesForStage.length === 0 ? <NoTasks/> :
                    <TilesTable pipelineStage={this.props.pipelineStage} tiles={tilesForStage}
                                canSubmit={this.props.requestedStatus.canSubmit}/>}
            </div>
        );
    }

    public componentWillReceiveProps(nextProps: any) {
        if (nextProps.data && nextProps.data.tilesForStage) {
            nextProps.onCursorChanged(nextProps.data.tilesForStage);
        }
    }
}

class NoTasks extends React.Component
    <any, any> {
    public render() {
        return (<div style={{padding: "10px"}}> There are no tiles with this status.</div>);
    }
}

const TileStatusQuery = gql`query($pipelineStageId: String, $status: Int, $offset: Int, $limit: Int) {
        tilesForStage(pipelineStageId: $pipelineStageId, status: $status, offset: $offset, limit: $limit) {
            offset
            limit
            totalCount
            hasNextPage
            items {
            relative_path
            lat_x
            lat_y
            lat_z
        }
    }
}`;

const TablePanelWithQuery = graphql(TileStatusQuery, {
    options: ({pipelineStage, requestedStatus, requestedOffset, limit}) => ({
        pollInterval: 10 * 1000,
        variables: {pipelineStageId: pipelineStage.id, status: requestedStatus.option, offset: requestedOffset, limit}
    })
})(TablePanel);
