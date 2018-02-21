import React, {Component} from 'react';
import Grid from 'material-ui/Grid/Grid';
import Typography from 'material-ui/Typography/Typography';
import AddToSlackButton from './AddToSlackButton.react';
import queryString from 'query-string';
import withRouter from 'react-router-dom/withRouter';
import PropTypes from 'prop-types';
import {graphql} from 'react-apollo';
import gql from 'graphql-tag';
import InstallationStatus from './InstallationStatus.react';

const propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string,
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  // GraphQL
  attemptInstall: PropTypes.func.isRequired,
};

class Install extends Component {
  constructor(props, context) {
    super(props);

    const redirectHost = context.uiHost; // From config (see index.js)
    this.redirectUri = `${redirectHost}${props.location.pathname}`;

    this.state = {
      installingSlackApplication: false,
      successInstallationSlackApplication: undefined, // true/false after attempt
      errors: [],
    }
  }

  componentDidMount() {
    const params = queryString.parse(this.props.location.search);
    if (params.code) {
      this.setState(() => ({installingSlackApplication: true}), () => {
        this.props.attemptInstall(params.code, process.env.SLACK_CLIENT_ID, this.redirectUri)
          .then(() => {
            this.setState(() => ({
              installingSlackApplication: false,
              successInstallationSlackApplication: true,
            }));
          })
          .catch((response) => {
            // TODO refactor this out as we start using it in other places
            if (Raven.isSetup()) {
              Raven.captureException(Error(`Installation error: ${JSON.stringify(response)}`));
            }
            this.setState(() => ({
              installingSlackApplication: false,
              successInstallationSlackApplication: false,
              errors: 'graphQLErrors' in response ? response.graphQLErrors.map(error => error.message) : [],
            }));
          })
      })
    }
  }

  render() {
    return (
      <Grid
        container
        direction='row'>
        <Grid item xs={1}/>
        <Grid item xs={10}>
          <Grid
            container
            direction='column'
            spacing={16}>
            <Grid item>
              <Typography variant='display1' style={{color: 'rgba(0, 0, 0, 0.87)'}}>
                Installing CodeClippy in Your Slack Workspace
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant='body1'>
                Text bla bla use CodeClippy in your own team to do XYZ. Make sure you are:
              </Typography>
              <ul>
                <li>Something</li>
                <li>Admin</li>
                <li>Sensitive Info</li>
              </ul>
              <Typography variant='body1'>
                If all good, click below to install.
              </Typography>
            </Grid>
            <Grid item>
              <AddToSlackButton redirectUri={this.redirectUri}/>
              {this.state.successInstallationSlackApplication === undefined && !this.state.installingSlackApplication
                ? null
                : <InstallationStatus
                  installingSlackApplication={this.state.installingSlackApplication}
                  successInstallationSlackApplication={this.state.successInstallationSlackApplication}
                  errors={this.state.errors}
                />}
            </Grid>
            <Grid item>
              <Typography variant='caption'>
                Not an admin in your workspace?
                Join <a target='_blank' rel='noopener noreferrer' href='https://www.codeclippy.com/get-started'>our
                community</a> instead.
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={1}/>
      </Grid>
    );
  }
}

Install.propTypes = propTypes;

Install.contextTypes = {
  uiHost: PropTypes.string.isRequired,
};

const attemptSlackInstallation = gql`
  mutation($code: String!, $clientId: String!, $redirectUri: String!) {
    attemptSlackInstallation(input: {code: $code, clientId: $clientId, redirectUri: $redirectUri}) {
      slackTeam {
        name
      }
    }
  }
`;

const InstallWithResult = graphql(attemptSlackInstallation, {
  props: ({mutate}) => ({
    attemptInstall: (code, clientId, redirectUri) => mutate({variables: {code, clientId, redirectUri}}),
  }),
})(withRouter(Install));

export default InstallWithResult;
