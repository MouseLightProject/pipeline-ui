import * as React from "react";
import {graphql} from "react-apollo";
import {Container, Loader, Menu, Header, Dropdown} from "semantic-ui-react"

const HighCharts = require("highcharts");
require("highcharts/modules/heatmap")(HighCharts);
require("highcharts/modules/map")(HighCharts);

import {AllProjectsId, ProjectMenu} from "../helpers/ProjectMenu";
import {PreferencesManager} from "../../util/preferencesManager";
import {themeHighlight} from "../../util/styleDefinitions";
import {PipelinePlaneQuery, ProjectsQuery} from "../../graphql/project";
import {TileMapPlotPanel} from "./StageTileMap";
import {ThumbnailTileMap} from "./ThumbnailTileMap";
import {IProject} from "../../models/project";
import {TilePipelineStatus} from "../../models/tilePipelineStatus";

enum TileMapFormat {
    QueueStatus,
    Thumbnail
}

export interface IStageStatus {
    stage_id: string;
    depth: number;
    status: TilePipelineStatus;
}

export interface ITileStatus {
    x_index: number;
    y_index: number;
    stages: IStageStatus[];
}

interface _ITileMapsProps {
    projects: IProject[];
    projectId: string;
    plane: number;
    planeQuery?: any;
    minZ: number;
    maxZ: number;

    onProjectSelectionChange(id: string, savePreferences: boolean): void;
    onPlaneChanged(plane: number): void;
}

interface _ITileMapsPState {
    format?: TileMapFormat;
}

class _InnerTileMapPanel extends React.Component<_ITileMapsProps, _ITileMapsPState> {
    public constructor(props) {
        super(props);

        this.state = {
            format: TileMapFormat.QueueStatus
        };
    }

    onFirst = () => {
        this.props.onPlaneChanged(this.props.minZ);
    };

    onLast = () => {
        this.props.onPlaneChanged(this.props.maxZ);
    };

    onPrev = () => {
        if (this.props.plane > this.props.minZ) {
            this.props.onPlaneChanged(this.props.plane - 1);
        }
    };

    onNext = () => {
        if (this.props.plane < this.props.maxZ) {
            this.props.onPlaneChanged(this.props.plane + 1);
        }
    };

    onJumpBack = () => {
        let p = this.props.plane - 10;
        if (p < this.props.minZ) {
            p = this.props.minZ;
        }
        this.props.onPlaneChanged(p);
    };

    onJumpForward = () => {
        let p = this.props.plane + 10;
        if (p > this.props.maxZ) {
            p = this.props.maxZ;
        }
        this.props.onPlaneChanged(p);
    };

    private onChangeFormat(format: TileMapFormat) {
        this.setState({format});
    }

    private choosePanel(projects) {
        if (!projects) {
            return (<h2>There are no projects</h2>);
        }

        projects = projects.filter(project => project.id === this.props.projectId);

        if (!projects || projects.length === 0) {
            return (<h2>There is no selected pipeline</h2>);
        }

        if (!projects[0].is_processing) {
            return (<h2>The selected pipeline must be running to view the tile map</h2>);
        }

        if (this.state.format === TileMapFormat.QueueStatus) {
            return (<TileMapPlotPanel project={projects[0]} plane={this.props.plane}
                                      projectPlaneTileStatus={this.props.planeQuery.projectPlaneTileStatus}/>)
        } else {
            return (<ThumbnailTileMap project={projects[0]} plane={this.props.plane} projectPlaneTileStatus={this.props.planeQuery.projectPlaneTileStatus}/>);
        }
    }

    private renderFormatMenu() {
        const title = this.state.format === TileMapFormat.QueueStatus ? "Queue Status" : "Thumbnail";

        return (
            <Dropdown item text={title}>
                <Dropdown.Menu>
                    <Dropdown.Item key={TileMapFormat.QueueStatus}
                                   onClick={() => this.onChangeFormat(TileMapFormat.QueueStatus)}>
                        Queue Status
                    </Dropdown.Item>
                    <Dropdown.Item key={TileMapFormat.Thumbnail}
                                   onClick={() => this.onChangeFormat(TileMapFormat.Thumbnail)}>
                        Thumbnail
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        );
    }

    public render() {
        const projects = this.props.projects;

        return (
            <Container fluid style={{height: "100%"}}>
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
                                 selectedProjectId={this.props.projectId}
                                 onProjectSelectionChange={(project) => this.props.onProjectSelectionChange(project, true)}
                                 includeAllProjects={false}>

                    </ProjectMenu>
                    {this.renderFormatMenu()}
                    <Menu.Menu position="right">
                        <Menu.Item>{`Current Z Index:  ${this.props.plane}`}</Menu.Item>
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

const InnerTileMapPanel = graphql<any, any>(PipelinePlaneQuery, {
    name: "planeQuery",
    options: ({projectId, plane}) => ({
        pollInterval: 5000,
        variables: {
            project_id: projectId,
            plane: plane
        }
    })
})(_InnerTileMapPanel);

interface ITileMapsProps {
    data?: any;
}

interface ITileMapsPState {
    projectId?: string;
    plane?: number;
    minZ: number;
    maxZ: number;
}

export class _TileMapPanel extends React.Component<ITileMapsProps, ITileMapsPState> {
    public constructor(props) {
        super(props);

        this.state = {
            projectId: PreferencesManager.Instance.PreferredProjectId,
            plane: -1,
            minZ: 0,
            maxZ: 1e6
        };
    }

    public componentDidMount() {
        if (this.state.projectId === AllProjectsId) {
            const projects = (this.props.data && !this.props.data.loading) ? this.props.data.projects : [];

            const processing = projects.filter(project => project.is_processing);

            if (processing.length > 0) {
                this.onProjectSelectionChange(processing[0].id);
            }
        }
    };

    public componentDidUpdate() {
        if (this.state.projectId === AllProjectsId) {
            const projects = (this.props.data && !this.props.data.loading) ? this.props.data.projects : [];

            const processing = projects.filter(project => project.is_processing);

            if (processing.length > 0) {
                this.onProjectSelectionChange(processing[0].id);
            } else if (projects.length > 0) {
                this.onProjectSelectionChange(projects[0].id);
            }
        }
    };

    public componentWillUpdate(nextProps) {
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

    public render() {
        const loading = !this.props.data || this.props.data.loading;

        if (loading) {
            return (
                <div style={{display: "flex", height: "100%", alignItems: "center"}}>
                    <Loader active inline="centered">Loading</Loader>
                </div>
            );
        }

        const props = {
            projects: this.props.data.projects,
            projectId: this.state.projectId,
            plane: this.state.plane,
            minZ: this.state.minZ,
            maxZ: this.state.maxZ,
            onProjectSelectionChange: (id: string, b: boolean) => this.onProjectSelectionChange(id, b),
            onPlaneChanged: (plane: number) => this.onPlaneChanged(plane)
        };

        return (
            <InnerTileMapPanel {...props}/>
        )
    }

    private onPlaneChanged(plane: number) {
        this.setState({plane});
    };
}

export const TileMapPanel = graphql<any, any>(ProjectsQuery, {
    options: {
        pollInterval: 10 * 1000
    }
})(_TileMapPanel);

