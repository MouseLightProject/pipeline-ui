import {graphql} from "react-apollo";
import gql from "graphql-tag";

import {TaskDefinitions} from "./TaskDefinitions";
import {Workers} from "./Workers";
import {Projects} from "./Projects";
import {PipelineStages} from "./PipelineStages";

const env = process.env.NODE_ENV || "development";
let pollingIntervalSeconds = 30;

if (env !== "production") {
    pollingIntervalSeconds = 5;
}

const ProjectsQuery = gql`query { 
    projects {
      id
      name
      description
      root_path
      sample_number
      is_active
    }
}`;

const PipelineStagesQuery = gql`query { 
    pipelineStages {
      id
      name
      description
      function_type
      execution_order
      src_path
      dst_path
      is_active
      project_id
      task_id
    }
}`;

const PipelineWorkersQuery = gql`query { 
    pipelineWorkers {
      id
      name
      description
      machine_id
      last_seen
      status
    }
}`;

const TaskDefinitionsQuery = gql`query { 
    taskDefinitions {
      id
      name
      description
      script
      interpreter
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

const StartTaskMutation = gql`
  mutation StartTaskMutation($taskDefinitionId: String!, $scriptArgs: [String!]) {
    startTask(taskDefinitionId:$taskDefinitionId, scriptArgs:$scriptArgs) {
      id
    }
  }
`;

export const ProjectsWithQuery = graphql(ProjectsQuery, {options: {pollInterval: pollingIntervalSeconds * 1000}})(
//    graphql(CreateProjectMutation, {name: "createProjectMutation"})(
    graphql(CreateProjectMutation, {
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
            })(Projects))));

export const PipelineStagesWithQuery = graphql(PipelineStagesQuery, {
    options: {pollInterval: pollingIntervalSeconds * 1000}
})(PipelineStages);

export const PipelineWorkersWithQuery = graphql(PipelineWorkersQuery, {
    options: {pollInterval: pollingIntervalSeconds * 1000}
})(Workers);

export const TaskDefinitionsWithQuery = graphql(TaskDefinitionsQuery, {options: {pollInterval: pollingIntervalSeconds * 1000}})(
    graphql(StartTaskMutation, {
        props: ({mutate}) => ({
            startTaskMutation: (taskDefinitionId: string, scriptArgs: string[]) => mutate({
                variables: {
                    taskDefinitionId: taskDefinitionId,
                    scriptArgs: scriptArgs
                }
            })
        })
    })(TaskDefinitions));
