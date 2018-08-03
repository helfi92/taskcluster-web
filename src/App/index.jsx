import { hot } from 'react-hot-loader';
import { Component } from 'react';
import { BrowserRouter, Switch } from 'react-router-dom';
import storage from 'localforage';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { from } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { CachePersistor } from 'apollo-cache-persist';
import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Authorize } from 'react-auth0-components';
import RouteWithProps from '../components/RouteWithProps';
import FontStager from '../components/FontStager';
import ErrorPanel from '../components/ErrorPanel';
import ThemeContext from './ThemeContext';
import routes from './routes';
import theme from '../theme';

@hot(module)
@withStyles(theme => ({
  '@global': {
    [[
      'input:-webkit-autofill',
      'input:-webkit-autofill:hover',
      'input:-webkit-autofill:focus',
      'input:-webkit-autofill:active',
    ].join(',')]: {
      transition:
        'background-color 5000s ease-in-out 0s, color 5000s ease-in-out 0s',
      transitionDelay: 'background-color 5000s, color 5000s',
    },
    '.mdi-icon': {
      fill: theme.palette.text.primary,
    },
    '.CodeMirror': {
      fontSize: 13,
      height: '100% !important',
    },
    '[disabled] .mdi-icon': {
      fill: theme.palette.primary.light,
    },
    a: {
      color: theme.palette.text.primary,
    },
    'html, body': {
      color: theme.palette.text.secondary,
    },
    pre: {
      overflowX: 'auto',
    },
    'pre, :not(pre) > code': {
      ...theme.mixins.highlight,
    },
  },
}))
export default class App extends Component {
  state = {
    authResult: null,
    userInfo: null,
    error: null,
    authorize: Authorize.AUTHORIZATION_DONE || false,
    theme: theme.lightTheme,
  };

  cache = new InMemoryCache();
  persistence = new CachePersistor({
    cache: this.cache,
    storage,
  });
  apolloClient = new ApolloClient({
    cache: this.cache,
    link: from([
      setContext((request, { headers }) => ({
        headers: {
          ...headers,
          ...(this.state.authResult && this.state.authResult.accessToken
            ? { Authorization: `Bearer ${this.state.authResult.accessToken}` }
            : null),
        },
      })),
      new HttpLink(),
    ]),
  });

  componentDidCatch(error) {
    this.setState({ error });
  }

  toggleTheme = () => {
    this.setState({
      theme:
        this.state.theme.palette.type === 'dark'
          ? theme.lightTheme
          : theme.darkTheme,
    });
  };

  handleError = error => {
    if (error.error && error.error === 'login_required') {
      this.setState({
        authorize: false,
        error: null,
        authResult: null,
        userInfo: null,
      });
    } else if (error.error_description) {
      this.setState({
        error: new Error(error.error_description),
        authResult: null,
        userInfo: null,
      });
    }
  };

  handleStartAuthorization = () => {
    this.setState({ authorize: true });
  };

  handleSignOut = () => {
    this.setState({ authorize: false, authResult: null, userInfo: null });
  };

  handleAuthorization = ({ authResult, userInfo }) => {
    this.setState({ authResult, userInfo });
  };

  render() {
    const { authorize, error, userInfo, theme } = this.state;

    return (
      <ApolloProvider client={this.apolloClient}>
        <ThemeContext.Provider value={this.toggleTheme}>
          <MuiThemeProvider theme={theme}>
            <FontStager />
            <CssBaseline />
            {error && <ErrorPanel error={error} />}
            <Authorize
              popup
              authorize={authorize}
              onError={this.handleError}
              onAuthorize={this.handleAuthorization}
              domain={process.env.AUTH0_DOMAIN}
              clientID={process.env.AUTH0_CLIENT_ID}
              redirectUri={process.env.AUTH0_REDIRECT_URI}
              responseType={process.env.AUTH0_RESPONSE_TYPE}
              scope={process.env.AUTH0_SCOPE}
            />
            <BrowserRouter>
              <Switch>
                {routes.map(props => (
                  <RouteWithProps
                    key={props.path || 'not-found'}
                    {...props}
                    user={userInfo}
                    onSignIn={this.handleStartAuthorization}
                    onSignOut={this.handleSignOut}
                  />
                ))}
              </Switch>
            </BrowserRouter>
          </MuiThemeProvider>
        </ThemeContext.Provider>
      </ApolloProvider>
    );
  }
}
