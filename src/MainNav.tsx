import * as React from "react";
import {Navbar, Nav} from "react-bootstrap";
import Sidebar from "react-sidebar";
import {ToastContainer} from "react-toastify";

import {MainSideBar} from "./MainSideBar";
import {HeaderSummary} from "./components/dashboard/HeaderSummary";

const toastStyleOverride = {
    minWidth: "600px",
    marginBottom: "40px"
}

export class MainNav extends React.Component<any, any> {
    public render() {
        const navBarStyle = {
            height: "60px",
            color: "#23527C",
            backgroundColor: "rgba(236, 236, 236, 0.95)",
            borderBottom: "1px solid #DEDEDE"
        };
        const sidebarStyle = {
            sidebar: {
                color: "white",
                position: "fixed",
                marginTop: "60px",
                backgroundColor: "#294054",
                //transition: "transform .3s ease-out",
                // WebkitTransition: "-webkit-transform .3s ease-out",
                //willChange: "transform",
                overflowY: "auto",
                width: "230px",
                padding: "16px"
            },
            content: {
                padding: "0px",
                paddingTop: "60px",
                backgroundColor: "#F7F7F7EE",
                color: "#5A738E",
                // transition: "left .3s ease-out, right .3s ease-out",
            }
        };

        const sidebarContent = <MainSideBar/>;

        return (
            <div>
                <ToastContainer autoClose={6000} position="bottom-center" style={toastStyleOverride}/>
                <Navbar fixedTop fluid={true} style={navBarStyle}>
                    <Navbar.Header>
                        <Navbar.Brand  style={navBarStyle}>
                            Mouse Light<br/><small>Acquisition Pipelines</small>
                        </Navbar.Brand>
                    </Navbar.Header>
                    <Nav pullRight>
                        <HeaderSummary isNavTile={true}/>
                    </Nav>
                </Navbar>
                <Sidebar styles={sidebarStyle} sidebar={sidebarContent} open docked shadow={false} transitions={false}>
                    {this.props.pages}
                </Sidebar>
            </div>
        );
    }
}
