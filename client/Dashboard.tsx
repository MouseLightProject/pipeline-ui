import * as React from "react";

import {HeaderSummary} from "./components/dashboard/HeaderSummary";

export class Dashboard extends React.Component<any, any> {
    render() {
        return (
            <div>
                <HeaderSummary/>
                <div className="text-center">
                    <h1>Under Development</h1>
                </div>
            </div>
        );
    }
}