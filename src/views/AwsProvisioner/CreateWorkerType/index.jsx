import { hot } from 'react-hot-loader';
import { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import TextField from '@material-ui/core/TextField';
import PlusIcon from 'mdi-react/PlusIcon';
import Dashboard from '../../../components/Dashboard';
import AwsProvisionerWorkerTypeEditor from '../../../components/AwsProvisionerWorkerTypeEditor';
import isWorkerTypeNameValid from '../../../utils/isWorkerTypeNameValid';

@hot(module)
@withStyles(theme => ({
  fab: {
    ...theme.mixins.fab,
  },
}))
export default class CreateWorkerType extends Component {
  state = {
    workerType: '',
    definition: undefined,
    invalidDefinition: false,
  };

  handleEditorChange = definition => {
    try {
      JSON.parse(definition);

      this.setState({
        definition,
        invalidDefinition: false,
      });
    } catch (err) {
      this.setState({
        definition,
        invalidDefinition: true,
      });
    }
  };

  handleInputChange = ({ target: { name, value } }) => {
    this.setState({ [name]: value });
  };

  handleCreateClick = () => {};

  render() {
    const { classes, user, onSignIn, onSignOut } = this.props;
    const { definition, workerType, invalidDefinition } = this.state;

    return (
      <Dashboard
        title="AWS Provisioner Create Worker Type"
        user={user}
        onSignIn={onSignIn}
        onSignOut={onSignOut}>
        <div>
          <List>
            <ListItem>
              <TextField
                label="Worker Type"
                name="workerType"
                error={
                  Boolean(workerType) && !isWorkerTypeNameValid(workerType)
                }
                onChange={this.handleInputChange}
                fullWidth
                value={workerType}
              />
            </ListItem>
            <ListItem>
              <AwsProvisionerWorkerTypeEditor
                value={definition}
                onEditorChange={this.handleEditorChange}
              />
            </ListItem>
          </List>

          <Tooltip placement="bottom" title="Create Worker Type">
            <div>
              <Button
                onClick={this.handleCreateClick}
                disabled={
                  invalidDefinition || !isWorkerTypeNameValid(workerType)
                }
                variant="fab"
                className={classes.fab}
                color="secondary">
                <PlusIcon />
              </Button>
            </div>
          </Tooltip>
        </div>
      </Dashboard>
    );
  }
}
