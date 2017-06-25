import * as React from "react";
import {ICountTileProps, CountUnit} from "./CountTile";

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

const overflow: "hidden" | "auto" = "hidden";

const position: "initial" | "relative" = "relative";

const fontWeight: "inherit" | 500 = 500;

const statsContainerStyle = {
    borderBottom: 0,
    padding: "4px",
    position,
    whiteSpace: "nowrap",
    overflow,
    margin: 0,
    minWidth: "100px"
};

const statsCountSpanStyle = {
    fontSize: "12px",
};

const statsCountStyle = {
    fontSize: "18px",
    fontWeight
};
