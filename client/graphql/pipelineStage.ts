import gql from "graphql-tag";

export const PipelineStagesQuery = gql`query { 
    pipelineStages {
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
      performance {
        id
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
      }
      created_at
    }
}`;

export const CreateStageMutation = gql`
  mutation CreatePipelineStageMutation($pipelineStage: PipelineStageInput) {
    createPipelineStage(pipelineStage: $pipelineStage) {
        pipelineStage {
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
          created_at
        }
        error
    }
  }
`;

export const UpdatePipelineStageMutation = gql`
  mutation UpdatePipelineStageMutation($pipelineStage: PipelineStageInput) {
    updatePipelineStage(pipelineStage: $pipelineStage) {
        pipelineStage {
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
          performance {
            id
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
          }
          created_at
        }
      error
    }
  }
`;

export const DeletePipelineStageMutation = gql`
  mutation DeletePipelineStageMutation($id: String!) {
    deletePipelineStage(id: $id) {
        id
        error
    }
  }
`;
