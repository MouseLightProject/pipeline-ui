import * as React from "react";
import {Image, Menu, Label, Icon} from "semantic-ui-react";
import {HeaderSummary} from "../dashboard/HeaderSummary";
import {IProject} from "../../models/project";
import {IWorker} from "../../models/worker";
import {ISchedulerHealth} from "../../models/schedulerHealth";

const logoImage = require("../../assets/mouselight-pipeline.svg");
const logoImageSmall = require("../../assets/mouselight-pipeline-sm.svg");

interface IMenuLayoutProps {
    projects: IProject[];
    workers: IWorker[];
    isSidebarExpanded: boolean;
    isActivePipeline: boolean;
    schedulerHealth: ISchedulerHealth;

    onToggleSidebar(): void;
}

interface IMenuLayoutState {
}

export class MenuLayout extends React.Component<IMenuLayoutProps, IMenuLayoutState> {
    private onToggleSidebar(evt: any) {
        evt.stopPropagation();
        evt.preventDefault();

        this.props.onToggleSidebar();
    }

    private renderSchedulerHealth() {
        if (this.props.schedulerHealth && this.props.schedulerHealth.lastResponse === 200) {
            return (
                <Label color="green">
                    <Icon name={"check"} color="black"/>
                    Scheduler is online
                </Label>
            );
        } else {
            return (
                <Label color="red">
                    <Icon name={"exclamation"} color="black"/>
                    {`Scheduler Offline ${this.props.schedulerHealth.lastSeen ? "(last seen " + new Date(this.props.schedulerHealth.lastSeen).toLocaleString() + ")" : ""}`}
                </Label>
            );
        }
    }

    public render() {
        const logo = this.props.isSidebarExpanded ? logoImage : logoImageSmall;

        const width = this.props.isSidebarExpanded ? 200 : 80;

        return (
            <Menu inverted fluid className="main-menu" fixed="top">
                <Menu.Item onClick={(evt) => this.onToggleSidebar(evt)}
                           style={{
                               padding: "2px",
                               width: width + "px",
                               backgroundColor: "rgb(41, 41, 41)",
                               transition: "all 0.3s ease"
                           }}>
                    <Image size="small" src={logo} style={{height: "100%", width: width + "px"}}/>
                </Menu.Item>
                <Menu.Item>
                    <Label color={this.props.isActivePipeline ? "green" : "orange"}>
                        <Icon name={this.props.isActivePipeline ? "check" : "exclamation"} color="black"/>
                        {this.props.isActivePipeline ? "Active Pipeline" : "Inactive Pipeline"}
                    </Label>
                </Menu.Item>
                <Menu.Item>
                    {this.renderSchedulerHealth()}
                </Menu.Item>
                <Menu.Menu position="right">
                    <HeaderSummary projects={this.props.projects} workers={this.props.workers} isNavTile={true}/>
                </Menu.Menu>
            </Menu>
        );
    }
}
