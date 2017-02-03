import * as React from "react";

import {HeaderSummaryWithQuery} from "./dashboard/HeaderSummary";

export class Dashboard extends React.Component<any, any> {
    render() {
        return (
            <div>
                <HeaderSummaryWithQuery/>
                <div className="text-center">
                    <h1>Under Development</h1>
                </div>
            </div>
        );
    }
}