import * as React from "react";
import {Button, Card, Icon, Label, List} from "semantic-ui-react";
import {toast} from "react-toastify";
import * as CopyToClipboard from "react-copy-to-clipboard";

import {IPipelineTile} from "../../../models/pipelineTile";
import {IPipelineStage} from "../../../models/pipelineStage";
import {TilePipelineStatus} from "../../../models/tilePipelineStatus";
import {SetTileStatusMutation} from "../../../graphql/pipelineTile";
import {IWorker} from "../../../models/worker";
import {CompletionResult, ExecutionStatus, QueueType, TaskExecution} from "../../../models/taskExecution";
import {PreferencesManager} from "../../../util/preferencesManager";
import {Mutation} from "react-apollo";
import ReactTable from "react-table";

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

    private renderTaskStatusIcon(taskExecution: TaskExecution) {
        switch (taskExecution.execution_status_code) {
            case ExecutionStatus.Initializing:
                return (<Icon color="yellow" name="spinner" loading={true}/>);
            case ExecutionStatus.Running:
                return (<Icon color="blue" name="cog" loading={true}/>);
            case ExecutionStatus.Completed: {
                switch (taskExecution.completion_status_code) {
                    case CompletionResult.Cancel:
                        return (<Icon color="orange" name="cancel"/>);
                    case CompletionResult.Error:
                        return (<Icon color="red" name="exclamation"/>);
                    case CompletionResult.Success:
                        return (<Icon color="green" name="check"/>);
                    default:
                        return null;
                }
            }
            default: // Zombie or Orphan
                return null;
        }
    }

    private renderTaskButtons(tileId: string, taskExecution: TaskExecution) {
        if (taskExecution.execution_status_code > ExecutionStatus.Running) {
            // TODO have a hide button for error/cancel/ maybe success.
            return null;
        }

        // TODO Need to know how long since last update from worker on this task - determine if it is likely orphaned.

        // TODO Send the task execution ID so it can be marked as orphaned, unless an future update comes in.

        return (
            <Card.Content extra>
                {taskExecution.lastUpdate(this.props.workerMap.get(taskExecution.worker_id))}
                &nbsp;
                {taskExecution.IsLongRunning ?
                    <Mutation mutation={SetTileStatusMutation}>
                        {(setTileStatus) => (
                            <Button size="tiny" onClick={() => setTileStatus({
                                variables: {
                                    pipelineStageId: this.props.pipelineStage.id,
                                    tileIds: [tileId],
                                    status: TilePipelineStatus.Incomplete
                                }
                            })}>
                                This seems too long
                            </Button>
                        )}
                    </Mutation> : null}
            </Card.Content>
        );
    }

    private renderTaskExecution(tileId: string, taskExecution: TaskExecution) {
        return (
            <Card key={taskExecution.id}>
                <Card.Content>
                    <Card.Header>
                        {this.renderTaskStatusIcon(taskExecution)}
                        {taskExecution.IsComplete ? CompletionResult[taskExecution.completion_status_code] : ExecutionStatus[taskExecution.execution_status_code]}
                    </Card.Header>
                    <Card.Description>
                        {taskExecution.summarize(this.props.workerMap.get(taskExecution.worker_id))}
                        <br/>
                        <List bulleted style={{fontSize: "0.75rem"}}>
                            <List.Item>
                                <CopyToClipboard text={taskExecution.resolved_output_path}>
                                    <List.Icon name="copy" verticalAlign="middle"/>
                                </CopyToClipboard>
                                <List.Content>
                                    <List.Header>Output Location</List.Header>
                                    <List.Description>{taskExecution.resolved_output_path}</List.Description>
                                </List.Content>
                            </List.Item>
                            <List.Item>
                                <CopyToClipboard text={taskExecution.resolved_log_path}>
                                    <List.Icon name="copy" verticalAlign="middle"/>
                                </CopyToClipboard>
                                <List.Content>
                                    <List.Header>Log Prefix</List.Header>
                                    <List.Description>{taskExecution.resolved_log_path}</List.Description>
                                </List.Content>
                            </List.Item>
                            <List.Item>
                                <List.Content>
                                    <List.Header>Script Arguments</List.Header>
                                    <List.Content>
                                        <List.List>
                                            {taskExecution.resolved_script_args.map((a, index) => <List.Item
                                                key={tileId + index}>{a}</List.Item>)}
                                        </List.List>
                                    </List.Content>
                                </List.Content>
                            </List.Item>
                            {taskExecution.queue_type === QueueType.Cluster ? <List.Item>
                                <List.Content>
                                    <List.Header>Cluster Arguments</List.Header>
                                    <List.Description>{taskExecution.resolved_cluster_args}</List.Description>
                                </List.Content>
                            </List.Item> : null}
                        </List>
                    </Card.Description>
                </Card.Content>
                {this.renderTaskButtons(tileId, taskExecution)}
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
                        return this.renderTaskExecution(row.original.relative_path, t);
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
