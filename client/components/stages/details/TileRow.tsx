import * as React from "react";
import {Glyphicon} from "react-bootstrap"
import {graphql} from "react-apollo";
import {toast} from "react-toastify";

import {IPipelineTile} from "../../../models/pipelineTile";
import {TileStatusMutation} from "../../../graphql/pipelineTile";
import {TilePipelineStatus} from "../../../models/tilePipelineStatus";
import {toastUpdateError, toastUpdateSuccess} from "ndb-react-components";
import {IPipelineStage} from "../../../models/pipelineStage";
import {isRegExp} from "util";

interface ITileRowProps {
    pipelineStage: IPipelineStage;
    tile: IPipelineTile;
    canSubmit: boolean;

    setTileStatus?(pipelineStageId: string, tileId: string, status: TilePipelineStatus): any;
}

interface ITileRowState {
    isRemoved?: boolean;
}

@graphql(TileStatusMutation, {
    props: ({mutate}) => ({
        setTileStatus: (pipelineStageId: string, tileId: string, status: TilePipelineStatus) => mutate({
            variables: {pipelineStageId, tileId, status}
        })
    })
})
export class TileRow extends React.Component<ITileRowProps, ITileRowState> {
    public constructor(props: ITileRowProps) {
        super(props);

        this.state = {
            isRemoved: false
        }
    }

    private async onResubmitTile() {
        try {
            const result = await this.props.setTileStatus(this.props.pipelineStage.id, this.props.tile.relative_path, TilePipelineStatus.Incomplete);

            if (!result.data.setTileStatus) {
                toast.error(toastUpdateError(result.data.setTileStatus.error), {autoClose: false});
            } else {
                toast.success(toastUpdateSuccess(), {autoClose: 3000});
                this.setState({isRemoved: true});
            }
        } catch (error) {
            toast.error(toastUpdateError({name: "", message: "Tile not found"}), {autoClose: false});
        }
    }

    public render() {
        if (this.state.isRemoved) {
            return null;
        }

        const tile = this.props.tile;

        return (
            <tr>
                <td>{this.props.canSubmit ?
                    <Glyphicon glyph="repeat" onClick={() => this.onResubmitTile()}/> : null}</td>
                <td>{tile.relative_path}</td>
                <td>{tile.lat_x}</td>
                <td>{tile.lat_y}</td>
                <td>{tile.lat_z}</td>
            </tr>
        );
    }
}
