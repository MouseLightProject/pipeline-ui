import * as React from "react";
import {Button} from "semantic-ui-react";
import {Mutation} from "react-apollo";
import ReactTable from "react-table";
import {toast} from "react-toastify";

import {IPipelineTile} from "../../../models/pipelineTile";
import {IPipelineStage} from "../../../models/pipelineStage";
import {TilePipelineStatus} from "../../../models/tilePipelineStatus";
import {PreferencesManager} from "../../../util/preferencesManager";
import {SetTileStatusMutation} from "../../../graphql/pipelineTile";
import moment = require("moment");
import {valueFromAST} from "graphql";


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
                                <Mutation mutation={SetTileStatusMutation}>
                                    {(setTileStatus) => (
                                        <Button size="mini" icon="repeat"
                                                onClick={() => setTileStatus({
                                                    variables: {
                                                        pipelineStageId: this.props.pipelineStage.id,
                                                        tileIds: [row.original.relative_path],
                                                        status: TilePipelineStatus.Incomplete
                                                    }
                                                })}/>
                                    )
                                    }
                                </Mutation>
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
