import * as React from "react";
import {Container, Menu, Header} from "semantic-ui-react";

import {WorkerTable} from "./WorkerTable";
import {IWorker} from "../../models/worker";
import {themeHighlight} from "../../util/styleDefinitions";

interface IWorkersProps {
    workers: IWorker[];
}

export const WorkersPanel = (props: IWorkersProps) => {
    return (
        <Container fluid style={{display: "flex", flexDirection: "column"}}>
            {renderMainMenu()}
            <WorkerTable workers={props.workers} style={{padding: "20px"}}/>
        </Container>
    );
};

function renderMainMenu() {
    return (
        <Menu style={{borderTop: "none", borderLeft: "none", borderRight: "none", borderRadius: 0, boxShadow: "none"}}>
            <Menu.Header>
                <div style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: "10px",
                    paddingTop: "4px"
                }}>
                    <Header style={{color: themeHighlight}}>
                        Workers
                    </Header>
                </div>
            </Menu.Header>
        </Menu>
    );
}
