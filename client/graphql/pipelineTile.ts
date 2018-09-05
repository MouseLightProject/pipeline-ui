import gql from "graphql-tag";

export const TilesForStageQuery = gql`query($pipelineStageId: String, $status: Int, $offset: Int, $limit: Int) {
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
            task_executions {
                id
                worker_id
                queue_type
                resolved_output_path
                resolved_script
                resolved_script_args
                resolved_cluster_args
                resolved_log_path
                execution_status_code
                completion_status_code
                cpu_time_seconds
                max_cpu_percent
                max_memory_mb
                exit_code
                submitted_at
                started_at
                completed_at
                updated_at
            }
        }
    }
}`;

export const SetTileStatusMutation = gql`mutation SetTileStatus($pipelineStageId: String, $tileIds: [String], $status: Int) {
  setTileStatus(pipelineStageId: $pipelineStageId, tileIds: $tileIds, status: $status) {
    relative_path
    lat_x
    lat_y
    lat_z
    this_stage_status
  }
}`;

export const ConvertTileStatusMutation = gql`mutation SetTileStatus($pipelineStageId: String, $currentStatus: Int, $desiredStatus: Int) {
  convertTileStatus(pipelineStageId: $pipelineStageId, currentStatus: $currentStatus, desiredStatus: $desiredStatus) {
    relative_path
    lat_x
    lat_y
    lat_z
    this_stage_status
  }
}`;
