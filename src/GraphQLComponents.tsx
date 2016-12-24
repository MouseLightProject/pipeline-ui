import {graphql} from "react-apollo";
import gql from "graphql-tag";

import {TaskDefinitions} from "./TaskDefinitions";
import {Projects} from "./Projects";
import {PipelineStages} from "./PipelineStages";
import {PipelineGraph} from "./PipelineGraph";
import {BodyContainer} from "./BodyContainer";

const env = process.env.NODE_ENV || "development";

let pollingIntervalSeconds = 10;

if (env !== "production") {
    pollingIntervalSeconds = 5;
}

const AllObjectQuery = gql`query { 
    pipelineWorkers {
      id
      name
      machine_id
      work_unit_capacity
      last_seen
      task_load
      status
    }
    taskDefinitions {
      id
      name
      description
      script
      interpreter
    }
    projects {
      id
      name
      description
      root_path
      sample_number
      is_active
    }
    pipelineStages {
      id
      name
      description
      project_id
      previous_stage_id
      dst_path
      is_active
      function_type
      task {
        id
        name
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
    }
}`;

const CreateProjectMutation = gql`
  mutation CreateProjectMutation($name: String, $description: String, $rootPath: String, $sampleNumber: Int) {
    createProject(name:$name, description:$description, rootPath:$rootPath, sampleNumber:$sampleNumber) {
      id
      name
      description
      root_path
      sample_number
      is_active
    }
  }
`;

const SetProjectStatusMutation = gql`
  mutation SetProjectStatusMutation($id: String, $shouldBeActive: Boolean) {
    setProjectStatus(id:$id, shouldBeActive:$shouldBeActive) {
      id
      is_active
    }
  }
`;

const DeleteProjectMutation = gql`
  mutation DeleteProjectMutation($id: String!) {
    deleteProject(id:$id)
  }
`;

const SetPipelineStageStatusMutation = gql`
  mutation SetPipelineStageStatusMutation($id: String, $shouldBeActive: Boolean) {
    setPipelineStageStatus(id:$id, shouldBeActive:$shouldBeActive) {
      id
      is_active
    }
  }
`;

const DeletePipelineStageMutation = gql`
  mutation DeletePipelineStageMutation($id: String!) {
    deletePipelineStage(id:$id)
  }
`;

const StartTaskMutation = gql`
  mutation StartTaskMutation($taskDefinitionId: String!, $scriptArgs: [String!]) {
    startTask(taskDefinitionId:$taskDefinitionId, scriptArgs:$scriptArgs) {
      id
    }
  }
`;

export const BodyContainerWithQuery = graphql(AllObjectQuery, {
    options: {
        pollInterval: pollingIntervalSeconds * 1000
    }
})(BodyContainer);

export const ProjectsWithQuery = graphql(CreateProjectMutation, {
    props: ({mutate}) => ({
        createProjectMutation: (name: string, desc: string, root: string, sample: number) => mutate({
            variables: {
                name: name,
                description: desc,
                rootPath: root,
                sampleNumber: sample
            }
        })
    })
})(
    graphql(SetProjectStatusMutation, {
        props: ({mutate}) => ({
            setProjectStatusMutation: (id: string, shouldBeActive: boolean) => mutate({
                variables: {
                    id: id,
                    shouldBeActive: shouldBeActive
                }
            })
        })
    })(
        graphql(DeleteProjectMutation, {
            props: ({mutate}) => ({
                deleteProjectMutation: (id: string) => mutate({
                    variables: {
                        id: id
                    }
                })
            })
        })(Projects)));

export const PipelineStagesWithQuery = graphql(SetPipelineStageStatusMutation, {
    props: ({mutate}) => ({
        setStatusMutation: (id: string, shouldBeActive: boolean) => mutate({
            variables: {
                id: id,
                shouldBeActive: shouldBeActive
            }
        })
    })
})(graphql(DeletePipelineStageMutation, {
    props: ({mutate}) => ({
        deleteMutation: (id: string) => mutate({
            variables: {
                id: id
            }
        })
    })
})(PipelineStages));

export const PipelineGraphWithQuery = graphql(SetPipelineStageStatusMutation, {
    props: ({mutate}) => ({
        setStatusMutation: (id: string, shouldBeActive: boolean) => mutate({
            variables: {
                id: id,
                shouldBeActive: shouldBeActive
            }
        })
    })
})(graphql(DeletePipelineStageMutation, {
    props: ({mutate}) => ({
        deleteMutation: (id: string) => mutate({
            variables: {
                id: id
            }
        })
    })
})(PipelineGraph));

export const TaskDefinitionsWithQuery = graphql(StartTaskMutation, {
        props: ({mutate}) => ({
            startTaskMutation: (taskDefinitionId: string, scriptArgs: string[]) => mutate({
                variables: {
                    taskDefinitionId: taskDefinitionId,
                    scriptArgs: scriptArgs
                }
            })
        })
    })(TaskDefinitions);
