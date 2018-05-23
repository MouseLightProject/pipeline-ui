import gql from "graphql-tag";

import {ProjectFieldsFragment} from "./project";
import {TaskRepositoryFragment} from "./taskRepository";
import {TaskDefinitionFragment} from "./taskDefinition";
import {WorkerFragment} from "./workers";

export const BaseQuery = gql`query {
  projects {
    ...ProjectFields
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
      tile_status {
        incomplete
        queued
        processing
        complete
        failed
        canceled
      }
      performance {
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
      }
      created_at
      updated_at
    }
  }
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
    performance {
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
    }
    created_at
    updated_at
  }
  
  pipelineWorkers {
    ...WorkerFields
  }
  taskRepositories {
    ...TaskRepositoryFields
  }
  taskDefinitions {
    ...TaskDefinitionFields
  }
  pipelineVolume
}
${ProjectFieldsFragment}
${WorkerFragment}
${TaskRepositoryFragment}
${TaskDefinitionFragment}
`;