import { Component } from 'react';
import { func, shape, arrayOf } from 'prop-types';
import { memoizeWith, pipe, map, sort as rSort } from 'ramda';
import { camelCase } from 'change-case/change-case';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import DateDistance from '../DateDistance';
import ConnectionDataTable from '../ConnectionDataTable';
import { VIEW_CACHE_PURGES_PAGE_SIZE } from '../../utils/constants';
import sort from '../../utils/sort';
import { pageInfo, cachePurge } from '../../utils/prop-types';

const sorted = pipe(
  rSort((a, b) => sort(a.node.cacheName, b.node.cacheName)),
  map(({ node: { cacheName } }) => cacheName)
);

/**
 * Display active cache purges in a table.
 */
export default class CachePurgesTable extends Component {
  static propTypes = {
    /** Callback function fired when a page is changed. */
    onPageChange: func.isRequired,
    /** CachePurges GraphQL PageConnection instance. */
    cachePurgesConnection: shape({
      edges: arrayOf(cachePurge),
      pageInfo,
    }).isRequired,
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

  createSortedCachePurgesConnection = memoizeWith(
    (cachePurgesConnection, sortBy, sortDirection) => {
      const ids = sorted(cachePurgesConnection.edges);

      return `${ids.join('-')}-${sortBy}-${sortDirection}`;
    },
    (cachePurgesConnection, sortBy, sortDirection) => {
      const sortByProperty = camelCase(sortBy);

      if (!sortBy) {
        return cachePurgesConnection;
      }

      return {
        ...cachePurgesConnection,
        edges: [...cachePurgesConnection.edges].sort((a, b) => {
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
    const { onPageChange, cachePurgesConnection } = this.props;
    const { sortBy, sortDirection } = this.state;
    const sortedCachePurgesConnection = this.createSortedCachePurgesConnection(
      cachePurgesConnection,
      sortBy,
      sortDirection
    );

    return (
      <ConnectionDataTable
        connection={sortedCachePurgesConnection}
        pageSize={VIEW_CACHE_PURGES_PAGE_SIZE}
        sortByHeader={sortBy}
        sortDirection={sortDirection}
        onHeaderClick={this.handleHeaderClick}
        onPageChange={onPageChange}
        headers={['Provisioner ID', 'Worker Type', 'Cache Name', 'Before']}
        renderRow={({
          node: { provisionerId, workerType, cacheName, before },
        }) => (
          <TableRow key={cacheName}>
            <TableCell>{provisionerId}</TableCell>
            <TableCell>{workerType}</TableCell>
            <TableCell>{cacheName}</TableCell>
            <TableCell>
              <DateDistance from={before} />
            </TableCell>
          </TableRow>
        )}
      />
    );
  }
}
