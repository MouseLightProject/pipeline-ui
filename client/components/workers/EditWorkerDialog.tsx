import * as React from "react";
import {Button, Modal, Form} from "semantic-ui-react";
import {ChangeEvent} from "react";
import {IWorker} from "../../models/worker";
import {DialogMode} from "../helpers/DialogUtils";

interface IEditWorkerProps {
    element: any;
    mode: DialogMode;
    show: boolean;
    sourceWorker?: IWorker;

    onCancel(): void;
    onAccept(worker: IWorker): void;
}

interface IEditWorkerState {
    worker?: IWorker;
    work_units?: string;
    units_initialized?: boolean;
}

export class EditWorkerDialog extends React.Component<IEditWorkerProps, IEditWorkerState> {
    public constructor(props: IEditWorkerProps) {
        super(props);

        this.state = {
            worker: props.sourceWorker ? (({id, name, work_unit_capacity, is_cluster_proxy}) => ({
                id,
                name,
                work_unit_capacity,
                is_cluster_proxy
            }))(this.props.sourceWorker) : {
                id: null,
                name: "",
                work_unit_capacity: 0,
                is_cluster_proxy: false
            },
            work_units: props.sourceWorker ? props.sourceWorker.work_unit_capacity.toString() : "0",
            units_initialized: props.sourceWorker !== null
        };
    }

    public componentWillReceiveProps(props: IEditWorkerProps) {
        this.applySourceWorker(props);
    }

    private applySourceWorker(props: IEditWorkerProps) {
        if (props.sourceWorker && !this.state.units_initialized) {
            this.setState({
                worker: Object.assign(this.state.worker, (({id, name, work_unit_capacity, is_cluster_proxy}) => ({
                    id,
                    name,
                    work_unit_capacity,
                    is_cluster_proxy
                }))(props.sourceWorker)),
                work_units: props.sourceWorker ? props.sourceWorker.work_unit_capacity.toString() : "0",
                units_initialized: true
            });
        }
    }

    private get isWorkUnitsValid(): boolean {
        const wu = parseFloat(this.state.work_units);

        return !isNaN(wu);
    }

    private onWorkUnitsChanged(evt: ChangeEvent<any>) {
        this.setState({
            work_units: evt.target.value
        });
    }

    private onClusterProxyChanged(evt: ChangeEvent<any>, data) {
        this.setState({
            worker: Object.assign(this.state.worker, {is_cluster_proxy: data.checked})
        });
    }

    private onCreateOrUpdate() {
        const worker = Object.assign((({id, is_cluster_proxy}) => ({
            id: this.props.mode == DialogMode.Create ? undefined : id,
            is_cluster_proxy
        }))(this.state.worker), {
            work_unit_capacity: parseFloat(this.state.work_units)
        });

        this.props.onAccept(worker)
    }

    public render() {
        const title = this.props.mode === DialogMode.Create ? "Add New Worker" : "Update Worker";

        return (
            <Modal trigger={this.props.element} open={this.props.show}>
                <Modal.Header style={{backgroundColor: "#5bc0de", color: "white"}}>
                    {title}
                </Modal.Header>
                <Modal.Content>
                    <p>
                        Work unit capacity defines the total number of work units {this.state.worker.name} or cluster jobs a worker can process concurrently.
                    </p>
                    <Form size="small">
                        <Form.Input label={`Work Unit Capacity ${this.state.worker.is_cluster_proxy ? "(number of concurrent cluster jobs)" : ""}`} value={this.state.work_units} error={!this.isWorkUnitsValid}
                                    onChange={(evt: any) => this.onWorkUnitsChanged(evt)}/>
                        {/* Not currently implemented in the backend
                        <Form.Checkbox label='Cluster Proxy' checked={this.state.worker.is_cluster_proxy} onChange={(evt: any, data) => this.onClusterProxyChanged(evt, data)}/>
                        */}
                    </Form>
                    {this.props.sourceWorker ? <div style={{
                        width: "100%",
                        textAlign: "right"
                    }}>{`(id: ${this.props.sourceWorker.id})`}</div> : null}
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={() => this.props.onCancel()}>Cancel</Button>
                    {(this.props.mode === DialogMode.Update && this.state.worker) ?
                        <Button onClick={() => this.applySourceWorker(this.props)}>Revert</Button> : null}
                    <Button onClick={() => this.onCreateOrUpdate()}
                            disabled={!this.isWorkUnitsValid} style={{marginLeft: "30px"}}>
                        {this.props.mode === DialogMode.Update ? "Update" : "Create"}
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}
