import * as React from "react";
import {Container, Menu} from "semantic-ui-react";

import {graphql} from "react-apollo";
import gql from "graphql-tag";

import {IPipelineStage} from "../../../models/pipelineStage";
import {TilesTable} from "./TilesTable";
import {
    TILE_PIPELINE_STATUS_TYPES,
    TilePipelineStatusType
} from "../../../models/tilePipelineStatus";
import {TilePipelineStatusSelect} from "../../helpers/TilePipelineStatusSelect";
import {PreferencesManager} from "../../../util/preferencesManager";

interface ITilesProps {
    pipelineStage: IPipelineStage;
}

interface ITilesState {
    offset?: number;
    limit?: number;
    requestedStatus?: TilePipelineStatusType;
}

export class Tiles extends React.Component<ITilesProps, ITilesState> {
    public constructor(props: any) {
        super(props);

        this.state = {
            offset: 0,
            limit: 20,
            requestedStatus: TilePipelineStatusType.fromStatus(PreferencesManager.Instance.TilePipelineStatus)
        }
    }

    private onTilePipelineStatusTypeChanged(t: TilePipelineStatusType) {
        PreferencesManager.Instance.TilePipelineStatus = t.option;

        this.setState({requestedStatus: t});
    }

    private updateCursor(page: number, pageSize: number) {
        const offset = page * pageSize;
        if (offset !== this.state.offset || pageSize !== this.state.limit) {
            this.setState({
                offset,
                limit: pageSize
            });
      }
    }

    public render() {

        return (
            <TablePanelWithQuery pipelineStage={this.props.pipelineStage}
                                 requestedStatus={this.state.requestedStatus}
                                 offset={this.state.offset}
                                 limit={this.state.limit}
                                 onCursorChanged={(page: number, pageSize: number) => this.updateCursor(page, pageSize)}
                                 onRequestedStatusChanged={(t: TilePipelineStatusType) => this.onTilePipelineStatusTypeChanged(t)}/>
        );
    }
}


interface ITilesTablePanelProps {
    data?: any;
    offset: number;
    limit: number;
    pipelineStage: IPipelineStage;
    requestedStatus?: TilePipelineStatusType;

    onCursorChanged(page: number, pageSize: number): void;
    onRequestedStatusChanged(t: TilePipelineStatusType): void;
}

interface ITilesTablePanelState {
}

class TilesTablePanel extends React.Component<ITilesTablePanelProps, ITilesTablePanelState> {
    public render() {
        let tilesForStage = [];
        let pageCount = -1;
        let page = 0;
        let loading = true;

        if (this.props.data && this.props.data.tilesForStage) {
            tilesForStage = this.props.data.tilesForStage.items;
            loading = this.props.data.loading;
            if (this.props.data.tilesForStage.limit > 0) {
                pageCount = Math.ceil(this.props.data.tilesForStage.totalCount / this.props.data.tilesForStage.limit);
                page = Math.ceil(this.props.offset / this.props.data.tilesForStage.limit);
            }
        }

        return (
            <Container fluid style={{padding: "20px"}}>
                <Menu size="mini" style={{borderBottom: "none"}}>
                    <TilePipelineStatusSelect
                        statusTypes={TILE_PIPELINE_STATUS_TYPES}
                        selectedStatus={this.props.requestedStatus}
                        onSelectStatus={(t) => this.props.onRequestedStatusChanged(t)}/>
                </Menu>
                <TilesTable pipelineStage={this.props.pipelineStage}
                            tiles={tilesForStage}
                            canSubmit={this.props.requestedStatus.canSubmit}
                            loading={loading}
                            pageCount={pageCount}
                            onCursorChanged={this.props.onCursorChanged}
            />
            </Container>
        );
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

const TablePanelWithQuery = graphql<any, any>(TileStatusQuery, {
    options: ({pipelineStage, requestedStatus, offset, limit}) => ({
        pollInterval: 10 * 1000,
        variables: {pipelineStageId: pipelineStage.id, status: requestedStatus.option, offset, limit}
    })
})(TilesTablePanel);
