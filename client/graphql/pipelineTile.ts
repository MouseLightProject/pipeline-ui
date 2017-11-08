import gql from "graphql-tag";

export const TileStatusMutation = gql`mutation SetTileStatus($pipelineStageId: String, $tileId: String, $status: Int) {
  setTileStatus(pipelineStageId: $pipelineStageId, tileId: $tileId, status: $status) {
    relative_path
    lat_x
    lat_y
    lat_z
    this_stage_status
  }
}`;
