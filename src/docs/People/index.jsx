import { PureComponent } from 'react';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Card, { CardContent } from 'material-ui/Card';
import Avatar from 'material-ui/Avatar';
import Grid from 'material-ui/Grid';

const styles = () => ({
  card: {
    flexDirection: 'column',
    display: 'flex',
    alignItems: 'center'
  },
  avatar: {
    height: 80,
    width: 80
  }
});

class People extends PureComponent {
  constructor(props) {
    super(props);

    this.people = [
      'ydidwania',
      'sfraser',
      'prachi1210',
      'anejaalisha',
      'alesilva241',
      'auni',
      'samanthayu',
      'tom.prince',
      'TheNavigat',
      'bastien.abadie',
      'lteigrob',
      'ayub.mohamed',
      'yannland',
      't0xicCode',
      'ireneOwl',
      'elenasolomon',
      'kt',
      'andreadelrio',
      'anarute',
      'amiyaguchi',
      'chinmaykousik1',
      'akhtar.hammad',
      'reznord',
      'grenade',
      'jonasfj',
      'eli',
      'jhford',
      'bstack',
      'helfi',
      'pmoore',
      'garndt',
      'wcosta',
      'dustin',
      'sdeckelmann',
      'jlal'
    ];
  }

  renderPerson(person, key) {
    const { classes } = this.props;

    return (
      <Grid key={`person-${key}`} item xs={12} sm={6} md={3}>
        <Card className={classes.card}>
          <CardContent>
            <Avatar
              className={classes.avatar}
              src="https://semantic-ui.com/images/avatar2/large/kristy.png"
            />
          </CardContent>
          <CardContent>
            <Typography>{person}</Typography>
          </CardContent>
        </Card>
      </Grid>
    );
  }

  renderPeople = () => {
    const renderPeople = this.people.map(person => this.renderPerson(person));

    return <Grid container>{renderPeople}</Grid>;
  };

  render() {
    return (
      <div>
        <Grid container>
          <Grid item xs={12} md={6}>
            <Typography variant="title" gutterBottom component="h1">
              Welcome!
            </Typography>
            <Typography gutterBottom component="p">
              Taskcluster is a Mozilla project, and we believe in working in an
              open, welcoming fashion. The people listed here have contributed
              to the Taskcluster project. Your name{' '}
              <a href="https://wiki.mozilla.org/Taskcluster#Contributing">
                could be here, too!
              </a>
            </Typography>
          </Grid>
        </Grid>
        {this.renderPeople()}
      </div>
    );
  }
}

export default withStyles(styles)(People);
