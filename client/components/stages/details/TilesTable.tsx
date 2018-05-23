import * as React from "react";
import {Button} from "semantic-ui-react";
import ReactTable from "react-table";
import {toast} from "react-toastify";

import {IPipelineTile} from "../../../models/pipelineTile";
import {IPipelineStage} from "../../../models/pipelineStage";
import {TilePipelineStatus} from "../../../models/tilePipelineStatus";
import {toastError, toastSuccess} from "../../../util/Toasts";
import {PreferencesManager} from "../../../util/preferencesManager";
import {SetTileStatusMutation} from "../../../graphql/pipelineTile";


interface ITilesTableProps {
    style?: any;
    pipelineStage: IPipelineStage;
    tiles: IPipelineTile[];
    canSubmit: boolean;
    loading: boolean;
    pageCount: number;

    onCursorChanged(page: number, pageSize: number): void;
    setTileStatus?(pipelineStageId: string, tileIds: string[], status: TilePipelineStatus): any;
}

interface ITilesTableState {
    cachedTiles?: IPipelineTile[];
    cachedPageCount?: number;
    isRemoved: boolean;
}

export class TilesTable extends React.Component<ITilesTableProps, ITilesTableState> {
    public constructor(props: ITilesTableProps) {
        super(props);

        this.state = {
            cachedTiles: [],
            cachedPageCount: -1,
            isRemoved: false
        }
    }

    private async onResubmitTile(tile: IPipelineTile) {
        try {
            const result = await this.props.setTileStatus(this.props.pipelineStage.id, [tile.relative_path], TilePipelineStatus.Incomplete);

            if (!result.data.setTileStatus) {
                toast.error(toastError("Update", result.data.setTileStatus.error), {autoClose: false});
            } else {
                toast.success(toastSuccess("Update"), {autoClose: 3000});
                this.setState({isRemoved: true});
            }
        } catch (error) {
            toast.error(toastError("Update", {name: "", message: "Tile not found"}), {autoClose: false});
        }
    }

    public componentWillReceiveProps(props: ITilesTableProps) {
        if (!props.loading) {
            this.setState({cachedTiles: props.tiles, cachedPageCount: props.pageCount});
        }
    }

    public render() {
        if (this.state.cachedTiles.length > 0) {
            const columns = [
                {
                    id: "resubmit",
                    Header: "",
                    accessor: t => t,
                    Cell: row => {
                        return this.props.canSubmit ?
                            (
                                <Button size="mini" icon="repeat" onClick={() => this.onResubmitTile(row.original)}/>
                            ) : null;
                    },
                    maxWidth: 60
                }, {
                    Header: "Tile",
                    accessor: "relative_path"
                }, {
                    Header: "X",
                    accessor: "lat_x"
                }, {
                    Header: "Y",
                    accessor: "lat_y"
                }, {
                    Header: "Z",
                    accessor: "lat_z"
                }];

            const props = {
                style: {backgroundColor: "white"},
                data: this.state.cachedTiles,
                columns: columns,
                showPaginationTop: true,
                showPaginationBottom: false,
                sortable: false,
                filterable: false,
                minRows: 0,
                // loading: this.props.loading,
                manual: true,
                pages: this.state.cachedPageCount,
                defaultPageSize: PreferencesManager.Instance.StageDetailsPageSize,
                onFetchData: (state) => {
                    if (isNaN(state.pageSize)) {
                        state.pageSize = PreferencesManager.Instance.StageDetailsPageSize;
                    }
                    this.props.onCursorChanged(state.page, state.pageSize);
                }
            };

            return (
                <div style={Object.assign({width: "100%"}, this.props.style || {})}>
                    <ReactTable {...props} className="-highlight" style={{borderTop: "none"}}/>
                </div>
            );
        } else {
            return (
                <h4>There are no tiles matching this status.</h4>
            )
        }
    }
}

/* TODO
export const TilesTable = graphql<any, any>(SetTileStatusMutation, {
    props: ({mutate}) => ({
        setTileStatus: (pipelineStageId: string, tileIds: string[], status: TilePipelineStatus) => mutate({
            variables: {pipelineStageId, tileIds, status}
        })
    })
})(_TilesTable);
*/