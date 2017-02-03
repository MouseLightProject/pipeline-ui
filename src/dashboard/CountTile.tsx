import * as React from "react";
import * as Radium from "radium";

export interface ICountTileProps {
    title: string;
    count: number;
    message: string;
}

@Radium
export class CountTile extends React.Component<ICountTileProps, any> {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="tile_stats_count" style={statsContainerStyle}>
                <span style={statsCountSpanStyle}>{this.props.title}</span>
                <div style={statsCountStyle}>{this.props.count}</div>
                <span style={statsCountSpanStyle}>{this.props.message}</span>
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

    "@media (min-width:992px)": {
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
        fontSize: "40px"
    },

    "@media (min-width:992px) and (max-width:1100px)": {
        fontSize: "30px"
    }
};
