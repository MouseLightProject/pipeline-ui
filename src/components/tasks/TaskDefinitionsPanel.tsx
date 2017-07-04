import * as React from "react";
import {Panel} from "react-bootstrap"

import {ITaskDefinition} from "../../models/QueryInterfaces";
import {TaskDefinitionsTable} from "./TaskDefinitionTable";

const styles = {
    flexContainer: {
        display: "flex"
    },
    flexItem: {
        display: "inline",
        marginRight: "auto",
        marginTop: "auto",
        marginBottom: "auto",
        fontSize: "17px"
    },
    flexItemRight: {
        alignSelf: "flex-end" as "flex-end",
        marginTop: "auto",
        marginBottom: "auto",
        background: "transparent",
        color: "white",
        border: "none",
        height: "26px"
    }
};

interface ITaskDefinitionPanelProps {
    taskDefinitions: ITaskDefinition[];
}

interface ITaskDefinitionPanelState {
}

export class TaskDefinitionsPanel extends React.Component<ITaskDefinitionPanelProps, ITaskDefinitionPanelState> {
    private renderHeader() {
        return (<div style={styles.flexContainer}><h4 style={styles.flexItem}>Task Definitions</h4><div style={styles.flexItemRight}/></div>);
    }

    public render() {
        return (
            <Panel header={this.renderHeader()} bsStyle="primary">
                <TaskDefinitionsTable taskDefinitions={this.props.taskDefinitions }/>
            </Panel>
        );
    }
}
