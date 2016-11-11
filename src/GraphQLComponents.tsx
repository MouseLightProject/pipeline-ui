import {graphql} from "react-apollo";
import gql from "graphql-tag";

import {TaskDefinitions} from "./TaskDefinitions";
import {Workers} from "./Workers";
import {Projects} from "./Projects";
import {PipelineStages} from "./PipelineStages";

const ProjectsQuery = gql`query { 
    projects {
      id
      name
      description
      root_path
      sample_number
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
      project_id
      task_id
    }
}`;

const WorkersQuery = gql`query { 
    workers {
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

export const ProjectsWithQuery = graphql(ProjectsQuery, {
    options: {pollInterval: 5000},
})(Projects);

export const PipelineStagesWithQuery = graphql(PipelineStagesQuery, {
    options: {pollInterval: 5000},
})(PipelineStages);

export const WorkersWithQuery = graphql(WorkersQuery, {
    options: {pollInterval: 5000},
})(Workers);

export const TaskDefinitionsWithQuery = graphql(TaskDefinitionsQuery, {
    options: {pollInterval: 30000},
})(TaskDefinitions);
