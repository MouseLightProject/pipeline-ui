import * as React from "react";
import {Menu, Icon} from "semantic-ui-react";

export interface INamedItem {
    name?: string;
}

export interface ITableSelectionHeaderProps {
    item: INamedItem;
    onClick(evt): void;
}

export const TableSelectionHeader = (props: ITableSelectionHeaderProps) => {
    return props.item ? <Menu.Header>
        <div style={{height: "100%", display: "flex", alignItems: "center", paddingLeft: "10px",}}>
            <h5>
                {props.item.name}&nbsp;
                <Icon name="remove" onClick={(evt) => props.onClick(evt)}/>
            </h5>
        </div>
    </Menu.Header> : null
};
