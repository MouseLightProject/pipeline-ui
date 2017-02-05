import * as React from "react";
import * as Radium from "radium";

import {ICountTileProps, CountUnit} from "./CountTile";

@Radium
export class NavTile extends React.Component<ICountTileProps, any> {
    constructor(props) {
        super(props);
    }

    render() {
        const units = this.props.units === CountUnit.Percent ? "%" : "";

        let countMessage = "";

        if (isNaN(this.props.count)) {
            countMessage = "N/A";
        } else {
            countMessage = `${this.props.count.toFixed(this.props.precision || 0)}${units}`;
        }

        return (
            <div className="nav_tile_stats_count" style={statsContainerStyle}>
                <span style={statsCountSpanStyle}>{this.props.title}</span>
                <div style={statsCountStyle}>{countMessage}</div>
            </div>
        );
    }
}

const statsContainerStyle = {
    borderBottom: 0,
    padding: "4px",
    position: "relative",
    whiteSpace: "nowrap",
    overflow: "hidden",
    margin: 0,
    minWidth: "100px"
};

const statsCountSpanStyle = {
    fontSize: "12px",
};

const statsCountStyle = {
    fontSize: "18px",
    fontWeight: 500
};
