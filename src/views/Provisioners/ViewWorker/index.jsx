import { hot } from 'react-hot-loader';
import { Component, Fragment } from 'react';
import { graphql } from 'react-apollo';
import { format, addYears, isAfter } from 'date-fns';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import HammerIcon from 'mdi-react/HammerIcon';
import { TextField } from '@material-ui/core';
import HomeLockIcon from 'mdi-react/HomeLockIcon';
import HomeLockOpenIcon from 'mdi-react/HomeLockOpenIcon';
import Dashboard from '../../../components/Dashboard';
import Spinner from '../../../components/Spinner';
import ErrorPanel from '../../../components/ErrorPanel';
import WorkerDetailsCard from '../../../components/WorkerDetailsCard';
import DialogAction from '../../../components/DialogAction';
import SpeedDial from '../../../components/SpeedDial';
import WorkerTable from '../../../components/WorkerTable';
import workerQuery from './worker.graphql';
import sleep from '../../../utils/sleep';

@hot(module)
@graphql(workerQuery, {
  skip: props => !props.match.params.provisionerId,
  options: ({ match: { params } }) => ({
    variables: params,
  }),
})
export default class ViewWorker extends Component {
  state = {
    dialogOpen: false,
    dialogTitle: null,
    dialogBody: null,
    quarantineUntilInput: null,
  };

  static getDerivedStateFromProps({ data: { worker } }) {
    return {
      quarantineUntilInput:
        worker && worker.quarantineUntil
          ? worker.quarantineUntil
          : addYears(new Date(), 1000),
    };
  }

  handleDialogOpen = action => {
    this.setState({
      dialogOpen: true,
      ...(action
        ? {
            dialogTitle: action.title,
            dialogBody: action.description,
          }
        : null),
    });
  };

  handleDialogClose = () => {
    this.setState({
      dialogOpen: false,
      dialogTitle: null,
      dialogBody: null,
    });
  };

  // TODO: Add action request
  handleDialogSubmit = async () => {
    await sleep(2000);
  };

  handleQuarantineChange = ({ target }) => {
    this.setState({ quarantineUntilInput: target.value });
  };

  render() {
    const {
      user,
      onSignIn,
      onSignOut,
      data: { loading, error, worker },
    } = this.props;
    const {
      dialogOpen,
      dialogTitle,
      dialogBody,
      quarantineUntilInput,
    } = this.state;

    return (
      <Dashboard
        title="Worker"
        user={user}
        onSignIn={onSignIn}
        onSignOut={onSignOut}>
        <Fragment>
          {loading && <Spinner loading />}
          {error && error.graphQLErrors && <ErrorPanel error={error} />}
          {worker && (
            <Fragment>
              <WorkerDetailsCard worker={worker} />
              <br />
              <WorkerTable worker={worker} />
              <SpeedDial>
                <SpeedDialAction
                  icon={
                    isAfter(
                      worker.quarantineUntil || new Date(),
                      new Date()
                    ) ? (
                      <HomeLockOpenIcon />
                    ) : (
                      <HomeLockIcon />
                    )
                  }
                  tooltipTitle={
                    worker.quarantineUntil ? 'Update Quarantine' : 'Quarantine'
                  }
                  onClick={this.handleDialogOpen}
                  ButtonProps={{ color: 'secondary' }}
                />
                {worker.actions.map(action => (
                  <SpeedDialAction
                    key={action.title}
                    icon={<HammerIcon />}
                    onClick={() => this.handleDialogOpen(action)}
                    ButtonProps={{ color: 'secondary' }}
                    tooltipTitle={
                      <div>
                        <div>{action.title}</div>
                        <div>{action.description}</div>
                      </div>
                    }
                  />
                ))}
              </SpeedDial>
              {dialogOpen &&
                (dialogTitle ? (
                  <DialogAction
                    open={dialogOpen}
                    title={dialogTitle}
                    body={dialogBody}
                    confirmText={dialogTitle}
                    onSubmit={this.handleDialogSubmit}
                    onClose={this.handleDialogClose}
                  />
                ) : (
                  <DialogAction
                    open={dialogOpen}
                    title="Quarantine?"
                    body={
                      <Fragment>
                        <Fragment>
                          Quarantining a worker allows the machine to remain
                          alive but not accept jobs. Note that a quarantine can
                          be lifted by setting &quot;Quarantine Until&quot; to
                          the present time or somewhere in the past.
                        </Fragment>
                        <br />
                        <br />
                        <TextField
                          id="date"
                          label="Quarantine Until"
                          type="date"
                          value={format(quarantineUntilInput, 'YYYY-MM-DD')}
                          onChange={this.handleQuarantineChange}
                        />
                      </Fragment>
                    }
                    confirmText={
                      worker.quarantineUntil ? 'Update' : 'Quarantine'
                    }
                    onSubmit={this.handleDialogSubmit}
                    onClose={this.handleDialogClose}
                  />
                ))}
            </Fragment>
          )}
        </Fragment>
      </Dashboard>
    );
  }
}
