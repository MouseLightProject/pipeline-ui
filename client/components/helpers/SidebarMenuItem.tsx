import * as React from "react";

export class SidebarMenuItem extends React.Component<any, any> {
    render() {
        return (
            <div className="list-group-item list-group-item-menu">
                {this.props.children}
            </div>
        );
    }
}
