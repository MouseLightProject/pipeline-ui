import * as React from "react";
import {Container, Menu} from "semantic-ui-react";
import {Query} from "react-apollo";

import {IPipelineStage} from "../../../models/pipelineStage";
import {TilesTable} from "./TilesTable";
import {
    TILE_PIPELINE_STATUS_TYPES, TilePipelineStatus,
    TilePipelineStatusType
} from "../../../models/tilePipelineStatus";
import {TilePipelineStatusSelect} from "../../helpers/TilePipelineStatusSelect";
import {PreferencesManager} from "../../../util/preferencesManager";
import {toast} from "react-toastify";
import {ConvertTileStatusMutation, SetTileStatusMutation, TilesForStageQuery} from "../../../graphql/pipelineTile";
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
            limit: PreferencesManager.Instance.StageDetailsPageSize,
            requestedStatus: TilePipelineStatusType.fromStatus(PreferencesManager.Instance.TilePipelineStatus)
        }
    }

    private onTilePipelineStatusTypeChanged(t: TilePipelineStatusType) {
        PreferencesManager.Instance.TilePipelineStatus = t.option;

        this.setState({requestedStatus: t});
    }

    private updateCursor(page: number, pageSize: number) {
        const offset = page * pageSize;

        if (offset !== this.state.offset) {
            this.setState({
                offset,
            });
        }
        if (pageSize !== this.state.limit && !isNaN(pageSize)) {
            PreferencesManager.Instance.StageDetailsPageSize = pageSize;
            this.setState({
                limit: pageSize
            });
        }
    }

    public render() {
        return (
            <TilesTablePanel pipelineStage={this.props.pipelineStage}
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
    convertTileStatus?(pipelineStageId: string, currentStatus: TilePipelineStatus, desiredStatus: TilePipelineStatus): any;
}

interface ITilesTablePanelState {
    isRemoved?: boolean;
}

class TilesTablePanel extends React.Component<ITilesTablePanelProps, ITilesTablePanelState> {
    public constructor(props: ITilesTablePanelProps) {
        super(props);

        this.state = {
            isRemoved: false
        }
    }

    private async onResubmitTiles() {
        try {
            const result = await this.props.setTileStatus(this.props.pipelineStage.id, this.props.data.tilesForStage.items.map(t => t.relative_path), TilePipelineStatus.Incomplete);

            if (!result.data.setTileStatus) {
                toast.error(toastError("Submit", result.data.setTileStatus.error), {autoClose: false});
            } else {
                toast.success(toastSuccess("Submit"), {autoClose: 3000});
                this.setState({isRemoved: true});
            }
        } catch (error) {
            console.log(error);
            toast.error(toastError("Submit", {name: "", message: "One or more tiles not found"}), {autoClose: false});
        }
    }

    private async onResubmitAllTiles() {
        try {
            const result = await this.props.convertTileStatus(this.props.pipelineStage.id, this.props.requestedStatus.option, TilePipelineStatus.Incomplete);

            if (!result.data.convertTileStatus) {
                toast.error(toastError("Submit", result.data.convertTileStatus.error), {autoClose: false});
            } else {
                toast.success(toastSuccess("Submit"), {autoClose: 3000});
                this.setState({isRemoved: true});
            }
        } catch (error) {
            console.log(error);
            toast.error(toastError("Update", {name: "", message: "Could not change tile status"}), {autoClose: false});
        }
    }

    public render() {
        return (
            <Query query={TilesForStageQuery} fetchPolicy="cache-and-network" pollInterval={5000} variables={{
                pipelineStageId: this.props.pipelineStage.id,
                status: this.props.requestedStatus.option,
                offset: this.props.offset,
                limit: this.props.limit
            }}>
                {({loading, error, data}) => {
                    let tilesForStage = null;
                    let pageCount = -1;

                    if (!loading && !error) {
                        tilesForStage = data.tilesForStage.items;
                        if (data.tilesForStage.totalCount > 0 && data.tilesForStage.limit > 0) {
                            pageCount = Math.ceil(data.tilesForStage.totalCount / data.tilesForStage.limit);
                        }
                    }

                    return (
                        <Container fluid style={{padding: "20px"}}>
                            <Menu size="mini" style={{borderBottomWidth: "1px"}}>
                                <TilePipelineStatusSelect
                                    statusTypes={TILE_PIPELINE_STATUS_TYPES}
                                    selectedStatus={this.props.requestedStatus}
                                    onSelectStatus={(t) => this.props.onRequestedStatusChanged(t)}/>
                                <Menu.Menu position="right">
                                    <Menu.Item size="mini" content="Resubmit Page" icon="repeat"
                                               disabled={!this.props.requestedStatus.canSubmit || (!loading && data.tilesForStage.length === 0)}
                                               onClick={() => this.onResubmitTiles()}/>
                                    <Menu.Item size="mini" content="Resubmit All" icon="repeat"
                                               disabled={!this.props.requestedStatus.canSubmit || (!loading && data.tilesForStage.length === 0)}
                                               onClick={() => this.onResubmitAllTiles()}/>
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
            </Query>
        );
    }
}

/* TODO
const _TilesTablePanel = graphql<any, any>(SetTileStatusMutation, {
    props: ({mutate}) => ({
        setTileStatus: (pipelineStageId: string, tileIds: string[], status: TilePipelineStatus) => mutate({
            variables: {pipelineStageId, tileIds, status}
        })
    })
})(__TilesTablePanel);

const TilesTablePanel = graphql<any, any>(ConvertTileStatusMutation, {
    props: ({mutate}) => ({
        convertTileStatus: (pipelineStageId: string, currentStatus: TilePipelineStatus, desiredStatus: TilePipelineStatus) => mutate({
            variables: {pipelineStageId, currentStatus, desiredStatus}
        })
    })
})(_TilesTablePanel);
*/