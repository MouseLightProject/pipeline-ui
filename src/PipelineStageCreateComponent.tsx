import * as React from "react";
import {graphql} from "react-apollo";
import gql from "graphql-tag";

import {
    Grid,
    Row,
    Col,
    Panel,
    Button,
    FormGroup,
    ControlLabel,
    FormControl,
    Glyphicon,
    Alert,
    MenuItem,
    DropdownButton,
    HelpBlock
} from "react-bootstrap";
import {IPipelineStage} from "./QueryInterfaces";

const useAcquisitionRoot = "none (use acquisition root)";

class CreatePipelineStageFailedAlert extends React.Component<any, any> {
    render() {
        if (this.props.alertVisible) {
            return (<Alert bsStyle="danger"><strong>Creation Failed</strong> An error occurred creating the object.
            </Alert>);
        } else {
            return (<div/>);
        }
    }
}

class CreatePipelineStageButton extends React.Component<any, any> {
    onClick = () => {
        this.props.createCallback(this.props.project_id, this.props.task_id, this.props.previous_stage_id, this.props.dst_path);
    };

    render() {
        return (
            <Button bsStyle="success" bsSize="small" disabled={!this.props.canCreate} onClick={this.onClick}><Glyphicon
                glyph="plus"/> Add</Button>)
    }
}

class ProjectMenu extends React.Component<any, any> {
    handleChange = (eventKey) => {
        this.props.onProjectSelectionChange(eventKey);
    };

    render() {
        let title = "";

        let rows = this.props.projects.map(project => {
            if (project.id === this.props.selectedProjectId) {
                title = `${project.name} (Sample Id ${project.sample_number})`;
            }

            return (<MenuItem key={"pipeline_project_" +project.id}
                              eventKey={project.id}>{`${project.name} (Sample Id ${project.sample_number})`}</MenuItem>)
        });

        return (
            <div>
                <DropdownButton bsSize="sm" id="project-dropdown" title={title} onSelect={this.handleChange}>
                    {rows}
                </DropdownButton>
            </div>
        )
    }
}

class TaskMenu extends React.Component<any, any> {
    handleChange = (eventKey) => {
        this.props.onTaskSelectionChange(eventKey);
    };

    render() {
        let title = "";

        let rows = this.props.tasks.map(task => {
            if (task.id === this.props.selectedTaskId) {
                title = `${task.name}`;
            }

            return (<MenuItem key={"pipeline_task_" + task.id} eventKey={task.id}>{`${task.name}`}</MenuItem>)
        });

        return (
            <div>
                <DropdownButton bsSize="sm" id="task-for-pipeline-stage-dropdown" title={title}
                                onSelect={this.handleChange}>
                    {rows}
                </DropdownButton>
            </div>
        )
    }
}

class PreviousStageMenu extends React.Component<any, any> {
    handleChange = (eventKey) => {
        this.props.onPreviousStageSelectionChange(eventKey);
    };

    render() {
        let title = useAcquisitionRoot;

        let rows = this.props.pipelinesForProject.map(stage => {
            if (stage.id === this.props.selectedPreviousId) {
                title = `${stage.id}`;
            }

            return (<MenuItem key={"pipeline-previous-" + stage.id} eventKey={stage.id}>{`${stage.id}`}</MenuItem>)
        });

        return (
            <div>
                <DropdownButton bsSize="sm" id="previous-stage-for-pipeline-stage-dropdown" title={title}
                                onSelect={this.handleChange}>
                    <MenuItem key={"pipeline-previous-none"} eventKey={null}>{useAcquisitionRoot}</MenuItem>
                    {rows}
                </DropdownButton>
            </div>
        );
    }
}

class FunctionTypeMenu extends React.Component<any, any> {
    handleChange = (eventKey) => {
        this.props.onFunctionSelectionChange(eventKey);
    };

    render() {
        let title = "";

        switch (this.props.selectedFunctionType) {
            case 2:
                title = "Map Tile";
                break;
            case 3:
                title = "Map With Z Index - 1 Tile";
                break;
            case 4:
                title = "Map Dual Channel";
                break;
        }

        return (
            <div>
                <DropdownButton bsSize="sm" id="function-for-pipeline-stage-drop-down" title={title}
                                onSelect={this.handleChange}>
                    <MenuItem key={"pipeline_function_2"} eventKey={2}>Map Tile</MenuItem>
                    <MenuItem key={"pipeline_function_3"} eventKey={3}>Map With Z Index - 1 Tile</MenuItem>
                    <MenuItem key={"pipeline_function_4"} eventKey={4}>Map Dual Channel</MenuItem>
                </DropdownButton>
            </div>
        )
    }
}

interface IPipelineStageComponentState {
    project_id?: string;
    task_id?: string;
    previous_stage_id?: string;
    dst_path?: string;
    function_type?: number;
    dstPathValidation?: any;
    alertVisible?: boolean;
    pipelinesForProject?: IPipelineStage[];
}

class PipelineStageCreateComponent extends React.Component<any, IPipelineStageComponentState> {
    constructor(props) {
        super(props);

        this.state = {
            project_id: "",
            task_id: "",
            previous_stage_id: "",
            dst_path: "",
            function_type: 0,
            dstPathValidation: "error",
            alertVisible: false
        };
    }

    onProjectSelectionChange = (selectedProjectId: any) => {
        this.setState({project_id: selectedProjectId, alertVisible: false}, null);
        this.props.onPipelinesForProjectIdChanged(selectedProjectId);
    };

    onTaskSelectionChange = (taskProjectId: any) => {
        this.setState({task_id: taskProjectId, alertVisible: false}, null);
    };

