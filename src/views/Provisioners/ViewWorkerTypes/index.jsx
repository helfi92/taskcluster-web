import { hot } from 'react-hot-loader';
import { Component, Fragment } from 'react';
import { graphql } from 'react-apollo';
import dotProp from 'dot-prop-immutable';
import { withStyles } from '@material-ui/core/styles';
import { MenuItem, TextField } from '@material-ui/core';
import Spinner from '../../../components/Spinner';
import WorkerTypesTable from '../../../components/WorkerTypesTable';
import ErrorPanel from '../../../components/ErrorPanel';
import Dashboard from '../../../components/Dashboard';
import { VIEW_WORKER_TYPES_PAGE_SIZE } from '../../../utils/constants';
import workerTypesQuery from './workerTypes.graphql';

@hot(module)
@withStyles(theme => ({
  actionBar: {
    display: 'flex',
    flexDirection: 'row-reverse',
  },
  dropdown: {
    minWidth: 200,
    marginBottom: theme.spacing.double,
  },
}))
@graphql(workerTypesQuery, {
  skip: props => !props.match.params.provisionerId,
  options: ({
    match: {
      params: { provisionerId },
    },
  }) => ({
    variables: {
      provisionerId,
      workerTypesConnection: {
        limit: VIEW_WORKER_TYPES_PAGE_SIZE,
      },
      isAwsProvisioner: provisionerId === 'aws-provisioner-v1',
    },
  }),
})
export default class ViewWorkerTypes extends Component {
  handleProvisionerChange = ({ target }) => {
    this.props.history.push(`/provisioners/${target.value}/worker-types`);
  };

  handlePageChange = ({ cursor, previousCursor }) => {
    const {
      match: {
        params: { provisionerId },
      },
      data: { fetchMore },
    } = this.props;

    return fetchMore({
      query: workerTypesQuery,
      variables: {
        provisionerId,
        workerTypesConnection: {
          limit: VIEW_WORKER_TYPES_PAGE_SIZE,
          cursor,
          previousCursor,
        },
        isAwsProvisioner: provisionerId === 'aws-provisioner-v1',
      },
      updateQuery(
        previousResult,
        {
          fetchMoreResult: { workerTypes },
        }
      ) {
        const { edges, pageInfo } = workerTypes;

        if (!edges.length) {
          return previousResult;
        }

        return dotProp.set(previousResult, `workerTypes`, workerTypes =>
          dotProp.set(
            dotProp.set(workerTypes, 'edges', edges),
            'pageInfo',
            pageInfo
          )
        );
      },
    });
  };

  render() {
    const {
      classes,
      match: {
        params: { provisionerId },
      },
      user,
      onSignIn,
      onSignOut,
      data: {
        loading,
        error,
        provisioners,
        workerTypes,
        awsProvisionerWorkerTypeSummaries,
      },
    } = this.props;

    return (
      <Dashboard
        title="Worker Types"
        user={user}
        onSignIn={onSignIn}
        onSignOut={onSignOut}>
        <Fragment>
          {!workerTypes && loading && <Spinner loading />}
          {error && error.graphQLErrors && <ErrorPanel error={error} />}
          {provisioners &&
            workerTypes && (
              <Fragment>
                <div className={classes.actionBar}>
                  <TextField
                    disabled={loading}
                    className={classes.dropdown}
                    select
                    label="Provisioner ID"
                    value={provisionerId}
                    onChange={this.handleProvisionerChange}>
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {provisioners.edges.map(({ node }) => (
                      <MenuItem
                        key={node.provisionerId}
                        value={node.provisionerId}>
                        {node.provisionerId}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>
                <WorkerTypesTable
                  workerTypesConnection={workerTypes}
                  provisionerId={provisionerId}
                  onPageChange={this.handlePageChange}
                  awsProvisionerWorkerTypeSummaries={
                    awsProvisionerWorkerTypeSummaries
                  }
                />
              </Fragment>
            )}
        </Fragment>
      </Dashboard>
    );
  }
}
