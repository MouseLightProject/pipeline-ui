import * as React from "react";
import * as ReactDOM from "react-dom";

import {Glyphicon, FormControl, FormGroup, InputGroup, Overlay, Tooltip} from "react-bootstrap";

export enum DynamicEditFieldMode {
    Static,
    Edit
}

interface IDynamicEditFieldProps {
    initialValue: any;
    style?: any;
    canEditFailMessage?: string;

    canEditFunction?(): boolean;
    acceptFunction?(value: string): boolean;
    filterFunction?(proposedValue: string): any;
    formatFunction?(value: any, mode: DynamicEditFieldMode): string;
}

interface IDynamicTableEditFieldState {
    value?: any
    mode?: DynamicEditFieldMode;
    showEditFail?: boolean;
}

export class DynamicEditField extends React.Component<IDynamicEditFieldProps, IDynamicTableEditFieldState> {
    constructor(props) {
        super(props);

        this.state = {value: props.initialValue, mode: DynamicEditFieldMode.Static, showEditFail: false};
    }

    private onEdit = () => {
        if (!this.props.canEditFunction || this.props.canEditFunction()) {
            this.setState({mode: DynamicEditFieldMode.Edit}, null);
        } else {
            this.setState({showEditFail: true}, null);
        }
    };

    private onValueChanged = (event) => {
        let value = event.target.value;

        if (this.props.filterFunction) {
            value = this.props.filterFunction(value);
        }

        if (value !== null) {
            this.setState({value: value}, null);
        }
    };

    private onCancelEdit = () => {
        this.setState({value: this.props.initialValue, mode: DynamicEditFieldMode.Static}, null);
    };

    private onAcceptEdit = () => {
        if (!this.props.acceptFunction || this.props.acceptFunction(this.state.value)) {
            this.setState({mode: DynamicEditFieldMode.Static}, null);
        }
    };

    private format = (value) => {
        if (this.props.formatFunction) {
            return this.props.formatFunction(value, this.state.mode);
        }

        return value;
    };

    private overlayControl = null;

    public render() {
        let style = {
            "margin": "0px"
        };

        const staticDivStyle = this.props.style || {};

        const overlapProps = {
            placement: "top",
            rootClose: true,
            target: this.overlayControl,
            show: this.state.showEditFail,
            onHide: () => this.setState({showEditFail: false}, null),
            onEntered: () => setTimeout(() => this.setState({showEditFail: false}, null), 4000)
        };

        if (this.state.mode === DynamicEditFieldMode.Edit) {
            return (
                <FormGroup bsSize="small" style={style}>
                    <InputGroup>
                        <InputGroup.Addon onClick={this.onCancelEdit}>
                            <Glyphicon glyph="remove"/>
                        </InputGroup.Addon>
                        <FormControl type="text"
                                     value={this.format(this.state.value)}
                                     onChange={this.onValueChanged}/>
                        <InputGroup.Addon onClick={this.onAcceptEdit}>
                            <Glyphicon glyph="ok"/>
                        </InputGroup.Addon>
                    </InputGroup>
                </FormGroup>);
        } else {
            return (
                <div ref={node => this.overlayControl = node} style={staticDivStyle} onClick={() => this.onEdit()}>
                    <Overlay {...overlapProps}>
                        <Tooltip id="overload-left">{this.props.canEditFailMessage}</Tooltip>
                    </Overlay>
                    {this.format(this.state.value)}
                </div>);
        }
    }
}

export function clickToEditFormatFunction(value: any, mode: DynamicEditFieldMode): string {
    if ((mode === DynamicEditFieldMode.Static) && (!value || value.length === 0)) {
        return "<click to edit>";
    } else {
        return value;
    }
}

export function nonNegativeIntegerFilterFunction(value: string): any {
    if (value.length === 0) {
        return -1;
    } else {
        let x = parseInt(value);

        if (!isNaN(x) && x >= 0) {
            return x;
        }
    }

    return null;
}

export function nonNegativeIntegerFormatFunction(value: any, mode: DynamicEditFieldMode): string {
    if (mode === DynamicEditFieldMode.Static) {
        return value < 0 ? "-----" : value.toString();
    } else {
        return value < 0 ? "" : value.toString();
    }
}

