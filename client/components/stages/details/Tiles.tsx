import * as React from "react";
import {Container, Menu} from "semantic-ui-react";

import {graphql} from "react-apollo";
import gql from "graphql-tag";

import {IPipelineStage} from "../../../models/pipelineStage";
import {TilesTable} from "./TilesTable";
import {
    TILE_PIPELINE_STATUS_TYPES, TilePipelineStatus,
    TilePipelineStatusType
} from "../../../models/tilePipelineStatus";
import {TilePipelineStatusSelect} from "../../helpers/TilePipelineStatusSelect";
import {PreferencesManager} from "../../../util/preferencesManager";
import {IPipelineTile} from "../../../models/pipelineTile";
import {toast} from "react-toastify";
import {TileStatusMutation} from "../../../graphql/pipelineTile";
import {toastError, toastSuccess} from "../../../util/Toasts";

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
    setTileStatus?(pipelineStageId: string, tileIds: string[], status: TilePipelineStatus): any;
}

interface ITilesTablePanelState {
}

class _TilesTablePanel extends React.Component<ITilesTablePanelProps, ITilesTablePanelState> {
    private async onResubmitTiles() {
        try {
            const result = await this.props.setTileStatus(this.props.pipelineStage.id, this.props.data.tilesForStage.items.map(t => t.relative_path), TilePipelineStatus.Incomplete);

            if (!result.data.setTileStatus) {
                toast.error(toastError("Update", result.data.setTileStatus.error), {autoClose: false});
            } else {
                toast.success(toastSuccess("Update"), {autoClose: 3000});
                this.setState({isRemoved: true});
            }
        } catch (error) {
            console.log(error);
            toast.error(toastError("Update", {name: "", message: "Tile not found"}), {autoClose: false});
        }
    }

    public render() {
        let tilesForStage = [];
        let pageCount = -1;
        let loading = true;

        if (this.props.data && this.props.data.tilesForStage) {
            tilesForStage = this.props.data.tilesForStage.items;
            loading = this.props.data.loading;
            if (this.props.data.tilesForStage.limit > 0) {
                pageCount = Math.ceil(this.props.data.tilesForStage.totalCount / this.props.data.tilesForStage.limit);
            }
        }

        return (
            <Container fluid style={{padding: "20px"}}>
                <Menu size="mini" style={{borderBottomWidth: pageCount > 0 ? "0" : "1px"}}>
                    <TilePipelineStatusSelect
                        statusTypes={TILE_PIPELINE_STATUS_TYPES}
                        selectedStatus={this.props.requestedStatus}
                        onSelectStatus={(t) => this.props.onRequestedStatusChanged(t)}/>
                    <Menu.Menu position="right">
                        <Menu.Item size="mini" content="Resubmit Page" icon="repeat"
                                   disabled={!this.props.requestedStatus.canSubmit || tilesForStage.length === 0}
                                   onClick={() => this.onResubmitTiles()}/>
                    </Menu.Menu>
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

const TilesTablePanel = graphql<any, any>(TileStatusMutation, {
    props: ({mutate}) => ({
        setTileStatus: (pipelineStageId: string, tileIds: string[], status: TilePipelineStatus) => mutate({
            variables: {pipelineStageId, tileIds, status}
        })
    })
})(_TilesTablePanel);

const TablePanelWithQuery = graphql<any, any>(TileStatusQuery, {
    options: ({pipelineStage, requestedStatus, offset, limit}) => ({
        pollInterval: 5 * 1000,
        variables: {pipelineStageId: pipelineStage.id, status: requestedStatus.option, offset, limit},
        fetchPolicy: "cache-and-network"
    })
})(TilesTablePanel);
