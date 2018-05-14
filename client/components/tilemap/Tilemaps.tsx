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
import {PipelineStagesMenu} from "../helpers/PipelineStagesMenu";

enum TileMapFormat {
    QueueStatus,
    SnapTile
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
    project: IProject;
    stageId: string;
    plane: number;
    planeQuery?: any;
    format: TileMapFormat;
}

interface _ITileMapsPState {
}

class _InnerTileMapPanel extends React.Component<_ITileMapsProps, _ITileMapsPState> {
    private choosePanel(project) {
        if (!project) {
            return (<h2>There is no selected pipeline</h2>);
        }

        if (!project.is_processing) {
            return (<h2>The selected pipeline must be running to view the tile map</h2>);
        }

        if (this.props.format === TileMapFormat.QueueStatus) {
            return (<TileMapPlotPanel project={project} plane={this.props.plane}
                                      projectPlaneTileStatus={this.props.planeQuery.projectPlaneTileStatus}/>)
        } else {
            return (<ThumbnailTileMap project={project} plane={this.props.plane} stageId={this.props.stageId}
                                      projectPlaneTileStatus={this.props.planeQuery.projectPlaneTileStatus}/>);
        }
    }

    public render() {
        return this.choosePanel(this.props.project);
    }
}

const InnerTileMapPanel = graphql<any, any>(PipelinePlaneQuery, {
    name: "planeQuery",
    options: ({project, plane}) => ({
        pollInterval: 5000,
        // fetchPolicy: "cache-and-network",
        variables: {
            project_id: project.id,
            plane: plane
        }
    })
})(_InnerTileMapPanel);

interface ITileMapsProps {
    data?: any;
}

interface ITileMapsPState {
    projectId?: string;
    stageId?: string;
    plane?: number;
    minZ: number;
    maxZ: number;
    format?: TileMapFormat;
}

export class _TileMapPanel extends React.Component<ITileMapsProps, ITileMapsPState> {
    public constructor(props) {
        super(props);

        this.state = {
            projectId: PreferencesManager.Instance.PreferredProjectId,
            stageId: null,
            plane: -1,
            minZ: 0,
            maxZ: 1e6,
            format: TileMapFormat.QueueStatus
        };
    }

    public componentDidMount() {
        if (this.state.projectId === AllProjectsId) {
            const projects = (this.props.data && !this.props.data.loading) ? this.props.data.projects : [];

            const processing = projects.filter(project => project.is_processing);

            if (processing.length > 0) {
                this.onProjectSelectionChange(processing[0].id);
            }
        } else {
            this.onProjectSelectionChange(this.state.projectId);
        }
    };

    public componentDidUpdate() {
        if (this.state.projectId === AllProjectsId) {
            const projects = (this.props.data && !this.props.data.loading && !this.props.data.error) ? this.props.data.projects : [];

            const processing = projects.filter(project => project.is_processing);

            if (processing.length > 0) {
                this.onProjectSelectionChange(processing[0].id);
            } else if (projects.length > 0) {
                this.onProjectSelectionChange(projects[0].id);
            }
        } else {
            this.onProjectSelectionChange(this.state.projectId);
        }
    };

