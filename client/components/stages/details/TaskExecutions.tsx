import * as React from "react";
import {Pagination} from "react-bootstrap"

import {graphql} from "react-apollo";
import gql from "graphql-tag";

import {TaskExecutionsTable} from "./TaskExecutionTable";
import {ITaskExecution} from "../../../models/taskExecution";

export interface IExecutionPage {
    offset: number;
    limit: number;
    totalCount: number;
    hasNextPage: boolean;
    items: ITaskExecution[]
}

export class TaskExecutions extends React.Component<any, any> {
    public constructor(props: any) {
        super(props);

        this.state = {
            executedPageOffset: 0,
            executedPageLimit: 5,
            executedPageTotalCount: -1,
            requestedOffset: 0
        }
    }

    private updateOffset(offset: number) {
        if (offset != this.state.requestedOffset) {
            this.setState({requestedOffset: offset}, null);
        }
    }

    private updateCursor(page: IExecutionPage) {
        if (page.offset !== this.state.executedPageOffset || page.limit !== this.state.executedPageLimit || page.totalCount !== this.state.executedPageTotalCount) {
            this.setState({
                executedPageOffset: page.offset,
                executedPageLimit: page.limit,
                executedPageTotalCount: page.totalCount
            }, null);
        }
    }

    public render() {
        return (
            <div>
                <TablePanelWithQuery executedPageOffset={this.state.executedPageOffset}
                                     executedPageLimit={this.state.executedPageLimit}
                                     executedPageTotalCount={this.state.executedPageTotalCount}
                                     requestedOffset={this.state.requestedOffset}
                                     onUpdateOffset={(offset: number) => this.updateOffset(offset)}
                                     onCursorChanged={(page: IExecutionPage) => this.updateCursor(page)}/>
            </div>
        );
    }
}

class TablePanel extends React.Component<any, any> {
    public render() {
        let executedTasks = [];

        if (this.props.data && this.props.data.taskExecutionsPage) {
            executedTasks = this.props.data.taskExecutionsPage.items;
        }

        const pageCount = Math.ceil(this.props.executedPageTotalCount / this.props.executedPageLimit);

        const activePage = this.props.executedPageOffset ? (Math.floor(this.props.executedPageOffset / this.props.executedPageLimit) + 1) : 1;

        return (
            <div>
                {pageCount > 1 ?
                    <Pagination prev next first last ellipsis boundaryLinks items={pageCount} maxButtons={10}
                                activePage={activePage}
                                onSelect={(page: any) => {
                                    this.props.onUpdateOffset(this.props.executedPageLimit * (page - 1))
                                }}/> : null}
                {executedTasks.length === 0 ? <NoTasks/> :
                    <TaskExecutionsTable executedTasks={executedTasks}/>}
            </div>
        );
    }

    public componentWillReceiveProps(nextProps: any) {
        if (nextProps.data && nextProps.data.taskExecutionsPage) {
            nextProps.onCursorChanged(nextProps.data.taskExecutionsPage);
        }
    }
}

class NoTasks extends React.Component<any, any> {
    public render() {
        return (<div> There are no task executions.</div>);
    }
}

const ExecutedPageQuery = gql`query($requestedOffset: Int, $executedPageLimit: Int) {
  taskExecutionsPage(offset: $requestedOffset, limit: $executedPageLimit) {
    offset
    limit
    totalCount
    hasNextPage
    items {
      id
      worker_id
      task_definition_id
      work_units
      resolved_script
      resolved_interpreter
      resolved_args
      last_process_status_code
      completion_status_code
      execution_status_code
      exit_code
      max_cpu
      max_memory
      started_at
      completed_at
    }
  }
}`;

const TablePanelWithQuery = graphql<any, any>(ExecutedPageQuery, {
    options: ({requestedOffset, executedPageLimit}) => ({
        pollInterval: 10 * 1000,
        variables: {requestedOffset, executedPageLimit}
    })
})(TablePanel);
