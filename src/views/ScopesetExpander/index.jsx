import { hot } from 'react-hot-loader';
import { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Query } from 'react-apollo';
import CodeEditor from '@mozilla-frontend-infra/components/CodeEditor';
import ErrorPanel from '@mozilla-frontend-infra/components/ErrorPanel';
import Spinner from '@mozilla-frontend-infra/components/Spinner';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ArrowExpandVerticalIcon from 'mdi-react/ArrowExpandVerticalIcon';
import LinkIcon from 'mdi-react/LinkIcon';
import Dashboard from '../../components/Dashboard/index';
import splitLines from '../../utils/splitLines';
import scopesetQuery from './scopeset.graphql';

@hot(module)
@withStyles(theme => ({
  actionButton: {
    ...theme.mixins.fab,
  },
  editor: {
    marginBottom: theme.spacing.double,
  },
  title: {
    marginBottom: theme.spacing.double,
  },
  listItemButton: {
    ...theme.mixins.listItemButton,
  },
}))
export default class ScopesetExpander extends Component {
  state = {
    scopeText: '',
  };

  handleExpandScopesClick = async () => {
    const scopes = splitLines(this.state.scopeText);

    this.setState({ scopes });
  };

  handleScopesChange = scopeText => {
    this.setState({ scopeText });
  };

  render() {
    const { classes, user, onSignIn, onSignOut, onThemeToggle } = this.props;
    const { scopes, scopeText } = this.state;

    return (
      <Dashboard
        title="Expand Scopesets"
        user={user}
        onSignIn={onSignIn}
        onSignOut={onSignOut}
        onThemeToggle={onThemeToggle}>
        <Fragment>
          <CodeEditor
            className={classes.editor}
            onChange={this.handleScopesChange}
            placeholder="new-scope:for-something:*"
            mode="scopemode"
            value={scopeText}
          />
          {scopes && (
            <Query query={scopesetQuery} variables={{ scopes }}>
              {({ loading, error, data: { expandScopes } }) => (
                <List dense>
                  {loading && (
                    <ListItem>
                      <Spinner />
                    </ListItem>
                  )}
                  {error &&
                    error.graphQLErrors && (
                      <ListItem>
                        <ErrorPanel error={error} />
                      </ListItem>
                    )}
                  {expandScopes &&
                    expandScopes.map(scope => (
                      <ListItem
                        key={scope}
                        button
                        component={Link}
                        to={`/auth/scopes/${encodeURIComponent(scope)}`}
                        className={classes.listItemButton}>
                        <ListItemText secondary={<code>{scope}</code>} />
                        <LinkIcon size={16} />
                      </ListItem>
                    ))}
                </List>
              )}
            </Query>
          )}
          <Tooltip title="Expand Scopes">
            <div className={classes.actionButton}>
              <Button
                color="secondary"
                variant="fab"
                onClick={this.handleExpandScopesClick}>
                <ArrowExpandVerticalIcon />
              </Button>
            </div>
          </Tooltip>
        </Fragment>
      </Dashboard>
    );
  }
}
