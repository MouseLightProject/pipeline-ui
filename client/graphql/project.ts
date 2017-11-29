import gql from "graphql-tag";

export const ProjectsQuery = gql`query { 
    projects {
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
      created_at
      updated_at
      stages {
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
      }
    }
}`;

export const CreateProjectMutation = gql`mutation CreateProjectMutation($project: ProjectInput) {
  createProject(project: $project) {
      project {
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
        updated_at
        stages {
          id
          name
          depth
          previous_stage_id
          task_id
          task {
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
        }
    }
    error
  }
}`;

export const UpdateProjectMutation = gql`
  mutation UpdateProjectMutation($project: ProjectInput) {
    updateProject(project:$project) {
      project {
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
      stages {
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
      }
        updated_at
      }
      error
    }
  }
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
