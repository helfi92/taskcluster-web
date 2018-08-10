import { hot } from 'react-hot-loader';
import { Component, Fragment } from 'react';
import { Redirect } from 'react-router-dom';
import { graphql } from 'react-apollo';
import cloneDeep from 'lodash.clonedeep';
import ErrorPanel from '@mozilla-frontend-infra/components/ErrorPanel';
import Spinner from '@mozilla-frontend-infra/components/Spinner';
import Dashboard from '../../../components/Dashboard';
import parameterizeTask from '../../../utils/parameterizeTask';
import removeKeys from '../../../utils/removeKeys';
import taskQuery from './task.graphql';

@hot(module)
@graphql(taskQuery, {
  options: props => ({
    variables: {
      taskId: props.match.params.taskId,
    },
  }),
})
export default class TaskRedirect extends Component {
  render() {
    const {
      user,
      onSignIn,
      onSignOut,
      match: {
        params: { action },
      },
      data: { loading, error, task },
    } = this.props;
    // Apollo feature request: https://github.com/apollographql/apollo-feature-requests/issues/6
    const sanitizedTask = task && removeKeys(cloneDeep(task), ['__typename']);

    return (
      <Dashboard user={user} onSignIn={onSignIn} onSignOut={onSignOut}>
        <Fragment>
          {error ? (
            <ErrorPanel error={error} />
          ) : (
            <Fragment>
              {loading && <Spinner />}
              {!loading &&
                task && (
                  <Redirect
                    to={{
                      pathname:
                        action === 'interactive'
                          ? '/tasks/create/interactive'
                          : '/tasks/create',
                      state: {
                        task:
                          action === 'interactive'
                            ? parameterizeTask(sanitizedTask)
                            : sanitizedTask,
                      },
                    }}
                  />
                )}
            </Fragment>
          )}
        </Fragment>
      </Dashboard>
    );
  }
}
