import React, { Component } from 'react';
import { connect } from 'react-redux';
import PKCE from 'js-pkce';
import { auth } from "../../auth";

// Eawag callback page: read the code from the URL, get the tokens and fetch the user data
class EawagUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      loading: true,
    };

    this.pkce = new PKCE({
      client_id: auth.eawag.clientId,
      redirect_uri: auth.eawag.redirectUri || window.location.origin + "/eawag",
      authorization_endpoint: "https://gitlab.eawag.ch/oauth/authorize",
      token_endpoint: "https://gitlab.eawag.ch/oauth/token",
      requested_scopes: "api read_api",
    });
  }

  componentDidMount() {
    // Check if redirected back with a code
    if (!this.props.user && window.location.search.includes('code=')) {
    this.pkce.exchangeForAccessToken(window.location.href)
      .then((resp) => {
        const accessToken = resp.access_token;
        const refreshToken = resp.refresh_token;
        const expiresIn = resp.expires_in;
        this.props.setAuth(null, accessToken, refreshToken, expiresIn);
        return fetch('https://gitlab.eawag.ch/api/v4/user', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      })
      .then(res => res.json())
      .then(user => {
        this.props.setAuth(user, this.props.accessToken, this.props.refreshToken, this.props.expiresIn);
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
    document.title = "Identities - Eawag - Datalakes";
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
  user: state.auth?.eawag?.user,
  accessToken: state.auth?.eawag?.accessToken,
  refreshToken: state.auth?.eawag?.refreshToken,
  expiresIn: state.auth?.eawag?.expiresIn,
});

const mapDispatchToProps = dispatch => ({
  setAuth: (user, accessToken, refreshToken, expiresIn) => {
    dispatch({ type: 'SET_AUTH_EAWAG', payload: {user, accessToken, refreshToken, expiresIn} });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(EawagUser);