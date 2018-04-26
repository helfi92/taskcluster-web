import { Component } from 'react';
import { Link } from 'react-router-dom';
import { TableCell, TableRow } from 'material-ui/Table';
import { camelCase } from 'change-case';
import { memoizeWith } from 'ramda';
import LinkIcon from 'mdi-react/LinkIcon';
import { withStyles } from 'material-ui/styles';
import { ListItemText } from 'material-ui/List';
import Typography from 'material-ui/Typography';
import ContentCopyIcon from 'mdi-react/ContentCopyIcon';
import TableCellListItem from '../TableCellListItem';
import DateDistance from '../DateDistance';
import DataTable from '../DataTable';
import StatusLabel from '../StatusLabel';
import { worker } from '../../utils/prop-types';
import sort from '../../utils/sort';

@withStyles(theme => ({
  dateListItem: {
    marginLeft: -theme.spacing.unit,
    padding: theme.spacing.unit,
  },
  listItemButton: {
    ...theme.mixins.listItemButton,
  },
  taskName: {
    marginRight: theme.spacing.unit,
    maxWidth: 250,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    verticalAlign: 'middle',
    display: 'inline-block',
  },
  infoButton: {
    marginLeft: -theme.spacing.double,
    marginRight: theme.spacing.unit,
  },
}))
/**
 * Display relevant information about a worker in a table.
 */
export default class WorkerTable extends Component {
  static propTypes = {
    /** A GraphQL worker response. */
    worker,
  };

  state = {
    sortBy: null,
    sortDirection: null,
  };

  getTableData = memoizeWith(
    ({ sortBy, sortDirection }) => `${sortBy}-${sortDirection}`,
    () => {
      const { worker } = this.props;
      const { sortBy, sortDirection } = this.state;
      const sortByProperty = camelCase(sortBy);

      if (!worker) {
        return null;
      }

      const tasks = worker.recentTasks.reduce(
        (tasks, recentTask, index) =>
          tasks.concat({
            ...recentTask.run,
            ...worker.latestTasks[index].metadata,
          }),
        []
      );

      if (!sortBy) {
        return tasks;
      }

      return tasks.sort((a, b) => {
        const firstElement =
          sortDirection === 'desc' ? b[sortByProperty] : a[sortByProperty];
        const secondElement =
          sortDirection === 'desc' ? a[sortByProperty] : b[sortByProperty];

        return sort(firstElement, secondElement);
      });
    }
  );

  handleHeaderClick = sortByHeader => {
    const sortBy = sortByHeader;
    const toggled = this.state.sortDirection === 'desc' ? 'asc' : 'desc';
    const sortDirection = this.state.sortBy === sortBy ? toggled : 'desc';

    this.setState({ sortBy, sortDirection });
  };

  render() {
    const { classes } = this.props;
    const { sortBy, sortDirection } = this.state;
    const iconSize = 16;
    const items = this.getTableData({ sortBy, sortDirection });

    return (
      <DataTable
        items={items}
        renderRow={task => (
          <TableRow key={`recent-task-${task.taskId}`}>
            <TableCell>
              <StatusLabel state={task.state} />
            </TableCell>
            <TableCell>
              <TableCellListItem
                button
                component={Link}
                to={`/tasks/${task.taskId}/runs/${task.runId}`}>
                <div className={classes.taskName}>{task.name}</div>
                <LinkIcon size={iconSize} />
              </TableCellListItem>
            </TableCell>
            <TableCell>{task.taskId}</TableCell>
            <TableCell>
              <TableCellListItem button>
                <ListItemText
                  disableTypography
                  primary={
                    <Typography variant="body1">
                      <DateDistance from={task.started} />
                    </Typography>
                  }
                />
                <ContentCopyIcon size={iconSize} />
              </TableCellListItem>
            </TableCell>
            <TableCell>
              <TableCellListItem button>
                <ListItemText
                  disableTypography
                  primary={
                    <Typography variant="body1">
                      <DateDistance from={task.resolved} />
                    </Typography>
                  }
                />
                <ContentCopyIcon size={iconSize} />
              </TableCellListItem>
            </TableCell>
          </TableRow>
        )}
        headers={['State', 'Name', 'Task ID', 'Started', 'Resolved']}
        sortByHeader={sortBy}
        sortDirection={sortDirection}
        onHeaderClick={this.handleHeaderClick}
      />
    );
  }
}
