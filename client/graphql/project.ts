import gql from "graphql-tag";
import {PipelineStageRequiredFieldsFragment} from "./pipelineStage";

export const ProjectFieldsFragment = gql`fragment ProjectFields on Project {
    id
    name
    description
    root_path
    log_root_path
    dashboard_json_status
    sample_number
    sample_x_min
    sample_x_max
    sample_y_min
    sample_y_max
    sample_z_min
    sample_z_max
    region_x_min
    region_x_max
    region_y_min
    region_y_max
    region_z_min
    region_z_max
    is_processing
    input_source_state
    last_seen_input_source
    last_checked_input_source
    created_at
    updated_at
}`;

export const CreateProjectMutation = gql`mutation CreateProjectMutation($project: ProjectInput) {
  createProject(project: $project) {
      project {
        ...ProjectFields
        stages {
          ...StageRequiredFields
        }
    }
    error
  }
}
${ProjectFieldsFragment}
${PipelineStageRequiredFieldsFragment}
`;

export const UpdateProjectMutation = gql`mutation UpdateProjectMutation($project: ProjectInput) {
    updateProject(project:$project) {
      project {
        ...ProjectFields
      stages {
          ...StageRequiredFields
      }
        updated_at
      }
      error
    }
}
${ProjectFieldsFragment}
${PipelineStageRequiredFieldsFragment}
`;

export const DuplicateProjectMutation = gql`
  mutation DuplicateProjectMutation($id: String) {
    duplicateProject(id: $id) {
        project {
          ...ProjectFields
          stages {
              ...StageRequiredFields
          }
        updated_at
      }
      error
    }
  }
${ProjectFieldsFragment}
${PipelineStageRequiredFieldsFragment}
`;

export const DeleteProjectMutation = gql`
  mutation DeleteProjectMutation($id: String!) {
    deleteProject(id: $id) {
        id
        error
    }
  }
`;

export const PipelinePlaneQuery = gql`query($project_id: String, $plane: Int) { 
  projectPlaneTileStatus(project_id: $project_id, plane: $plane) {
    max_depth
    x_min
    x_max
    y_min
    y_max
    tiles {
      x_index
      y_index
      stages {
        stage_id
        depth
        status
      }
    }
  }
}`;
