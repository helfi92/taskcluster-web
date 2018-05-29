import { Fragment, Component } from 'react';
import { Link } from 'react-router-dom';
import { shape, func, arrayOf } from 'prop-types';
import { memoizeWith, pipe, map, sort as rSort } from 'ramda';
import { camelCase } from 'change-case/change-case';
import {
  TableRow,
  TableCell,
  ListItemText,
  Typography,
} from '@material-ui/core';
import LinkIcon from 'mdi-react/LinkIcon';
import ConnectionDataTable from '../ConnectionDataTable';
import DateDistance from '../DateDistance';
import TableCellListItem from '../TableCellListItem';
import { VIEW_CLIENTS_PAGE_SIZE } from '../../utils/constants';
import { pageInfo, client } from '../../utils/prop-types';
import sort from '../../utils/sort';

const sorted = pipe(
  rSort((a, b) => sort(a.node.clientId, b.node.clientId)),
  map(({ node: { clientId } }) => clientId)
);

export default class ClientsTable extends Component {
  static propTypes = {
    clientsConnection: shape({
      edges: arrayOf(client),
      pageInfo,
    }).isRequired,
    onPageChange: func.isRequired,
  };

  state = {
    sortBy: null,
    sortDirection: null,
  };

  createSortedClientsConnection = memoizeWith(
    (clientsConnection, sortBy, sortDirection) => {
      const ids = sorted(clientsConnection.edges);

      return `${ids.join('-')}-${sortBy}-${sortDirection}`;
    },
    (clientsConnection, sortBy, sortDirection) => {
      const sortByProperty = camelCase(sortBy);

      if (!sortBy) {
        return clientsConnection;
      }

      return {
        ...clientsConnection,
        edges: [...clientsConnection.edges].sort((a, b) => {
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

  handleHeaderClick = sortBy => {
    const toggled = this.state.sortDirection === 'desc' ? 'asc' : 'desc';
    const sortDirection = this.state.sortBy === sortBy ? toggled : 'desc';

    this.setState({ sortBy, sortDirection });
  };

  render() {
    const { onPageChange, clientsConnection } = this.props;
    const { sortBy, sortDirection } = this.state;
    const iconSize = 16;

    return (
      <Fragment>
        <ConnectionDataTable
          connection={this.createSortedClientsConnection(
            clientsConnection,
            sortBy,
            sortDirection
          )}
          pageSize={VIEW_CLIENTS_PAGE_SIZE}
          headers={['Client ID', 'Last Date Used']}
          sortByHeader={sortBy}
          sortDirection={sortDirection}
          onHeaderClick={this.handleHeaderClick}
          onPageChange={onPageChange}
          renderRow={({ node: client }) => (
            <TableRow key={client.clientId}>
              <TableCell>
                <TableCellListItem
                  dense
                  button
                  component={Link}
                  to={`/auth/clients/${encodeURIComponent(client.clientId)}`}>
                  <ListItemText
                    disableTypography
                    primary={
                      <Typography variant="body1">{client.clientId}</Typography>
                    }
                  />
                  <LinkIcon size={iconSize} />
                </TableCellListItem>
              </TableCell>
              <TableCell>
                <DateDistance from={client.lastDateUsed} />
              </TableCell>
            </TableRow>
          )}
        />
      </Fragment>
    );
  }
}
