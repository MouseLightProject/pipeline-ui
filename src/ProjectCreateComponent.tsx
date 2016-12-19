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
    Alert,
    HelpBlock
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
            <Button bsStyle="success" bsSize="small" disabled={!this.props.canCreate} onClick={this.onClick}><Glyphicon glyph="plus"/> Create</Button>)
    }
}

interface IStartTaskComponentState {
    name?: string;
    nameValidation?: any;
    description?: string;
    rootPath?: string;
    rootPathValidation?: any;
    sampleNumber?: number;
    alertVisible?: boolean;
}

export class ProjectCreateComponent extends React.Component<any, IStartTaskComponentState> {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            nameValidation: "error",
            description: "",
            rootPath: "",
            rootPathValidation: "error",
            sampleNumber: 1,
            alertVisible: false
        };
    }

    onNameChange = (event: any) => {
        let name = event.target.value;
        this.setState({name: name, alertVisible: false, nameValidation: name.length > 0 ? null : "error"}, null);
    };

    onDescriptionChange = (event: any) => {
        this.setState({description: event.target.value, alertVisible: false}, null);
    };

    onRootPathChange = (event: any) => {
        let rootPath = event.target.value;
        this.setState({
            rootPath: rootPath,
            alertVisible: false,
            rootPathValidation: rootPath.length > 0 ? null : "error"
        }, null);
    };

    onSampleNumberChange = (event: any) => {
        let x = parseInt(event.target.value);
        if (!isNaN(x) && x >= 0) {
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
        let nameHelp = this.state.name.length === 0 ? "Name can not be empty" : "";

        return (
            <Panel collapsible defaultExpanded={false} header="Create Pipeline" bsStyle="info">
                <Grid fluid>
                    <Row>
                        <Col lg={5}>
                            <FormGroup controlId="rootPathText" bsSize="small"
                                       validationState={this.state.rootPathValidation}>
                                <ControlLabel>Root Path</ControlLabel>
                                <FormControl type="text" onChange={this.onRootPathChange} value={this.state.rootPath}/>
                                <HelpBlock>The root path should be a path accessible from the server and workers</HelpBlock>
                            </FormGroup>
                        </Col>
                        <Col lg={2}>
                            <FormGroup bsSize="small" validationState={this.state.nameValidation}>
                                <ControlLabel>Name</ControlLabel>
                                <FormControl type="text" onChange={this.onNameChange} value={this.state.name}/>
                                <HelpBlock>{nameHelp}</HelpBlock>
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
                                                 canCreate={this.state.nameValidation === null && this.state.rootPathValidation === null}
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
