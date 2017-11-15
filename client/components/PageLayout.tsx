import * as React from "react";
import {Route, Redirect, Switch, NavLink} from "react-router-dom";
import {Container, Icon, Menu, SemanticICONS} from "semantic-ui-react"
import {ToastContainer} from "react-toastify";

import {MenuLayout} from "./header/MenuLayout";

import {PipelineTileMapHighCharts} from "./tilemap/PipelineTileMapHighCharts";
import {PipelineGraph} from "./graph/PipelineGraph";
import {Workers} from "./workers/Workers";
import {TasksPanel} from "./tasks/Tasks";
import {PipelineStages} from "./stages/PipelineStages";
import {Projects} from "./projects/Projects";
import {Dashboard} from "./Dashboard";
import {PreferencesManager} from "../util/preferencesManager";

const toastStyleOverride = {
    minWidth: "600px",
    marginBottom: "40px"
};

const menuItems = [{
    path: "/",
    name: "Home",
    icon: "home"
}, {
    path: "/graphs",
    name: "Project Graphs",
    icon: "sitemap"
}, {
    path: "/tilemaps",
    name: "Tile Maps",
    icon: "block layout"
}, {
    path: "/projects",
    name: "Projects",
    icon: "cube"
}, {
    path: "/stages",
    name: "Stages",
    icon: "cubes"
}, {
    path: "/tasks",
    name: "Tasks",
    icon: "puzzle"
}, {
    path: "/workers",
    name: "Workers",
    icon: "server"
}];

interface IPageLayoutProps {
}

interface IPageLayoutState {
    isSidebarExpanded?: boolean;
}

export class PageLayout extends React.Component<IPageLayoutProps, IPageLayoutState> {
    public constructor(props) {
        super(props);

        this.state = {
            isSidebarExpanded: PreferencesManager.Instance.IsProjectTableFiltered
        }
    }

    private onToggleSidebar() {
        PreferencesManager.Instance.IsProjectTableFiltered = !this.state.isSidebarExpanded;
        this.setState({isSidebarExpanded: !this.state.isSidebarExpanded});
    }

    public render() {
        const width = this.state.isSidebarExpanded ? 199 : 79;
        const icon = this.state.isSidebarExpanded ? "labeled" : true;

        const menus = menuItems.map(m => {
            return (
                <Menu.Item as={NavLink} exact to={m.path} name={m.name} key={m.name}>
                    <Icon name={m.icon as SemanticICONS}/>
                    {this.state.isSidebarExpanded ? m.name : null}
                </Menu.Item>
            );
        });

        return (
            <div style={{height: "100%"}}>
                <ToastContainer autoClose={6000} position="bottom-center" style={toastStyleOverride}/>
                <MenuLayout isSidebarExpanded={this.state.isSidebarExpanded}
                            onToggleSidebar={() => this.onToggleSidebar()}/>
                <div style={{
                    display: "flex",
                    minHeight: "calc(100% - 62px)",
                    margin: 0,
                    overflow: "hidden",

                }}>
                    <Menu vertical inverted icon={icon}
                          style={{
                              order: 0,
                              flex: "0 0 auto",
                              width: width + "px",
                              minHeight: "100%",
                              transition: "all 0.3s ease"
                          }}>
                        {menus}
                    </Menu>
                    <Container style={{order: 1, flex: "1 1 auto", backgroundColor: "rgb(244, 247, 250)", width: "100%"}}>
                        <Switch>
                            <Route path="/" exact component={Dashboard}/>
                            <Route path="/graphs" component={PipelineGraph}/>
                            <Route path="/tilemaps" component={PipelineTileMapHighCharts}/>
                            <Route path="/projects" component={Projects}/>
                            <Route path="/stages" component={PipelineStages}/>
                            <Route path="/tasks" component={TasksPanel}/>
                            <Route path="/workers" component={Workers}/>
                            <Redirect to="/"/>
                        </Switch>
                    </Container>
                </div>
            </div>
        )
    }
}
