import { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from 'material-ui/styles';
import { TableCell, TableRow } from 'material-ui/Table';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Drawer from 'material-ui/Drawer';
import ContentCopyIcon from 'mdi-react/ContentCopyIcon';
import InformationVariantIcon from 'mdi-react/InformationVariantIcon';
import { string, func, array, shape, arrayOf } from 'prop-types';
import { memoizeWith, pipe, map, sort as rSort } from 'ramda';
import { camelCase } from 'change-case';
import LinkIcon from 'mdi-react/LinkIcon';
import StatusLabel from '../StatusLabel';
import DateDistance from '../DateDistance';
import Markdown from '../Markdown';
import TableCellListItem from '../TableCellListItem';
import ConnectionDataTable from '../ConnectionDataTable';
import { VIEW_WORKER_TYPES_PAGE_SIZE } from '../../utils/constants';
import sort from '../../utils/sort';
import normalizeWorkerTypes from '../../utils/normalizeWorkerTypes';
import {
  pageInfo,
  awsProvisionerWorkerTypeSummary,
} from '../../utils/prop-types';

const sorted = pipe(
  rSort((a, b) => sort(a.node.workerType, b.node.workerType)),
  map(
    ({ node: { provisionerId, workerType } }) =>
      `${provisionerId}.${workerType}`
  )
);

@withStyles(theme => ({
  infoButton: {
    marginLeft: -theme.spacing.double,
    marginRight: theme.spacing.unit,
  },
  headline: {
    paddingLeft: theme.spacing.triple,
    paddingRight: theme.spacing.triple,
  },
  metadataContainer: {
    paddingTop: theme.spacing.double,
    paddingBottom: theme.spacing.double,
    width: 400,
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
    drawerOpen: false,
    drawerWorkerType: null,
  };

  handleDrawerClose = () => {
    this.setState({
      drawerOpen: false,
      drawerWorkerType: null,
    });
  };

  handleDrawerOpen = drawerWorkerType => {
    this.setState({
      drawerOpen: true,
      drawerWorkerType,
    });
  };

  handleHeaderClick = sortBy => {
    const toggled = this.state.sortDirection === 'desc' ? 'asc' : 'desc';
    const sortDirection = this.state.sortBy === sortBy ? toggled : 'desc';

    this.setState({ sortBy, sortDirection });
  };

  createSortedWorkerTypesConnection = memoizeWith(
    (
      workerTypesConnection,
      awsProvisionerWorkerTypeSummaries,
      sortBy,
      sortDirection
    ) => {
      const ids = sorted(workerTypesConnection.edges);

      return `${ids.join('-')}-${sortBy}-${sortDirection}`;
    },
    (
      workerTypesConnection,
      awsProvisionerWorkerTypeSummaries,
      sortBy,
      sortDirection
    ) => {
      const sortByProperty = camelCase(sortBy);
      // Normalize worker types for aws-provisioner-v1
      const workerTypes = normalizeWorkerTypes(
        workerTypesConnection,
        awsProvisionerWorkerTypeSummaries
      );

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
    const {
      onPageChange,
      classes,
      workerTypesConnection,
      awsProvisionerWorkerTypeSummaries,
    } = this.props;
    const { sortBy, sortDirection, drawerOpen, drawerWorkerType } = this.state;
    const connection = this.createSortedWorkerTypesConnection(
      workerTypesConnection,
      awsProvisionerWorkerTypeSummaries,
      sortBy,
      sortDirection
    );
    const headers = [
      'Worker Type',
      'Stability',
      'Last Date Active',
      'Pending Tasks',
    ];
    const iconSize = 16;

    if (connection.edges.length) {
      if ('runningCapacity' in connection.edges[0].node) {
        headers.push('Running Capacity');
      }

      if ('pendingCapacity' in connection.edges[0].node) {
        headers.push('Pending Capacity');
      }
    }

    return (
      <Fragment>
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
                <Button
                  className={classes.infoButton}
                  size="small"
                  onClick={() => this.handleDrawerOpen(workerType)}>
                  <InformationVariantIcon size={iconSize} />
                </Button>
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
                  <LinkIcon size={iconSize} />
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
                  <ContentCopyIcon size={iconSize} />
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
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={this.handleDrawerClose}>
          <div className={classes.metadataContainer}>
            <Typography variant="headline" className={classes.headline}>
              {drawerWorkerType && drawerWorkerType.workerType}
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Description"
                  secondary={
                    drawerWorkerType && drawerWorkerType.description ? (
                      <Markdown>{drawerWorkerType.description}</Markdown>
                    ) : (
                      'n/a'
                    )
                  }
                />
              </ListItem>
            </List>
          </div>
        </Drawer>
      </Fragment>
    );
  }
}
