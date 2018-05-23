import gql from "graphql-tag";

import {ProjectFieldsFragment} from "./project";
import {PerformanceFieldsFragment, PipelineStageRequiredFieldsFragment} from "./pipelineStage";
import {TaskRepositoryFragment} from "./taskRepository";
import {TaskDefinitionFragment} from "./taskDefinition";
import {WorkerFragment} from "./workers";

export const BaseQuery = gql`query {
  projects {
    ...ProjectFields
    stages {
      ...StageRequiredFields
      performance {
        ...PerformanceFields
      }
      created_at
      updated_at
    }
  }
  pipelineStages {
    ...StageRequiredFields
    performance {
        ...PerformanceFields
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
${PipelineStageRequiredFieldsFragment}
${PerformanceFieldsFragment}
${WorkerFragment}
${TaskRepositoryFragment}
${TaskDefinitionFragment}
`;