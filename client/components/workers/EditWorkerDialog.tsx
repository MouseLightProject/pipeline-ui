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
    local_work_units?: string;
    cluster_work_units?: string;
}

export class EditWorkerDialog extends React.Component<IEditWorkerProps, IEditWorkerState> {
    public constructor(props: IEditWorkerProps) {
        super(props);

        this.state = {
            worker: props.sourceWorker ? (({id, name, local_work_capacity, cluster_work_capacity}) => ({
                id,
                name,
                local_work_capacity,
                cluster_work_capacity
            }))(this.props.sourceWorker) : {
                id: null,
                name: "",
                local_work_capacity: 0,
                cluster_work_capacity: 0
            },
            local_work_units: props.sourceWorker ? props.sourceWorker.local_work_capacity.toString() : "0",
            cluster_work_units: props.sourceWorker ? props.sourceWorker.cluster_work_capacity.toString() : "0"
        };
    }

    private applySourceWorker() {
        if (this.props.sourceWorker) {
            this.setState({
                worker: Object.assign(this.state.worker, (({id, name, local_work_capacity, cluster_work_capacity}) => ({
                    id,
                    name,
                    local_work_capacity,
                    cluster_work_capacity
                }))(this.props.sourceWorker)),
                local_work_units: this.props.sourceWorker ? this.props.sourceWorker.local_work_capacity.toString() : "0",
                cluster_work_units: this.props.sourceWorker ? this.props.sourceWorker.cluster_work_capacity.toString() : "0"
            });
        }
    }

    private get isLocalWorkUnitsValid(): boolean {
        const wu = parseFloat(this.state.local_work_units);

        return !isNaN(wu);
    }

    private onLocalWorkUnitsChanged(evt: ChangeEvent<any>) {
        this.setState({
            local_work_units: evt.target.value
        });
    }

    private get isClusterWorkUnitsValid(): boolean {
        const wu = parseFloat(this.state.cluster_work_units);

        return !isNaN(wu);
    }

    private onClusterWorkUnitsChanged(evt: ChangeEvent<any>) {
        this.setState({
            cluster_work_units: evt.target.value
        });
    }

    private onCreateOrUpdate() {
        const worker = Object.assign((({id}) => ({
            id: this.props.mode == DialogMode.Create ? undefined : id,
        }))(this.state.worker), {
            local_work_capacity: parseFloat(this.state.local_work_units),
            cluster_work_capacity: parseFloat(this.state.cluster_work_units)
        });

        this.props.onAccept(worker)
    }

    public render() {
        const title = this.props.mode === DialogMode.Create ? "Add New Worker" : "Update Worker";

        return (
            <Modal trigger={this.props.element} open={this.props.show} onOpen={() => this.applySourceWorker()}>
                <Modal.Header style={{backgroundColor: "#5bc0de", color: "white"}}>
                    {title}
                </Modal.Header>
                <Modal.Content>
                    <p>
                        Work unit capacity defines the total number of work units {this.state.worker.name} or cluster jobs a worker can process concurrently.
                    </p>
                    <Form size="small">
                        <Form.Input label={`Local Work Capacity`} value={this.state.local_work_units} error={!this.isLocalWorkUnitsValid}
                                    onChange={(evt: any) => this.onLocalWorkUnitsChanged(evt)}/>
                        <Form.Input label={`Cluster Work Capacity`} value={this.state.cluster_work_units} error={!this.isClusterWorkUnitsValid}
                                    onChange={(evt: any) => this.onClusterWorkUnitsChanged(evt)}/>
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
                        <Button onClick={() => this.applySourceWorker()}>Revert</Button> : null}
                    <Button onClick={() => this.onCreateOrUpdate()}
                            disabled={!this.isLocalWorkUnitsValid || !this.isClusterWorkUnitsValid} style={{marginLeft: "30px"}}>
                        {this.props.mode === DialogMode.Update ? "Update" : "Create"}
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}
