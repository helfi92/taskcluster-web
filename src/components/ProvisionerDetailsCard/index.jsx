import { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { bool } from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Card, { CardContent } from 'material-ui/Card';
import Collapse from 'material-ui/transitions/Collapse';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Typography from 'material-ui/Typography';
import Tooltip from 'material-ui/Tooltip';
import Button from 'material-ui/Button';
import ChevronUpIcon from 'mdi-react/ChevronUpIcon';
import ChevronDownIcon from 'mdi-react/ChevronDownIcon';
import LinkIcon from 'mdi-react/LinkIcon';
import Markdown from '../Markdown';
import DateDistance from '../DateDistance';
import StatusLabel from '../StatusLabel';
import { provisioner } from '../../utils/prop-types';

@withRouter
@withStyles(theme => ({
  actionButton: {
    marginRight: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
    fontSize: '0.7rem',
  },
  headline: {
    paddingLeft: theme.spacing.triple,
    paddingRight: theme.spacing.triple,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  cardContent: {
    minHeight: 415,
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: theme.spacing.double,
    paddingBottom: theme.spacing.double,
    '&:last-child': {
      paddingBottom: theme.spacing.triple,
    },
  },
  sourceHeadline: {
    textOverflow: 'ellipsis',
    overflowX: 'hidden',
  },
  listItemButton: {
    ...theme.mixins.listItemButton,
  },
  pre: {
    margin: 0,
    fontSize: theme.typography.body2.fontSize,
  },
}))
/**
 * Render information in a card layout about a provisioner.
 */
export default class ProvisionerDetailsCard extends Component {
  static propTypes = {
    /** A GraphQL provisioner response. */
    provisioner: provisioner.isRequired,
    /** If true, the card component will be compact */
    dense: bool,
  };

  static defaultProps = {
    dense: false,
  };

  state = {
    showDescription: false,
  };

  handleToggleDescription = () => {
    this.setState({ showDescription: !this.state.showDescription });
  };

  handleProvisionerChange = () => {
    this.props.history.push(
      `/provisioners/${this.props.provisioner.provisionerId}`
    );
  };

  // TODO: Handle action request
  handleActionClick = () => {};

  renderActions = () => {
    const { classes, provisioner } = this.props;
    const actions = provisioner.actions.filter(
      ({ context }) => context === 'provisioner'
    );

    return actions.length
      ? actions.map(action => (
          <Tooltip
            enterDelay={300}
            key={action.title}
            id={`${action.title}-tooltip`}
            title={action.description}>
            <Button
              onClick={() => this.handleActionClick(action)}
              className={classes.actionButton}
              size="small"
              variant="raised">
              {action.title}
            </Button>
          </Tooltip>
        ))
      : 'n/a';
  };

  renderDescription = () => {
    const { provisioner, classes } = this.props;
    const { showDescription } = this.state;

    if (!provisioner.description) {
      return (
        <ListItem>
          <ListItemText primary="Description" secondary="n/a" />
        </ListItem>
      );
    }

    return (
      <Fragment>
        <ListItem
          button
          className={classes.listItemButton}
          onClick={this.handleToggleDescription}>
          <ListItemText primary="Description" />
          {showDescription ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </ListItem>
        <Collapse in={showDescription} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem>
              <ListItemText
                secondary={<Markdown>{provisioner.description}</Markdown>}
              />
            </ListItem>
          </List>
        </Collapse>
      </Fragment>
    );
  };

  render() {
    const { classes, provisioner, dense } = this.props;

    return (
      <Card raised>
        <CardContent classes={{ root: classes.cardContent }}>
          <Typography variant="headline" className={classes.headline}>
            {provisioner.provisionerId}
          </Typography>
          <List dense={dense}>
            <ListItem>
              <ListItemText
                primary="Last Active"
                secondary={<DateDistance from={provisioner.lastDateActive} />}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Expires"
                secondary={<DateDistance from={provisioner.expires} />}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Stability"
                secondary={<StatusLabel state={provisioner.stability} />}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Actions"
                secondary={this.renderActions()}
              />
            </ListItem>
            <ListItem
              className={classes.listItemButton}
              button
              onClick={this.handleProvisionerChange}>
              <ListItemText primary="Explore worker type" />
              <LinkIcon />
            </ListItem>
            {this.renderDescription()}
          </List>
        </CardContent>
      </Card>
    );
  }
}
