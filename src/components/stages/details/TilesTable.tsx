import * as React from "react";
import {Table} from "react-bootstrap"

import {IPipelineTile} from "../../../models/pipelineTile";
import {TileRow} from "./TileRow";
import {IPipelineStage} from "../../../models/pipelineStage";


interface ITilesTableProps {
    pipelineStage: IPipelineStage;
    tiles: IPipelineTile[];
    canSubmit: boolean;
}

interface ITilesTableState {
}

export class TilesTable extends React.Component<ITilesTableProps, ITilesTableState> {
    render() {
        let rows = this.props.tiles.map(tile => {
            return (<TileRow key={"tr_" + tile.relative_path} pipelineStage={this.props.pipelineStage} tile={tile}
                             canSubmit={this.props.canSubmit}/>);
        });

        return (
            <div>
                <Table striped condensed style={{margin: 0, borderTop: "1px solid"}}>
                    <thead>
                    <tr>
                        <th/>
                        <th>Tile</th>
                        <th>X</th>
                        <th>Y</th>
                        <th>Z</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows}
                    </tbody>
                </Table>
            </div>
        );
    }
}
