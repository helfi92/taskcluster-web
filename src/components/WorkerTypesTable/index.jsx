import { Component } from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from 'material-ui/styles';
import { TableCell, TableRow } from 'material-ui/Table';
import { ListItemText } from 'material-ui/List';
import Typography from 'material-ui/Typography';
import ContentCopyIcon from 'mdi-react/ContentCopyIcon';
import InformationVariantIcon from 'mdi-react/InformationVariantIcon';
import { string, func, array, shape, arrayOf } from 'prop-types';
import { find, propEq, memoizeWith, toString } from 'ramda';
import { camelCase } from 'change-case';
import LinkIcon from 'mdi-react/LinkIcon';
import ButtonDrawer from '../ButtonDrawer';
import StatusLabel from '../StatusLabel';
import DateDistance from '../DateDistance';
import TableCellListItem from '../TableCellListItem';
import WorkerTypeMetadataCard from '../WorkerTypeMetadataCard';
import ConnectionDataTable from '../ConnectionDataTable';
import { VIEW_WORKER_TYPES_PAGE_SIZE } from '../../utils/constants';
import sort from '../../utils/sort';
import {
  pageInfo,
  awsProvisionerWorkerTypeSummary,
} from '../../utils/prop-types';

@withStyles(theme => ({
  infoButton: {
    marginLeft: -theme.spacing.double,
    marginRight: theme.spacing.unit,
  },
}))
/**
 * Display relevant information about worker types in a table.
 */
export default class WorkerTypesTable extends Component {
  static propTypes = {
    /** Provisioner identifier */
    provisionerId: string.isRequired,
    /** Callback function fired when a page is changed. */
    onPageChange: func.isRequired,
    /** Worker Types GraphQL PageConnection instance. */
    workerTypesConnection: shape({
      edges: array,
      pageInfo,
    }).isRequired,
    /**
     * AWS worker-type summaries.
     * Required when `provisionerId === 'aws-provisioner-v1'`.
     */
    awsProvisionerWorkerTypeSummaries: arrayOf(awsProvisionerWorkerTypeSummary),
  };

  static defaultProps = {
    awsProvisionerWorkerTypeSummaries: null,
  };

  state = {
    sortBy: null,
    sortDirection: null,
  };

  handleHeaderClick = sortBy => {
    const toggled = this.state.sortDirection === 'desc' ? 'asc' : 'desc';
    const sortDirection = this.state.sortBy === sortBy ? toggled : 'desc';

    this.setState({ sortBy, sortDirection });
  };

  createSortedWorkerTypesConnection = memoizeWith(
    () =>
      `${toString(this.props.workerTypesConnection.edges)}-${
        this.state.sortBy
      }-${this.state.sortDirection}`,
    () => {
      const { sortBy, sortDirection } = this.state;
      const {
        workerTypesConnection,
        awsProvisionerWorkerTypeSummaries,
      } = this.props;
      const sortByProperty = camelCase(sortBy);
      // Normalize worker types for aws-provisioner-v1
      const workerTypes = awsProvisionerWorkerTypeSummaries
        ? {
            ...workerTypesConnection,
            edges: workerTypesConnection.edges.map(edge => ({
              ...edge,
              ...(awsProvisionerWorkerTypeSummaries
                ? {
                    node: {
                      ...edge.node,
                      ...find(propEq('workerType', edge.node.workerType))(
                        awsProvisionerWorkerTypeSummaries
                      ),
                    },
                  }
                : null),
            })),
          }
        : workerTypesConnection;

      if (!sortBy) {
        return workerTypes;
      }

      return {
        ...workerTypes,
        edges: [...workerTypes.edges].sort((a, b) => {
          const firstElement =
            sortDirection === 'desc'
              ? b.node[sortByProperty]
              : a.node[sortByProperty];
          const secondElement =
            sortDirection === 'desc'
              ? a.node[sortByProperty]
              : b.node[sortByProperty];

          return sort(firstElement, secondElement);
        }),
      };
    }
  );

  render() {
    const { onPageChange, classes } = this.props;
    const { sortBy, sortDirection } = this.state;
    const connection = this.createSortedWorkerTypesConnection();
    const headers = [
      'Worker Type',
      'Stability',
      'Last Date Active',
      'Pending Tasks',
    ];

    if (connection.edges.length) {
      if ('runningCapacity' in connection.edges[0].node) {
        headers.push('Running Capacity');
      }

      if ('pendingCapacity' in connection.edges[0].node) {
        headers.push('Pending Capacity');
      }
    }

    return (
      <ConnectionDataTable
        connection={connection}
        pageSize={VIEW_WORKER_TYPES_PAGE_SIZE}
        sortByHeader={sortBy}
        sortDirection={sortDirection}
        onHeaderClick={this.handleHeaderClick}
        onPageChange={onPageChange}
        headers={headers}
        renderRow={({ node: workerType }) => (
          <TableRow key={workerType.workerType}>
            <TableCell>
              <ButtonDrawer
                className={classes.infoButton}
                size="small"
                content={
                  <WorkerTypeMetadataCard
                    metadata={{
                      name: workerType.workerType,
                      description: workerType.description,
                    }}
                  />
                }>
                <InformationVariantIcon />
              </ButtonDrawer>
              <TableCellListItem
                button
                component={Link}
                to={`/provisioners/${workerType.provisionerId}/worker-types/${
                  workerType.workerType
                }`}>
                <ListItemText
                  disableTypography
                  primary={
                    <Typography variant="body1">
                      {workerType.workerType}
                    </Typography>
                  }
                />
                <LinkIcon />
              </TableCellListItem>
            </TableCell>
            <TableCell>
              <StatusLabel state={workerType.stability} />
            </TableCell>
            <TableCell>
              <TableCellListItem button>
                <ListItemText
                  disableTypography
                  primary={
                    <Typography variant="body1">
                      <DateDistance from={workerType.lastDateActive} />
                    </Typography>
                  }
                />
                <ContentCopyIcon />
              </TableCellListItem>
            </TableCell>
            <TableCell>{workerType.pendingTasks}</TableCell>
            {'runningCapacity' in workerType && (
              <TableCell>{workerType.runningCapacity}</TableCell>
            )}
            {'pendingCapacity' in workerType && (
              <TableCell>{workerType.pendingCapacity}</TableCell>
            )}
          </TableRow>
        )}
      />
    );
  }
}
