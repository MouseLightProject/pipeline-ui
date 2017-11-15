import * as React from "react";
import {graphql} from "react-apollo";
import {Container, Loader, Menu, Header} from "semantic-ui-react"

const HighCharts = require("highcharts");
require("highcharts/modules/heatmap")(HighCharts);
require("highcharts/modules/map")(HighCharts);

import {AllProjectsId, ProjectMenu} from "../helpers/ProjectMenu";
import {PreferencesManager} from "../../util/preferencesManager";
import {themeHighlight} from "../../util/styleDefinitions";
import {ProjectsQuery} from "../../graphql/project";
import {TileMapPlotPanel} from "./PipelineTileMapHighCharts";

class _TileMapPanel extends React.Component<any, any> {
    constructor(props) {
        super(props);

        this.state = {
            projectId: PreferencesManager.Instance.PreferredProjectId,
            minZ: 0,
            maxZ: 1e6,
            plane: -1,
        };
    }

    componentDidMount() {
        if (this.state.projectId === AllProjectsId) {
            const projects = (this.props.data && !this.props.data.loading) ? this.props.data.projects : [];

            const processing = projects.filter(project => project.is_processing);

            if (processing.length > 0) {
                this.onProjectSelectionChange(processing[0].id);
            }
        }
    };

    componentDidUpdate() {
        if (this.state.projectId === AllProjectsId) {
            const projects = (this.props.data && !this.props.data.loading) ? this.props.data.projects : [];

            const processing = projects.filter(project => project.is_processing);

            if (processing.length > 0) {
                this.onProjectSelectionChange(processing[0].id);
            } else if (this.state.projectId === "" && projects.length > 0) {
                this.onProjectSelectionChange(projects[0].id);
            }
        }
    };

    componentWillUpdate(nextProps) {
        if (this.state.projectId.length > 0) {
            const allProjects = (nextProps.data && !nextProps.loading) ? nextProps.data.projects : [];

            const projects = allProjects.filter(project => project.id === this.state.projectId);

            if (projects.length > 0) {
                const project = projects[0];
                let minZ = 0;
                let maxZ = 1e6;
                let plane = this.state.plane;

                if (project.region_z_min !== null) {
                    minZ = project.region_z_min;
                }
                else if (project.sample_z_min !== null) {
                    minZ = project.sample_z_min;
                }

                if (project.region_z_max !== null) {
                    maxZ = project.region_z_max;
                }
                else if (project.sample_z_max !== null) {
                    maxZ = project.sample_z_max;
                }

                if (plane < minZ) {
                    plane = minZ;
                } else if (plane > maxZ) {
                    plane = maxZ;
                }

                if (minZ != this.state.minZ || maxZ != this.state.maxZ || plane != this.state.plane) {
                    this.setState({minZ: minZ, maxZ: maxZ, plane: plane}, null);
                }
            }
        }
    }

    onProjectSelectionChange = (eventKey, savePreferences = false) => {
        let projects = (this.props.data && !this.props.data.loading) ? this.props.data.projects : [];

        projects = projects.filter(x => x.id === eventKey);

        let minZ = 0;
        let maxZ = 1e6;

        if (projects.length > 0 && projects[0].id !== this.state.projectId) {
            const project = projects[0];

            if (project.region_z_min !== null) {
                minZ = project.region_z_min;
            }
            else if (project.sample_z_min !== null) {
                minZ = project.sample_z_min;
            }

            if (project.region_z_max !== null) {
                maxZ = project.region_z_max;
            }
            else if (project.sample_z_max !== null) {
                maxZ = project.sample_z_max;
            }

            this.setState({projectId: eventKey, minZ: minZ, maxZ: maxZ, plane: minZ}, null);

            if (savePreferences) {
                PreferencesManager.Instance.PreferredProjectId = eventKey;
            }
        }
    };

    onFirst = () => {
        this.setState({plane: this.state.minZ}, null);
    };

    onLast = () => {
        this.setState({plane: this.state.maxZ}, null);
    };

    onPrev = () => {
        if (this.state.plane > this.state.minZ) {
            this.setState({plane: this.state.plane - 1}, null);
        }
    };

    onNext = () => {
        if (this.state.plane < this.state.maxZ) {
            this.setState({plane: this.state.plane + 1}, null);
        }
    };

    onJumpBack = () => {
        let p = this.state.plane - 10;
        if (p < this.state.minZ) {
            p = this.state.minZ;
        }
        this.setState({plane: p}, null);
    };

    onJumpForward = () => {
        let p = this.state.plane + 10;
        if (p > this.state.maxZ) {
            p = this.state.maxZ;
        }
        this.setState({plane: p}, null);
    };

    private choosePanel(projects) {
        if (!projects) {
            return (<h2>There are no projects</h2>);
        }

        projects = projects.filter(project => project.id === this.state.projectId);

        if (!projects || projects.length === 0) {
            return (<h2>There is no selected pipeline</h2>);
        }

        if (!projects[0].is_processing) {
            return (<h2>The selected pipeline must be running to view the tile map</h2>);
        }

        return (<TileMapPlotPanel project_id={this.state.projectId} plane={this.state.plane}/>)
    }

    public render() {
        const loading = !this.props.data || this.props.data.loading;

        if (loading) {
            return (
                <div style={{display: "flex", height: "100%", alignItems: "center"}}>
                    <Loader active inline="centered">Loading</Loader>
                </div>
            );
        }

        const projects = !loading ? this.props.data.projects : [];

        return (
            <Container fluid>
                <Menu style={{marginBottom: "15px"}}>
                    <Menu.Header>
                        <div style={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            paddingLeft: "10px",
                            paddingRight: "10px",
                            paddingTop: "4px"
                        }}>
                            <Header style={{color: themeHighlight}}>
                                Tile Maps
                            </Header>
                        </div>
                    </Menu.Header>
                    <Menu.Item style={{padding: 0}}/>
                    <ProjectMenu style={{width: "200px"}} keyPrefix="tileMap" projects={projects}
                                 selectedProjectId={this.state.projectId}
                                 onProjectSelectionChange={(project) => this.onProjectSelectionChange(project, true)}
                                 includeAllProjects={false}>

                    </ProjectMenu>
                    <Menu.Menu position="right">
                        <Menu.Item>{`Current Z Index:  ${this.state.plane}`}</Menu.Item>
                        <Menu.Item icon="fast backward" onClick={this.onFirst}/>
                        <Menu.Item icon="step backward" onClick={this.onJumpBack}/>
                        <Menu.Item icon="play" style={{transform: "rotate(180deg)"}} onClick={this.onPrev}/>
                        <Menu.Item icon="play" onClick={this.onNext}/>
                        <Menu.Item icon="step forward" onClick={this.onJumpForward}/>
                        <Menu.Item icon="fast forward" onClick={this.onLast}/>
                    </Menu.Menu>
                </Menu>
                {this.choosePanel(projects)}
            </Container>
        );
    }
}

export const TileMapPanel = graphql<any, any>(ProjectsQuery, {
    options: {
        pollInterval: 5 * 1000
    }
})(_TileMapPanel);