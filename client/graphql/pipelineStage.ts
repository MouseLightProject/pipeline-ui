import gql from "graphql-tag";

export const PipelineStageRequiredFieldsFragment= gql`fragment StageRequiredFields on PipelineStage {
  id
  name
  description
  previous_stage_id
  dst_path
  depth
  is_processing
  function_type
  project {
    id
    name
    is_processing
  }
  task {
    id
    name
  }
  previous_stage {
    id
    name
  }
  child_stages {
    id
    name
  }
  tile_status {
    incomplete
    queued
    processing
    complete
    failed
    canceled
  }
}`;

export const PipelineStageFullFieldsFragment = gql`fragment PipelineStageFullFields on PipelineStage {
  id
  name
  description
  previous_stage_id
  dst_path
  depth
  is_processing
  function_type
  project {
    id
    name
    is_processing
    stages {
      id
      name
      description
      previous_stage_id
      dst_path
      depth
      is_processing
      function_type
    }
  }
  task {
    id
    name
  }
  previous_stage {
    id
    name
  }
  child_stages {
    id
    name
  }
  tile_status {
    incomplete
    queued
    processing
    complete
    failed
    canceled
  }
}`;

export const PerformanceFieldsFragment = gql`fragment PerformanceFields on PipelineStagePerformance {
    id
    pipeline_stage_id
    num_in_process
    num_ready_to_process
    num_execute
    num_complete
    num_error
    num_cancel
    cpu_average
    cpu_high
    cpu_low
    memory_average
    memory_high
    memory_low
    duration_average
    duration_high
    duration_low
}`;

export const CreateStageMutation = gql`
  mutation CreatePipelineStageMutation($pipelineStage: PipelineStageInput) {
    createPipelineStage(pipelineStage: $pipelineStage) {
        pipelineStage {
          ...StageRequiredFields
          performance {
            ...PerformanceFields
          }
          created_at
          updated_at
        }
        error
    }
  }
${PipelineStageRequiredFieldsFragment}
${PerformanceFieldsFragment}
`;

export const UpdatePipelineStageMutation = gql`
  mutation UpdatePipelineStageMutation($pipelineStage: PipelineStageInput) {
    updatePipelineStage(pipelineStage: $pipelineStage) {
        pipelineStage {
          ...StageRequiredFields
          performance {
            ...PerformanceFields
          }
          created_at
          updated_at
        }
      error
    }
  }
${PipelineStageRequiredFieldsFragment}
${PerformanceFieldsFragment}
`;

export const DeletePipelineStageMutation = gql`
  mutation DeletePipelineStageMutation($id: String!) {
    deletePipelineStage(id: $id) {
        id
        error
    }
  }
`;
