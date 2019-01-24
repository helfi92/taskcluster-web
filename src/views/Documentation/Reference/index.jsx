import React, { Component, Fragment } from 'react';
import { object } from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Entry from './Entry';
import Markdown from '../../../components/Markdown';
import HeaderWithAnchor from '../../../components/HeaderWithAnchor';

@withRouter
export default class Reference extends Component {
  static propTypes = {
    /** The JSON object of api.json or events.json.  */
    json: object.isRequired,
  };

  render() {
    const {
      json: { entries, title, baseUrl, description, exchangePrefix },
    } = this.props;
    const functionEntries =
      entries && entries.filter(({ type }) => type === 'function');
    const topicExchangeEntries =
      entries && entries.filter(({ type }) => type === 'topic-exchange');

    return (
      <div>
        <HeaderWithAnchor>{title}</HeaderWithAnchor>
        <Markdown>{description}</Markdown>
        {baseUrl && (
          <List>
            <ListItem disableGutters>
              <ListItemText
                primary="Base URL"
                secondary={<code>{baseUrl}</code>}
              />
            </ListItem>
          </List>
        )}
        <br />
        {topicExchangeEntries &&
          Boolean(topicExchangeEntries.length) && (
            <Fragment>
              <Typography gutterBottom component="h2" variant="h5">
                Exchanges
              </Typography>
              {topicExchangeEntries.map(entry => (
                <Entry
                  key={entry.name}
                  type="topic-exchange"
                  entry={entry}
                  exchangePrefix={exchangePrefix}
                />
              ))}
            </Fragment>
          )}
        {functionEntries &&
          Boolean(functionEntries.length) && (
            <Fragment>
              <Typography component="h2" variant="h5">
                Functions
              </Typography>
              <Typography gutterBottom>
                For more information on invoking the API methods described here,
                see <Link to="/docs/manual/apis">Using the APIs</Link> in the
                manual.
              </Typography>
              {functionEntries.map(entry => (
                <Entry
                  key={`${entry.name}-${entry.query}`}
                  type="function"
                  entry={entry}
                />
              ))}
            </Fragment>
          )}
      </div>
    );
  }
}
