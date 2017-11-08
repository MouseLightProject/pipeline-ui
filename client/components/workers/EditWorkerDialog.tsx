import * as React from "react";
import {Modal, Button, FormGroup, FormControl, ControlLabel} from "react-bootstrap";
import {ChangeEvent} from "react";
import {IWorker} from "../../models/worker";
import {DialogMode} from "../helpers/DialogUtils";
import {FormControlValidationState} from "../../util/bootstrapUtils";

interface IEditWorkerProps {
    mode: DialogMode;
    show: boolean;
    sourceWorker?: IWorker;

    onCancel(): void;

    onAccept(worker: IWorker): void;
}

interface IEditWorkerState {
    worker?: IWorker;
    work_units?: string;
}

export class EditWorkerDialog extends React.Component<IEditWorkerProps, IEditWorkerState> {
    public constructor(props: IEditWorkerProps) {
        super(props);

        this.state = {
            worker: props.sourceWorker ? (({id, name, work_unit_capacity}) => ({
                id,
                name,
                work_unit_capacity
            }))(this.props.sourceWorker) : {
                id: null,
                name: "",
                work_unit_capacity: 0
            },
            work_units: props.sourceWorker ? props.sourceWorker.work_unit_capacity.toString() : "0"
        };
    }

    public componentWillReceiveProps(props: IEditWorkerProps) {
        this.applySourceWorker(props);
    }

    private applySourceWorker(props: IEditWorkerProps) {
        if (props.sourceWorker) {
            this.setState({
                worker: Object.assign(this.state.worker, (({id, name, work_unit_capacity}) => ({
                    id,
                    name,
                    work_unit_capacity
                }))(props.sourceWorker)),
                work_units: props.sourceWorker ? props.sourceWorker.work_unit_capacity.toString() : "0"
            });
        }
    }

    private get isWorkUnitsValid(): boolean {
        const wu = parseFloat(this.state.work_units);

        return !isNaN(wu);
    }

    private get workUnitIsValidationState(): FormControlValidationState {
        return this.isWorkUnitsValid ? null : "error";
    }

    private onWorkUnitsChanged(evt: ChangeEvent<any>) {
        this.setState({
            work_units: evt.target.value
        });
    }

    private onCreateOrUpdate() {
        const worker = Object.assign((({id}) => ({
            id: this.props.mode == DialogMode.Create ? undefined : id,
        }))(this.state.worker), {
            work_unit_capacity: parseFloat(this.state.work_units)
        });

        this.props.onAccept(worker)
    }

    public render() {
        const title = this.props.mode === DialogMode.Create ? "Add New Worker" : "Update Worker";

        return (
            <Modal show={this.props.show} onHide={this.props.onCancel} bsSize={null}
                   aria-labelledby="create-repository-dialog">
                <Modal.Header style={{backgroundColor: "#5bc0de", color: "white"}} closeButton>
                    <Modal.Title id="create-repository-dialog">{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        A workers work unit capacity defines the total number of work
                        units {this.props.sourceWorker.name} can process concurrently.
                    </p>
                    <FormGroup bsSize="sm" controlId="work_units" validationState={this.workUnitIsValidationState}>
                        <ControlLabel>Work Unit Capacity</ControlLabel>
                        <FormControl type="text" value={this.state.work_units}
                                     placeholder="required"
                                     onChange={(evt: any) => this.onWorkUnitsChanged(evt)}/>
                    </FormGroup>
                    {this.props.sourceWorker ? <div style={{
                        width: "100%",
                        textAlign: "right"
                    }}>{`(id: ${this.props.sourceWorker.id})`}</div> : null}
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="default" onClick={() => this.props.onCancel()}>Cancel</Button>
                    {(this.props.mode === DialogMode.Update && this.props.sourceWorker) ?
                        <Button bsStyle="default" onClick={() => this.applySourceWorker(this.props)}>Revert</Button> : null}
                    <Button bsStyle="success" onClick={() => this.onCreateOrUpdate()}
                            disabled={!this.isWorkUnitsValid} style={{marginLeft: "30px"}}>
                        {this.props.mode === DialogMode.Update ? "Update" : "Create"}
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
