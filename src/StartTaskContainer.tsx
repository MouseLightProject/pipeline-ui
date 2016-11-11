import * as React from "react";
import {graphql} from "react-apollo";
import gql from "graphql-tag";
import {
    Grid,
    Row,
    Col,
    Panel,
    Button,
    DropdownButton,
    MenuItem,
    Form,
    FormGroup,
    ControlLabel,
    FormControl
} from "react-bootstrap";


class StartTaskMenu extends React.Component<any, any> {
    handleChange = (eventKey) => {
        this.props.onTaskSelectionChange(eventKey);
    };

    render() {
        let title = "";

        let rows = this.props.taskDefinitions.map(taskDefinition => {
            if (taskDefinition.id === this.props.selectedTaskId) {
                title = taskDefinition.name;
            }

            return (<MenuItem key={taskDefinition.id} eventKey={taskDefinition.id}>{taskDefinition.name}</MenuItem>)
        });

        return (
            <div>
                <DropdownButton id="task-definition-dropdown" title={title} onSelect={this.handleChange}>
                    {rows}
                </DropdownButton>
            </div>
        )
    }
}

class StartTaskButton extends React.Component<any, any> {
    onClick() {
        this.props.mutate({variables: {taskDefinitionId: this.props.selectedTaskDefinitionId, scriptArgs: this.props.scriptArgs}})
        .then(({data}) => {
            console.log("got data", data);
        }).catch((error) => {
            console.log("there was an error sending the query", error);
        });
    }

    render() {
        return (<Button bsStyle="primary" onClick={this.onClick.bind(this)}>Start</Button>)
    }
}

interface IStartTaskComponentState {
    selectedTaskDefinitionId?: string;
    scriptArgs?: string[];
}

export class StartTaskComponent extends React.Component<any, IStartTaskComponentState> {
    constructor(props) {
        super(props);
        this.onTaskSelectionChange = this.onTaskSelectionChange.bind(this);
        this.state = {selectedTaskDefinitionId: "", scriptArgs: [""]};
    }

    public onTaskSelectionChange(selectedTaskId: any) {
        this.setState({selectedTaskDefinitionId: selectedTaskId}, null);
    }

    onTaskArgumentsChange = (event: any) => {
        this.setState({scriptArgs: [event.target.value]}, null);
    }

    render() {
        if (this.state.selectedTaskDefinitionId === "" && this.props.taskDefinitions.length > 0) {
            this.state.selectedTaskDefinitionId = this.props.taskDefinitions[0].id;
        }

        return (
            <Panel collapsible defaultExpanded header="Start New Task">
                <Grid fluid>
                    <Row>
                        <Col lg={2}>
                            <FormGroup>
                                <ControlLabel>Task</ControlLabel>
                                <StartTaskMenu onTaskSelectionChange={this.onTaskSelectionChange}
                                               taskDefinitions={this.props.taskDefinitions}
                                               selectedTaskId={this.state.selectedTaskDefinitionId}/>
                            </FormGroup>
                        </Col>
                        <Col lg={10}>
                            <FormGroup>
                                <ControlLabel>Arguments</ControlLabel>
                                <FormControl type="text" onChange={this.onTaskArgumentsChange} value={this.state.scriptArgs[0]}></FormControl>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={12}>
                            <StartTaskButtonWithMutation
                                selectedTaskDefinitionId={this.state.selectedTaskDefinitionId} scriptArgs={this.state.scriptArgs}/>
                        </Col>
                    </Row>
                </Grid>
            </Panel>)
    }
}

const startTaskMutation = gql`
  mutation StartTaskMutation($taskDefinitionId: String!, $scriptArgs: [String!]) {
    startTask(taskDefinitionId:$taskDefinitionId, scriptArgs:$scriptArgs) {
      id
    }
  }
`;

const StartTaskButtonWithMutation = graphql(startTaskMutation)(StartTaskButton);
