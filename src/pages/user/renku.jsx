import React, { Component } from 'react';
import { connect } from 'react-redux';
import PKCE from 'js-pkce';
import { auth } from "../../config.json";

// Renku callback page: read the code from the URL, get the tokens and fetch the user data
class RenkuUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      loading: true,
    };

    this.pkce = new PKCE({
      client_id: auth.renku.clientId,
      redirect_uri: auth.renku.redirectUri,
      authorization_endpoint: "https://gitlab.renkulab.io/oauth/authorize",
      token_endpoint: "https://gitlab.renkulab.io/oauth/token",
      requested_scopes: "read_user",
    });
  }

  componentDidMount() {
    // Check if redirected back with a code
    if (!this.props.user && window.location.search.includes('code=')) {
    this.pkce.exchangeForAccessToken(window.location.href)
      .then((resp) => {
        const accessToken = resp.access_token;
        const refreshToken = resp.refresh_token;
        this.props.setAuth(null, accessToken, refreshToken);
        return fetch('https://gitlab.renkulab.io/api/v4/user', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      })
      .then(res => res.json())
      .then(user => {
        this.props.setAuth(user, this.props.accessToken, this.props.refreshToken);
      })
      .catch(err => {
        this.setState({ error: err.message, loading: false });
      })
      .finally(() => {
        this.setState({ loading: false });
        // redirect to user page
        window.location.replace('/user');
      });
    } else {
      this.setState({ loading: false });
    }
  }

  render() {
    document.title = "Identities - Renku - Datalakes";
     return ( 
      <div>
        <div className="user">
          <h1>Identities</h1>
          <h3>Please wait while fetching user profile...</h3>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.auth?.renku?.user,
  accessToken: state.auth?.renku?.accessToken,
  refreshToken: state.auth?.renku?.refreshToken,
});

const mapDispatchToProps = dispatch => ({
  setAuth: (user, accessToken, refreshToken) => {
    dispatch({ type: 'SET_AUTH_RENKU', payload: {user, accessToken, refreshToken} });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(RenkuUser);