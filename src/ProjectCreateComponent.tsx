import * as React from "react";

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
    Alert
} from "react-bootstrap";

class CreateProjectFailedAlert extends React.Component<any, any> {
    render() {
        if (this.props.alertVisible) {
            return (<Alert bsStyle="danger"><strong>Creation Failed</strong> An error occurred creating the object.
            </Alert>);
        } else {
            return (<div/>);
        }
    }
}

class CreateProjectButton extends React.Component<any, any> {
    onClick = () => {
        this.props.createCallback(this.props.name, this.props.description, this.props.rootPath, this.props.sampleNumber);
    };

    render() {
        return (
            <Button bsStyle="success" bsSize="small" onClick={this.onClick}><Glyphicon glyph="plus"/> Create</Button>)
    }
}

interface IStartTaskComponentState {
    name?: string;
    description?: string;
    rootPath?: string;
    sampleNumber?: number;
    alertVisible?: boolean;
}

export class ProjectCreateComponent extends React.Component<any, IStartTaskComponentState> {
    constructor(props) {
        super(props);
        this.state = {name: "", description: "", rootPath: "", sampleNumber: 1, alertVisible: false};
    }

    onNameChange = (event: any) => {
        this.setState({name: event.target.value, alertVisible: false}, null);
    };

    onDescriptionChange = (event: any) => {
        this.setState({description: event.target.value, alertVisible: false}, null);
    };

    onRootPathChange = (event: any) => {
        this.setState({rootPath: event.target.value, alertVisible: false}, null);
    };

    onSampleNumberChange = (event: any) => {
        let x = parseInt(event.target.value);
        if (!isNaN(x)) {
            this.setState({sampleNumber: x, alertVisible: false}, null);
        } else {
            this.setState({alertVisible: false}, null);
        }
    };

    onCreateError = (err: any) => {
        console.log(err);
        this.setState({alertVisible: true}, null);
    };

    render() {
        return (
            <Panel collapsible defaultExpanded header="Create Project" bsStyle="info">
                <Grid fluid>
                    <Row>
                        <Col lg={5}>
                            <FormGroup bsSize="small">
                                <ControlLabel>Root Path</ControlLabel>
                                <FormControl type="text" onChange={this.onRootPathChange}
                                             value={this.state.rootPath}/>
                            </FormGroup>
                        </Col>
                        <Col lg={2}>
                            <FormGroup bsSize="small">
                                <ControlLabel>Name</ControlLabel>
                                <FormControl type="text" onChange={this.onNameChange} value={this.state.name}/>
                            </FormGroup>
                        </Col>
                        <Col lg={3}>
                            <FormGroup bsSize="small">
                                <ControlLabel>Description</ControlLabel>
                                <FormControl type="text" onChange={this.onDescriptionChange}
                                             value={this.state.description}/>
                            </FormGroup>
                        </Col>
                        <Col lg={2}>
                            <FormGroup bsSize="small">
                                <ControlLabel>Sample Number</ControlLabel>
                                <FormControl type="text" onChange={this.onSampleNumberChange}
                                             value={this.state.sampleNumber.toString()}/>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={1}>
                            <CreateProjectButton name={this.state.name} description={this.state.description}
                                                 rootPath={this.state.rootPath}
                                                 sampleNumber={this.state.sampleNumber}
                                                 createCallback={this.props.createCallback}
                                                 errorCallback={this.onCreateError}/>
                        </Col>
                        <Col lg={11}>
                            <CreateProjectFailedAlert alertVisible={this.state.alertVisible}/>
                        </Col>
                    </Row>
                </Grid>
            </Panel>)
    }
}
