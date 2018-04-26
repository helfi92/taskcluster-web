import { Component } from 'react';
import { Link } from 'react-router-dom';
import { func, string } from 'prop-types';
import { formatDistanceStrict } from 'date-fns';
import { memoizeWith, pipe, filter, map, sort as rSort } from 'ramda';
import { ListItemText } from 'material-ui/List';
import Typography from 'material-ui/Typography';
import { TableCell, TableRow } from 'material-ui/Table';
import ContentCopyIcon from 'mdi-react/ContentCopyIcon';
import LinkIcon from 'mdi-react/LinkIcon';
import StatusLabel from '../StatusLabel';
import DateDistance from '../DateDistance';
import TableCellListItem from '../TableCellListItem';
import ConnectionDataTable from '../ConnectionDataTable';
import { VIEW_WORKERS_PAGE_SIZE } from '../../utils/constants';
import { workers } from '../../utils/prop-types';
import sort from '../../utils/sort';

const sorted = pipe(
  filter(worker => worker.node.latestTask),
  rSort((a, b) =>
    sort(a.node.latestTask.run.workerId, b.node.latestTask.run.workerId)
  ),
  map(
    ({ node: { latestTask } }) =>
      `${latestTask.run.workerId}.${latestTask.run.taskId}.${
        latestTask.run.runId
      }`
  )
);

/**
 * Display relevant information about workers in a table.
 */
export default class WorkersTable extends Component {
  static propTypes = {
    /** Workers GraphQL PageConnection instance. */
    workersConnection: workers.isRequired,
    /** Callback function fired when a page is changed. */
    onPageChange: func.isRequired,
    /** Worker type name */
    workerType: string.isRequired,
    /** Provisioner identifier */
    provisionerId: string.isRequired,
  };

  state = {
    sortBy: null,
    sortDirection: null,
  };

  createSortedWorkersConnection = memoizeWith(
    (workersConnections, sortBy, sortDirection) => {
      const ids = sorted(workersConnections.edges);

      return `${ids.join('-')}-${sortBy}-${sortDirection}`;
    },
    (workersConnection, sortBy, sortDirection) => {
      const filteredEdges = workersConnection.edges.filter(
        worker => worker.node.latestTask
      );

      if (!sortBy) {
        return {
          ...workersConnection,
          edges: filteredEdges,
        };
      }

      return {
        ...workersConnection,
        edges: filteredEdges.sort((a, b) => {
          const firstElement =
            sortDirection === 'desc'
              ? this.valueFromNode(b.node)
              : this.valueFromNode(a.node);
          const secondElement =
            sortDirection === 'desc'
              ? this.valueFromNode(a.node)
              : this.valueFromNode(b.node);

          return sort(firstElement, secondElement);
        }),
      };
    }
  );

  valueFromNode(node) {
    const mapping = {
      'Worker Group': node.latestTask.run.workerGroup,
      'Worker ID': node.latestTask.run.workerId,
      'Most Recent Task': node.latestTask.run.taskId,
      'Task State': node.latestTask.run.state,
      'Task Started': node.latestTask.run.started,
      'Task Resolved': node.latestTask.run.resolved,
      'First Claim': node.firstClaim,
      Quarantined: node.quarantineUntil,
    };

    return mapping[this.state.sortBy];
  }

  handleHeaderClick = sortByHeader => {
    const sortBy = sortByHeader;
    const toggled = this.state.sortDirection === 'desc' ? 'asc' : 'desc';
    const sortDirection = this.state.sortBy === sortBy ? toggled : 'desc';

    this.setState({ sortBy, sortDirection });
  };

  render() {
    const { sortBy, sortDirection } = this.state;
    const {
      provisionerId,
      workerType,
      onPageChange,
      workersConnection,
      ...props
    } = this.props;
    const iconSize = 16;
    const connection = this.createSortedWorkersConnection(
      workersConnection,
      sortBy,
      sortDirection
    );

    return (
      <ConnectionDataTable
        connection={connection}
        pageSize={VIEW_WORKERS_PAGE_SIZE}
        sortByHeader={sortBy}
        sortDirection={sortDirection}
        onHeaderClick={this.handleHeaderClick}
        onPageChange={onPageChange}
        renderRow={({ node: { latestTask, firstClaim, quarantineUntil } }) => (
          <TableRow
            key={`${latestTask.run.workerId}-${latestTask.run.runId}-${
              latestTask.run.taskId
            }`}>
            <TableCell>{latestTask.run.workerGroup}</TableCell>
            <TableCell>
              <TableCellListItem
                button
                component={Link}
                to={`/provisioners/${provisionerId}/worker-types/${workerType}/workers/${
                  latestTask.run.workerGroup
                }/${latestTask.run.workerId}`}>
                <ListItemText
                  disableTypography
                  primary={
                    <Typography variant="body1">
                      {latestTask.run.workerId}
                    </Typography>
                  }
                />
                <LinkIcon size={iconSize} />
              </TableCellListItem>
            </TableCell>
            <TableCell>
              <TableCellListItem
                button
                component={Link}
                to={`/tasks/${latestTask.run.taskId}/runs/${
                  latestTask.run.runId
                }`}>
                <ListItemText
                  disableTypography
                  primary={
                    <Typography variant="body1">
                      {latestTask.run.taskId}
                    </Typography>
                  }
                />
                <LinkIcon size={iconSize} />
              </TableCellListItem>
            </TableCell>
            <TableCell>
              {<StatusLabel state={latestTask.run.state} />}
            </TableCell>
            <TableCell>
              <TableCellListItem button>
                <ListItemText
                  disableTypography
                  primary={
                    <Typography variant="body1">
                      <DateDistance from={latestTask.run.started} />
                    </Typography>
                  }
                />
                <ContentCopyIcon size={iconSize} />
              </TableCellListItem>
            </TableCell>
            <TableCell>
              {latestTask.run.resolved ? (
                <TableCellListItem button>
                  <ListItemText
                    disableTypography
                    primary={
                      <Typography variant="body1">
                        <DateDistance from={latestTask.run.resolved} />
                      </Typography>
                    }
                  />
                  <ContentCopyIcon size={iconSize} />
                </TableCellListItem>
              ) : (
                <Typography variant="body1">n/a</Typography>
              )}
            </TableCell>
            <TableCell>
              <TableCellListItem button>
                <ListItemText
                  disableTypography
                  primary={
                    <Typography variant="body1">
                      <DateDistance from={firstClaim} />
                    </Typography>
                  }
                />
                <ContentCopyIcon size={iconSize} />
              </TableCellListItem>
            </TableCell>
            <TableCell>
              {quarantineUntil
                ? formatDistanceStrict(Date(), quarantineUntil, { unit: 'd' })
                : 'n/a'}
            </TableCell>
          </TableRow>
        )}
        headers={[
          'Worker Group',
          'Worker ID',
          'Most Recent Task',
          'Task State',
          'Task Started',
          'Task Resolved',
          'First Claim',
          'Quarantined',
        ]}
        {...props}
      />
    );
  }
}
