import * as React from "react";
import {Panel} from "react-bootstrap"

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

interface ITaskDefinitionHelpProps {
}

interface ITaskDefinitionState {
}

export class TasksHelpPanel extends React.Component<ITaskDefinitionHelpProps, ITaskDefinitionState> {
    private renderHeader() {
        return (<div style={styles.flexContainer}><h4 style={styles.flexItem}>Help</h4>
            <div style={styles.flexItemRight}/>
        </div>);
    }

    public render() {
        return (
            <Panel header={this.renderHeader()} bsStyle="info">
                <div style={{padding: "10px"}}>
                </div>
            </Panel>
        );
    }
}
