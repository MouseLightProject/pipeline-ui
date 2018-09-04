import * as React from "react";
import {Button, Card, Icon, Label} from "semantic-ui-react";
import {Mutation} from "react-apollo";
import ReactTable from "react-table";
import {toast} from "react-toastify";

import {IPipelineTile} from "../../../models/pipelineTile";
import {IPipelineStage} from "../../../models/pipelineStage";
import {TilePipelineStatus} from "../../../models/tilePipelineStatus";
import {PreferencesManager} from "../../../util/preferencesManager";
import {SetTileStatusMutation} from "../../../graphql/pipelineTile";
import {IWorker} from "../../../models/worker";
import {
    CompletionResult,
    ExecutionStatus,
    QueueType,
    TaskExecution
} from "../../../models/taskExecution";
import moment = require("moment");

interface ITilesTableProps {
    style?: any;
    pipelineStage: IPipelineStage;
    tiles: IPipelineTile[];
    canSubmit: boolean;
    loading: boolean;
    pageCount: number;
    workerMap: Map<string, IWorker>;

    onCursorChanged(page: number, pageSize: number): void;
    setTileStatus?(pipelineStageId: string, tileIds: string[], status: TilePipelineStatus): any;
}

interface ITilesTableState {
    cachedTiles?: IPipelineTile[];
    cachedPageCount?: number;
    isRemoved: boolean;
}

export class TilesTable extends React.Component<ITilesTableProps, ITilesTableState> {
    public constructor(props: ITilesTableProps) {
        super(props);

        this.state = {
            cachedTiles: [],
            cachedPageCount: -1,
            isRemoved: false
        }
    }

    private renderTaskDescription(taskExecution: TaskExecution) {
        const worker = this.props.workerMap.get(taskExecution.worker_id);

        const location = taskExecution.queue_type === QueueType.Local ? " running locally" : " in the cluster";

        switch (taskExecution.execution_status_code) {
            case ExecutionStatus.Initializing:
                if (!taskExecution.completed_at || !taskExecution.started_at) {
                    return "Task duration not available"
                }
                return `Running for ${Date.now() - taskExecution.started_at.valueOf()}`;
            case ExecutionStatus.Running:
                if (!taskExecution.completed_at || !taskExecution.started_at) {
                    return "Task duration not available"
                }
                return `Running for ${Date.now() - taskExecution.started_at.valueOf()}`;
            case ExecutionStatus.Completed:
                if (!taskExecution.completed_at || !taskExecution.started_at) {
                    return "Task duration not available"
                }
                return `Finished in ${moment.duration(taskExecution.completed_at.valueOf() - taskExecution.started_at.valueOf()).humanize()} ${worker ? ` on ${worker.name}` : ""} ${location}.`;
            default: // Zombie or Orphan
                return null;
        }
    }

    private renderTaskHeader(taskExecution: TaskExecution) {
        switch (taskExecution.execution_status_code) {
            case ExecutionStatus.Initializing:
                return (<Icon color="blue" name="spinner" loading={true}/>);
            case ExecutionStatus.Running:
                return (<Icon color="blue" name="circle notch" loading={true}/>);
            case ExecutionStatus.Completed:
                return taskExecution.completion_status_code === CompletionResult.Success ?
                    <Icon color="green" name="check"/> : <Icon color="red" name="times"/>;
            default: // Zombie or Orphan
                return null;
        }
    }

    private renderTaskButtons(taskExecution: TaskExecution) {
        if (taskExecution.execution_status_code === ExecutionStatus.Completed) {
            return null;
        }

        return (
            <Card.Content extra>
                <Button size="tiny">
                    Hide
                </Button>
            </Card.Content>
        );
    }

    private renderTaskExecution(taskExecution: TaskExecution) {
        return (
            <Card key={taskExecution.id}>
                <Card.Content>
                    <Card.Header>
                        {this.renderTaskHeader(taskExecution)}
                        {taskExecution.IsComplete ? CompletionResult[taskExecution.completion_status_code] : ExecutionStatus[taskExecution.execution_status_code]}
                    </Card.Header>
                    <Card.Description>
                        {this.renderTaskDescription(taskExecution)}
                    </Card.Description>
                </Card.Content>
                {this.renderTaskButtons(taskExecution)}
            </Card>
        );
    }

    public componentWillReceiveProps(props: ITilesTableProps) {
        if (!props.loading) {
            this.setState({cachedTiles: props.tiles, cachedPageCount: props.pageCount});
        }
    }

    public render() {
        if (this.state.cachedTiles.length > 0) {
            const columns = [
                {
                    id: "resubmit",
                    Header: "",
                    accessor: t => t,
                    Cell: row => {
                        return this.props.canSubmit ?
                            (
                                <Mutation mutation={SetTileStatusMutation}>
                                    {(setTileStatus) => (
                                        <Button size="mini" icon="repeat"
                                                onClick={() => setTileStatus({
                                                    variables: {
                                                        pipelineStageId: this.props.pipelineStage.id,
                                                        tileIds: [row.original.relative_path],
                                                        status: TilePipelineStatus.Incomplete
                                                    }
                                                })}/>
                                    )
                                    }
                                </Mutation>
                            ) : null;
                    },
                    maxWidth: 60
                }, {
                    Header: "Tile",
                    accessor: "relative_path"
                }, {
                    Header: "X",
                    accessor: "lat_x"
                }, {
                    Header: "Y",
                    accessor: "lat_y"
                }, {
                    Header: "Z",
                    accessor: "lat_z"
                }];

            const props = {
                style: {backgroundColor: "white"},
                data: this.state.cachedTiles,
                columns: columns,
                showPaginationTop: true,
                showPaginationBottom: false,
                sortable: false,
                filterable: false,
                minRows: 0,
                // loading: this.props.loading,
                manual: true,
                pages: this.state.cachedPageCount,
                defaultPageSize: PreferencesManager.Instance.StageDetailsPageSize,
                onFetchData: (state) => {
                    if (isNaN(state.pageSize)) {
                        state.pageSize = PreferencesManager.Instance.StageDetailsPageSize;
                    }
                    this.props.onCursorChanged(state.page, state.pageSize);
                },
                SubComponent: row => {
                    const taskExecutions = row.original.task_executions;

                    if (!taskExecutions || taskExecutions.length == 0) {
                        return (<Label size="mini">No task executions</Label>);
                    }
                    const items = taskExecutions.map(t => {
                        return this.renderTaskExecution(t);
                    });

                    return (<Card.Group itemsPerRow={1} style={{padding: "10px"}}>{items}</Card.Group>)
                },
                collapseOnDataChange: false
            };

            return (
                <div style={Object.assign({width: "100%"}, this.props.style || {})}>
                    <ReactTable {...props} className="-highlight" style={{borderTop: "none"}}/>
                </div>
            );
        } else {
            return (
                <h4>There are no tiles matching this status.</h4>
            )
        }
    }
}