    public componentWillUpdate(nextProps) {
        if (this.state.projectId.length > 0) {
            const allProjects = (nextProps.data && !nextProps.data.loading && !nextProps.data.error) ? nextProps.data.projects : [];

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

    private onChangeFormat(format: TileMapFormat) {
        this.setState({format});
    }

    private onProjectSelectionChange(eventKey, savePreferences = false) {
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

            let stageId = eventKey;

            if (project.stages.length > 0) {
                stageId = project.stages[0].id;
            }

            this.setState({projectId: eventKey, stageId, minZ: minZ, maxZ: maxZ, plane: minZ});

            if (savePreferences) {
                PreferencesManager.Instance.PreferredProjectId = eventKey;
            }
        }
    };

    private onStageSelectionChange(id: string) {
        this.setState({stageId: id});
    }

    private onFirst() {
        this.onPlaneChanged(this.state.minZ);
    };

    private onLast() {
        this.onPlaneChanged(this.state.maxZ);
    };

    private onPrev() {
        if (this.state.plane > this.state.minZ) {
            this.onPlaneChanged(this.state.plane - 1);
        }
    };

    private onNext() {
        if (this.state.plane < this.state.maxZ) {
            this.onPlaneChanged(this.state.plane + 1);
        }
    };

    private onJumpBack() {
        let p = this.state.plane - 10;
        if (p < this.state.minZ) {
            p = this.state.minZ;
        }
        this.onPlaneChanged(p);
    };

    private onJumpForward() {
        let p = this.state.plane + 10;
        if (p > this.state.maxZ) {
            p = this.state.maxZ;
        }
        this.onPlaneChanged(p);
    };

    private renderFormatMenu() {
        const title = this.state.format === TileMapFormat.QueueStatus ? "Queue Status" : "SnapTile";

        return (
            <Dropdown item text={title}>
                <Dropdown.Menu>
                    <Dropdown.Item key={TileMapFormat.QueueStatus}
                                   onClick={() => this.onChangeFormat(TileMapFormat.QueueStatus)}>
                        Queue Status
                    </Dropdown.Item>
                    <Dropdown.Item key={TileMapFormat.SnapTile}
                                   onClick={() => this.onChangeFormat(TileMapFormat.SnapTile)}>
                        Snaptile
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        );
    }

    public render() {
        if (this.props.data.error) {
            return (<span>{this.props.data.error.message}</span>);
        }

        console.log(this.props.data);

        const loading = !this.props.data || this.props.data.loading;

        if (loading) {
            return (
                <div style={{display: "flex", height: "100%", alignItems: "center"}}>
                    <Loader active inline="centered">Loading</Loader>
                </div>
            );
        }

        let project = null;

        const projects = this.props.data.projects.filter(project => project.id === this.state.projectId);

        if (projects.length > 0) {
            project = projects[0];
        } else {
            return (<h2>There are no available pipelines</h2>);
        }

        const props = {
            project,
            stageId: this.state.stageId || project.id,
            plane: this.state.plane,
            format: this.state.format,
            onProjectSelectionChange: (id: string, b: boolean) => this.onProjectSelectionChange(id, b),
            onPlaneChanged: (plane: number) => this.onPlaneChanged(plane)
        };

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
                    <ProjectMenu style={{width: "200px"}} keyPrefix="tileMap" projects={this.props.data.projects}
                                 selectedProjectId={this.state.projectId}
                                 onProjectSelectionChange={(project) => this.onProjectSelectionChange(project, true)}
                                 includeAllProjects={false}>

                    </ProjectMenu>
                    {this.renderFormatMenu()}
                    {project !== null && this.state.format === TileMapFormat.SnapTile ?
                        <PipelineStagesMenu style={{width: "200px"}} keyPrefix="tileMap" stages={project.stages}
                                            selectedStageId={this.state.stageId || project.id}
                                            onStageSelectionChange={(s) => this.onStageSelectionChange(s)}
                                            projectId={project.id}
                                            includeProject={true}>

                        </PipelineStagesMenu> : null}
                    <Menu.Menu position="right">
                        <Menu.Item>{`Current Z Index:  ${this.state.plane}`}</Menu.Item>
                        <Menu.Item icon="fast backward" onClick={() => this.onFirst()}/>
                        <Menu.Item icon="step backward" onClick={() => this.onJumpBack()}/>
                        <Menu.Item icon="play" style={{transform: "rotate(180deg)"}} onClick={() => this.onPrev()}/>
                        <Menu.Item icon="play" onClick={() => this.onNext()}/>
                        <Menu.Item icon="step forward" onClick={() => this.onJumpForward()}/>
                        <Menu.Item icon="fast forward" onClick={() => this.onLast()}/>
                    </Menu.Menu>
                </Menu>
                <InnerTileMapPanel {...props}/>
            </Container>
        );
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