    onFunctionSelectionChange = (functionType: any) => {
        this.setState({function_type: functionType, alertVisible: false}, null);
    };

    onPreviousStageSelectionChange = (previousStageId: any) => {
        this.setState({previous_stage_id: previousStageId, alertVisible: false}, null);
    };

    onDstPathChange = (event: any) => {
        let dstPath = event.target.value;
        this.setState({
            dst_path: dstPath,
            alertVisible: false,
            dstPathValidation: dstPath.length > 0 ? null : "error"
        }, null);
    };

    onCreateProject = (project_id, task_id, previous_stage_id, dst_path, function_type) => {
        this.props.createMutation(project_id, task_id, previous_stage_id, dst_path, function_type)
        .then(() => {
            this.props.refetch();
        }).catch((err) => {
            console.log(err);
        });
    };

    onCreateError = (err: any) => {
        console.log(err);
        this.setState({alertVisible: true}, null);
    };

    componentDidMount = () => {
        if (this.state.project_id === "" && this.props.projects.length > 1) {
            this.onProjectSelectionChange(this.props.projects[0].id);
        }

        if (this.state.task_id === "" && this.props.tasks.length > 0) {
            this.onTaskSelectionChange(this.props.tasks[0].id);
        }

        this.onFunctionSelectionChange(2);
    };

    render() {
        this.state.pipelinesForProject = [];

        if (this.props.data && this.props.data.pipelineStagesForProject) {
            this.state.pipelinesForProject = this.props.data.pipelineStagesForProject;
        }

        return (
            <Panel collapsible defaultExpanded header="Add Stage" bsStyle="info">
                <Grid fluid>
                    <Row>
                        <Col lg={2}>
                            <FormGroup bsSize="small">
                                <ControlLabel>Add to Acquisition Pipeline</ControlLabel>
                                <ProjectMenu onProjectSelectionChange={this.onProjectSelectionChange}
                                             projects={this.props.projects}
                                             selectedProjectId={this.state.project_id}/>
                            </FormGroup>
                        </Col>
                        <Col lg={2}>
                            <FormGroup bsSize="small">
                                <ControlLabel>Execute Task</ControlLabel>
                                <TaskMenu onTaskSelectionChange={this.onTaskSelectionChange}
                                          tasks={this.props.tasks}
                                          selectedTaskId={this.state.task_id}/>
                            </FormGroup>
                        </Col>
                        <Col lg={2}>
                            <FormGroup bsSize="small">
                                <ControlLabel>Previous Stage</ControlLabel>
                                <PreviousStageMenu onPreviousStageSelectionChange={this.onPreviousStageSelectionChange}
                                                   pipelinesForProject={this.state.pipelinesForProject}
                                                   selectedPreviousId={this.state.previous_stage_id}/>
                            </FormGroup>
                        </Col>
                        <Col lg={2}>
                            <FormGroup bsSize="small">
                                <ControlLabel>Tile Function</ControlLabel>
                                <FunctionTypeMenu onFunctionSelectionChange={this.onFunctionSelectionChange}
                                                  selectedFunctionType={this.state.function_type}/>
                            </FormGroup>
                        </Col>
                        <Col lg={4}>
                            <FormGroup controlId="dstPathText" bsSize="small"
                                       validationState={this.state.dstPathValidation}>
                                <ControlLabel>Output Path</ControlLabel>
                                <FormControl type="text" onChange={this.onDstPathChange} value={this.state.dst_path}/>
                                <HelpBlock>The output path should be a path accessible from the server and workers</HelpBlock>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={1}>
                            <CreatePipelineStageButton project_id={this.state.project_id} task_id={this.state.task_id}
                                                       previous_stage_id={this.state.previous_stage_id}
                                                       dst_path={this.state.dst_path}
                                                       function_type={this.state.function_type}
                                                       canCreate={this.state.dstPathValidation === null}
                                                       createCallback={this.onCreateProject}
                                                       errorCallback={this.onCreateError}/>
                        </Col>
                        <Col lg={11}>
                            <CreatePipelineStageFailedAlert alertVisible={this.state.alertVisible}/>
                        </Col>
                    </Row>
                </Grid>
            </Panel>)
    }
}


const PipelineStagesForProjectQuery = gql`query($pipelinesForProjectId: String!) {
     pipelineStagesForProject(id: $pipelinesForProjectId) {
     id
     name
     description
     project_id
     task_id
     previous_stage_id
     dst_path
     is_processing
     function_type
     }
 }`;

const CreatePipelineStageMutation = gql`
  mutation CreatePipelineStageMutation($project_id: String, $task_id: String, $previous_stage_id: String, $dst_path: String, $function_type: Int) {
    createPipelineStage(project_id:$project_id, task_id:$task_id, previous_stage_id:$previous_stage_id, dst_path:$dst_path, function_type:$function_type) {
      id
      name
      description
      project_id
      task_id
      previous_stage_id
      dst_path
      is_processing
      function_type
    }
  }
`;

export const PipelineStageCreateWithQuery = graphql(PipelineStagesForProjectQuery, {
    options: ({pipelinesForProjectId}) => ({
        pollInterval: 5000,
        variables: {pipelinesForProjectId}
    })
})(graphql(CreatePipelineStageMutation, {
    props: ({mutate}) => ({
        createMutation: (project_id: string, task_id: string, previous_stage_id: string, dst_path: string, function_type: number) => mutate({
            variables: {
                project_id: project_id,
                task_id: task_id,
                previous_stage_id: previous_stage_id,
                dst_path: dst_path,
                function_type: function_type
            }
        })
    })
})(PipelineStageCreateComponent));

