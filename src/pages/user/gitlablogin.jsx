// GitLabLogin.js
import React from 'react';
import { connect } from 'react-redux';
import PKCE from 'js-pkce';
import { auth } from "../../config.json";

class GitlabLogin extends React.Component {
  constructor(props) {
    super(props);

    this.pkce = new PKCE({
      client_id: auth.gitlab.clientId,
      redirect_uri: auth.gitlab.redirectUri,
      authorization_endpoint: "https://gitlab.com/oauth/authorize",
      token_endpoint: "https://gitlab.com/oauth/token",
      requested_scopes: "read_user",
    });
  }

  connect = () => {
    window.location.replace(this.pkce.authorizeUrl());
  };

  disconnect = () => {
    this.props.logout();
  };

  render() {
    const { user } = this.props;

    const message = user?.message;
    if (message) return (
      <div>
        <p>Error: {message}</p>
        <div>
          <button onClick={this.disconnect} className="logout">Disconnect from GitLab</button>
        </div>
      </div>
    );

    return (
      <div className="section user">
        <h2>Gitlab</h2>
        {user ? (
          <div>
            <h4>{user.name}, your profile will be used for the datasets hosted at <a href="https://gitlab.com/" target="_blank"><b>GitLab</b> (gitlab.com)</a>.</h4>
            <div class="container">
              <img src={user.avatar_url} alt="Avatar" width={80} />
              <div class="text">
                <p>Username: {user.username}</p>
                <p>Email: {user.email}</p>
              </div>
            </div>
            <div>
              <button onClick={this.disconnect} className="logout">Disconnect from GitLab</button>
            </div>
          </div>
        ) : (
          <div>
            <h4>Please identify yourself using your <a href="https://gitlab.com/" target="_blank"><b>GitLab</b> (gitlab.com)</a> account.</h4>
            <button onClick={this.connect} className="login">Connect to GitLab</button>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.auth?.gitlab?.user,
  accessToken: state.auth?.gitlab?.accessToken,
  refreshToken: state.auth?.gitlab?.refreshToken,
});

const mapDispatchToProps = dispatch => ({
  setAuth: (user, accessToken, refreshToken) => {
    dispatch({ type: 'SET_AUTH_GITLAB', payload: {user, accessToken, refreshToken} });
  },
  logout: () => {
    dispatch({ type: 'LOGOUT_GITLAB' });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(GitlabLogin);