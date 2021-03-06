import gql from "graphql-tag";

import {ProjectFieldsFragment} from "./project";
import {
    PipelineStageFullFieldsFragment,
    PipelineStageRequiredFieldsFragment
} from "./pipelineStage";
import {TaskRepositoryFragment} from "./taskRepository";
import {TaskDefinitionFragment} from "./taskDefinition";
import {WorkerFragment} from "./workers";

export const BaseQuery = gql`query {
  schedulerHealth {
    lastResponse
    lastSeen
  }
  projects {
    ...ProjectFields
    stages {
      ...StageRequiredFields
      created_at
      updated_at
    }
  }
  
  pipelineStages {
    ...PipelineStageFullFields
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
${PipelineStageFullFieldsFragment}
${PipelineStageRequiredFieldsFragment}
${WorkerFragment}
${TaskRepositoryFragment}
${TaskDefinitionFragment}
`;