import * as React from "react";
import {Container, Menu} from "semantic-ui-react";
import {Query, Mutation} from "react-apollo";

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

    public render() {
        return (
            <Query query={TilesForStageQuery} fetchPolicy="cache-and-network" pollInterval={10000} ssr={false}
                   notifyOnNetworkStatusChange={false} variables={{
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
                                    <Mutation mutation={SetTileStatusMutation}>
                                        {(setTileStatus) => (
                                            <Menu.Item size="mini" content="Resubmit Page" icon="repeat"
                                                       disabled={!this.props.requestedStatus.canSubmit || (!loading && data.tilesForStage.length === 0)}
                                                       onClick={() => setTileStatus({
                                                           variables: {
                                                               pipelineStageId: this.props.pipelineStage.id,
                                                               tileIds: tilesForStage.items.map(t => t.relative_path),
                                                               status: TilePipelineStatus.Incomplete
                                                           }
                                                       })}/>
                                        )
                                        }
                                    </Mutation>
                                    <Mutation mutation={ConvertTileStatusMutation}>
                                        {(convertTileStatus) => (
                                            <Menu.Item size="mini" content="Resubmit All" icon="repeat"
                                                       disabled={!this.props.requestedStatus.canSubmit || (!loading && data.tilesForStage.length === 0)}
                                                       onClick={() => convertTileStatus({
                                                           variables: {
                                                               pipelineStageId: this.props.pipelineStage.id,
                                                               currentStatus: this.props.requestedStatus.option,
                                                               desiredStatus: TilePipelineStatus.Incomplete
                                                           }
                                                       })}/>
                                        )
                                        }
                                    </Mutation>
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
