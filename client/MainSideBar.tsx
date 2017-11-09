import * as React from "react";
import {Link} from "react-router";

import {ListGroup} from "react-bootstrap";
import {SidebarMenuItem} from "./components/helpers/SidebarMenuItem";

export class MainSideBar extends React.Component<any, any> {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <div>
                    <h4>Visual</h4>
                    <ListGroup>
                        <SidebarMenuItem><Link activeStyle={{color: "#FFF"}}
                                               to="/dashboard">Status</Link></SidebarMenuItem>
                        <SidebarMenuItem><Link activeStyle={{color: "#FFF"}} to="/graph">Graph</Link></SidebarMenuItem>
                        <SidebarMenuItem><Link activeStyle={{color: "#FFF"}}
                                               to="/tilemap">Tile Map</Link></SidebarMenuItem>
                    </ListGroup>
                </div>
                <div>
                    <h4>Data</h4>
                    <ListGroup>
                        <SidebarMenuItem><Link activeStyle={{color: "#FFF"}}
                                               to="/projects">Projects</Link></SidebarMenuItem>
                        <SidebarMenuItem><Link activeStyle={{color: "#FFF"}}
                                               to="/stages">Stages</Link></SidebarMenuItem>
                        <SidebarMenuItem><Link activeStyle={{color: "#FFF"}}
                                               to="/workers">Workers</Link></SidebarMenuItem>
                        <SidebarMenuItem><Link to="/tasks">Tasks</Link></SidebarMenuItem>
                    </ListGroup>
                </div>
            </div>
        )
    }
}
