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

export const CreateStageMutation = gql`
  mutation CreatePipelineStageMutation($pipelineStage: PipelineStageInput) {
    createPipelineStage(pipelineStage: $pipelineStage) {
        pipelineStage {
          ...StageRequiredFields
          created_at
          updated_at
        }
        error
    }
  }
${PipelineStageRequiredFieldsFragment}
`;

export const UpdatePipelineStageMutation = gql`
  mutation UpdatePipelineStageMutation($pipelineStage: PipelineStageInput) {
    updatePipelineStage(pipelineStage: $pipelineStage) {
        pipelineStage {
          ...StageRequiredFields
          created_at
          updated_at
        }
      error
    }
  }
${PipelineStageRequiredFieldsFragment}
`;

export const DeletePipelineStageMutation = gql`
  mutation DeletePipelineStageMutation($id: String!) {
    deletePipelineStage(id: $id) {
        id
        error
    }
  }
`;
