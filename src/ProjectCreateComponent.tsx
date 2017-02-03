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
        const region = {
            x_min: this.props.regionMinX,
            x_max: this.props.regionMaxX,
            y_min: this.props.regionMinY,
            y_max: this.props.regionMaxY,
            z_min: this.props.regionMinZ,
            z_max: this.props.regionMaxZ
        };

        const project = {
            name: this.props.name,
            description: this.props.description,
            root_path: this.props.rootPath,
            sample_number: this.props.sampleNumber,
            region_bounds: region
        };

        this.props.createCallback(project);
    };

    render() {
        return (
            <Button bsStyle="success" bsSize="small" disabled={!this.props.canCreate} onClick={this.onClick}><Glyphicon
                glyph="plus"/> Create</Button>)
    }
}

interface IStartTaskComponentState {
    name?: string;
    nameValidation?: any;
    description?: string;
    rootPath?: string;
    rootPathValidation?: any;
    regionMinX?: number;
    regionMaxX?: number;
    regionMinY?: number;
    regionMaxY?: number;
    regionMinZ?: number;
    regionMaxZ?: number;
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
            regionMinX: -1,
            regionMaxX: -1,
            regionMinY: -1,
            regionMaxY: -1,
            regionMinZ: -1,
            regionMaxZ: -1,
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
        if (event.target.value.length === 0) {
            this.setState({sampleNumber: -1, alertVisible: false}, null);
            return;
        }
        let x = parseInt(event.target.value);
        if (!isNaN(x) && x >= 0) {
            this.setState({sampleNumber: x, alertVisible: false}, null);
        } else {
            this.setState({alertVisible: false}, null);
        }
    };

    onRegionMinXChange = (event: any) => {
        if (event.target.value.length === 0) {
            this.setState({regionMinX: -1, alertVisible: false}, null);
            return;
        }
        let x = parseInt(event.target.value);
        if (!isNaN(x) && x >= 0) {
            this.setState({regionMinX: x, alertVisible: false}, null);
        } else {
            this.setState({alertVisible: false}, null);
        }
    };

    onRegionMaxXChange = (event: any) => {
        if (event.target.value.length === 0) {
            this.setState({regionMaxX: -1, alertVisible: false}, null);
            return;
        }
        let x = parseInt(event.target.value);
        if (!isNaN(x) && x >= 0) {
            this.setState({regionMaxX: x, alertVisible: false}, null);
        } else {
            this.setState({alertVisible: false}, null);
        }
    };

    onRegionMinYChange = (event: any) => {
        if (event.target.value.length === 0) {
            this.setState({regionMinY: -1, alertVisible: false}, null);
            return;
        }
        let x = parseInt(event.target.value);
        if (!isNaN(x) && x >= 0) {
            this.setState({regionMinY: x, alertVisible: false}, null);
        } else {
            this.setState({alertVisible: false}, null);
        }
    };

    onRegionMaxYChange = (event: any) => {
        if (event.target.value.length === 0) {
            this.setState({regionMaxY: -1, alertVisible: false}, null);
            return;
        }
        let x = parseInt(event.target.value);
        if (!isNaN(x) && x >= 0) {
            this.setState({regionMaxY: x, alertVisible: false}, null);
        } else {
            this.setState({alertVisible: false}, null);
        }
    };

    onRegionMinZChange = (event: any) => {
        if (event.target.value.length === 0) {
            this.setState({regionMinZ: -1, alertVisible: false}, null);
            return;
        }
        let x = parseInt(event.target.value);
        if (!isNaN(x) && x >= 0) {
            this.setState({regionMinZ: x, alertVisible: false}, null);
        } else {
            this.setState({alertVisible: false}, null);
        }
    };

    onRegionMaxZChange = (event: any) => {
        if (event.target.value.length === 0) {
            this.setState({regionMaxZ: -1, alertVisible: false}, null);
            return;
        }
        let x = parseInt(event.target.value);
        if (!isNaN(x) && x >= 0) {
            this.setState({regionMaxZ: x, alertVisible: false}, null);
        } else {
            this.setState({alertVisible: false}, null);
        }
    };

    onCreateError = (err: any) => {
        console.log(err);
        this.setState({alertVisible: true}, null);
    };

    formatRegionValue = value => value < 0 ? "" : value.toString();

    render() {
        let nameHelp = this.state.name.length === 0 ? "Name can not be empty" : "";

        return (
            <Panel collapsible defaultExpanded header="Create Pipeline" bsStyle="info">
                <Grid fluid>
                    <Row>
                        <Col lg={2}>
                            <FormGroup bsSize="small" validationState={this.state.nameValidation}>
                                <ControlLabel>Name</ControlLabel>
                                <FormControl type="text" onChange={this.onNameChange} value={this.state.name}/>
                                <HelpBlock>{nameHelp}</HelpBlock>
                            </FormGroup>
                        </Col>
                        <Col lg={4}>
                            <FormGroup controlId="rootPathText" bsSize="small"
                                       validationState={this.state.rootPathValidation}>
                                <ControlLabel>Root Path</ControlLabel>
                                <FormControl type="text" onChange={this.onRootPathChange} value={this.state.rootPath}/>
                                <HelpBlock>The root path should be a path accessible from the server and workers</HelpBlock>
                            </FormGroup>
                        </Col>
                        <Col lg={4}>
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
                                             value={this.formatRegionValue(this.state.sampleNumber)}/>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={2}>
                            <FormGroup bsSize="small">
                                <ControlLabel>Grid Min X Index</ControlLabel>
                                <FormControl type="text" onChange={this.onRegionMinXChange}
                                             value={this.formatRegionValue(this.state.regionMinX)}/>
                            </FormGroup>
                        </Col>
                        <Col lg={2}>
                            <FormGroup bsSize="small">
                                <ControlLabel>Grid Max X Index</ControlLabel>
                                <FormControl type="text" onChange={this.onRegionMaxXChange}
                                             value={this.formatRegionValue(this.state.regionMaxX)}/>
                            </FormGroup>
                        </Col>
                        <Col lg={2}>
                            <FormGroup bsSize="small">
                                <ControlLabel>Grid Min Y Index</ControlLabel>
                                <FormControl type="text" onChange={this.onRegionMinYChange}
                                             value={this.formatRegionValue(this.state.regionMinY)}/>
                            </FormGroup>
                        </Col>
                        <Col lg={2}>
                            <FormGroup bsSize="small">
                                <ControlLabel>Grid Max Y Index</ControlLabel>
                                <FormControl type="text" onChange={this.onRegionMaxYChange}
                                             value={this.formatRegionValue(this.state.regionMaxY)}/>
                            </FormGroup>
                        </Col>
                        <Col lg={2}>
                            <FormGroup bsSize="small">
                                <ControlLabel>Grid Min Z Index</ControlLabel>
                                <FormControl type="text" onChange={this.onRegionMinZChange}
                                             value={this.formatRegionValue(this.state.regionMinZ)}/>
                            </FormGroup>
                        </Col>
                        <Col lg={2}>
                            <FormGroup bsSize="small">
                                <ControlLabel>Grid Max Z Index</ControlLabel>
                                <FormControl type="text" onChange={this.onRegionMaxZChange}
                                             value={this.formatRegionValue(this.state.regionMaxZ)}/>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={12}>
                            <HelpBlock>Leave any minimum value blank to include all indices up to the maximum, or any maximum value blank to include all indices above the minimum.  Leave both blank to include all indices in a given coordinate.</HelpBlock>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={1}>
                            <CreateProjectButton name={this.state.name} description={this.state.description}
                                                 rootPath={this.state.rootPath}
                                                 sampleNumber={this.state.sampleNumber}
                                                 regionMinX={this.state.regionMinX}
                                                 regionMaxX={this.state.regionMaxX}
                                                 regionMinY={this.state.regionMinY}
                                                 regionMaxY={this.state.regionMaxY}
                                                 regionMinZ={this.state.regionMinZ}
                                                 regionMaxZ={this.state.regionMaxZ}
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
