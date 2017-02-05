import * as React from "react";
import * as Radium from "radium";

export enum CountUnit {
    None,
    Percent
}

export interface ICountTileProps {
    title: string;
    count: number;
    units?: CountUnit;
    precision?: number;
    message?: string;
}

@Radium
export class CountTile extends React.Component<ICountTileProps, any> {
    constructor(props) {
        super(props);
    }

    render() {
        const units = this.props.units === CountUnit.Percent ? "%" : "";

        return (
            <div className="tile_stats_count" style={statsContainerStyle}>
                <span style={statsCountSpanStyle}>{this.props.title}</span>
                <div style={statsCountStyle}>{`${this.props.count.toFixed(this.props.precision || 0)}${units}`}</div>
                <span style={statsCountSpanStyle}>{this.props.message || ""}</span>
            </div>
        );
    }
}

const statsContainerStyle = {
    borderBottom: "1px solid #D9DEE4",
    padding: " 10px 20px 10px 20px",
    position: "relative",
    whiteSpace: "nowrap",
    overflow: "hidden",

    "@media (min-width:1200px)": {
        marginBottom: "10px",
        borderBottom: 0,
        paddingBottom: "10px"
    }
};

const statsCountSpanStyle = {
    fontSize: "10px",

    "@media (min-width:992px)": {
        fontSize: "11px"
    },

    "@media (min-width:1200px)": {
        fontSize: "11px"
    }
};

const statsCountStyle = {
    fontSize: "30px",
    lineHeight: "47px",
    fontWeight: 600,

    "@media (min-width:768px)": {
        fontSize: "30px"
    },

    "@media (min-width:992px) and (max-width:1200px)": {
        fontSize: "40px"
    },

    "@media (min-width:1200px)": {
        fontSize: "30px"
    },
};
