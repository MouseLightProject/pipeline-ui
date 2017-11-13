import * as React from "react";
import MediaQuery from "react-responsive";

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

export class CountTile extends React.Component<ICountTileProps, any> {
    public constructor(props) {
        super(props);
    }

    public renderTile(message: string, style: any) {
        return (
            <div className="tile_stats_count" style={style}>
                <span style={noteStyle}>{this.props.title}</span>
                <div style={messageStyle}>{message}</div>
                <span style={noteStyle}>{this.props.message || ""}</span>
            </div>
        );
    }

    public render() {
        const units = this.props.units === CountUnit.Percent ? "%" : "";

        let countMessage = "";

        if (isNaN(this.props.count)) {
            countMessage = "N/A";
        } else {
            countMessage = `${this.props.count.toFixed(this.props.precision || 0)}${units}`;
        }

        return (
            <div>
                <MediaQuery minWidth={1200}>
                    {this.renderTile(countMessage, statsContainerStyleWide)}
                </MediaQuery>
                <MediaQuery maxWidth={1199}>
                    {this.renderTile(countMessage, statsContainerStyleNarrow)}
                </MediaQuery>
            </div>
        );
    }
}

const overflow: "hidden" | "auto" = "hidden";

const position: "initial" | "relative" = "relative";

const fontWeight: 500 | 600 = 600;

const statsContainerStyleNarrow = {
    borderBottom: "1px solid #D9DEE4",
    padding: "10px 20px 10px 20px",
    position,
    whiteSpace: "nowrap",
    overflow,
    minHeight: "110px",
};

const statsContainerStyleWide = {
    borderBottom: "none",
    padding: " 10px 20px 00px 20px",
    position,
    whiteSpace: "nowrap",
    overflow,
    minHeight: "110px",
    marginBottom: "10px"
};

const messageStyle = {
    fontSize: "30px",
    lineHeight: "47px",
    fontWeight
};

const noteStyle = {
    fontSize: "11px"
};
