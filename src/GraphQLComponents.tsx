import {graphql} from "react-apollo";
import gql from "graphql-tag";

import {TaskDefinitions} from "./TaskDefinitions";
import {Workers} from "./Workers";
import {Projects} from "./Projects";
import {PipelineStages} from "./PipelineStages";
import {PipelineGraph} from "./PipelineGraph";

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
      project_id
      task_id
      previous_stage_id
      dst_path
      is_active
      function_type
    }
}`;

const PipelineStagesForProjectQuery = gql`query($pipelinesForProjectId: String!) { 
    pipelineStagesForProject(id: $pipelinesForProjectId) {
      id
      name
      description
      project_id
      task_id
      previous_stage_id
      dst_path
      is_active
      function_type
    }
}`;

const PipelineWorkersQuery = gql`query { 
    pipelineWorkers {
      id
      name
      machine_id
      last_seen
      taskCount
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

const CreatePipelineStageMutation = gql`
  mutation CreatePipelineStageMutation($project_id: String, $task_id: String, $previous_stage_id: String, $dst_path: String) {
    createPipelineStage(project_id:$project_id, task_id:$task_id, previous_stage_id:$previous_stage_id, dst_path:$dst_path) {
      id
      name
      description
      project_id
      task_id
      previous_stage_id
      dst_path
      is_active
      function_type
    }
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

export const ProjectsWithQuery = graphql(ProjectsQuery, {options: {pollInterval: pollingIntervalSeconds * 1000}})(
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

export const PipelineStagesWithQuery = graphql(PipelineStagesQuery, {options: {pollInterval: pollingIntervalSeconds * 1000}})(
    graphql(ProjectsQuery, {
        name: 'projectsData'
    })(graphql(TaskDefinitionsQuery, {
        name: 'taskDefinitionsData'
    })(graphql(PipelineStagesForProjectQuery, {
        name: 'pipelinesForProjectData'
    })(graphql(CreatePipelineStageMutation, {
        props: ({mutate}) => ({
            createMutation: (project_id: string, task_id: string, previous_stage_id: string, dst_path: string) => mutate({
                variables: {
                    project_id: project_id,
                    task_id: task_id,
                    previous_stage_id: previous_stage_id,
                    dst_path: dst_path
                }
            })
        })
    })(graphql(SetPipelineStageStatusMutation, {
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
    })(PipelineStages)))))));

export const PipelineGraphWithQuery = graphql(PipelineStagesQuery, {options: {pollInterval: pollingIntervalSeconds * 1000}})(
    graphql(ProjectsQuery, {
        name: 'projectsData'
    })(graphql(TaskDefinitionsQuery, {
        name: 'taskDefinitionsData'
    })(graphql(CreatePipelineStageMutation, {
        props: ({mutate}) => ({
            createMutation: (project_id: string, task_id: string, previous_stage_id: string, dst_path: string) => mutate({
                variables: {
                    project_id: project_id,
                    task_id: task_id,
                    previous_stage_id: previous_stage_id,
                    dst_path: dst_path
                }
            })
        })
    })(graphql(SetPipelineStageStatusMutation, {
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
    })(PipelineGraph))))));

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
