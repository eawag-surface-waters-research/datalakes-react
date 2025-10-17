// EawagLogin.js
import React from 'react';
import { connect } from 'react-redux';
import PKCE from 'js-pkce';
import { auth } from "../../auth";



class EawagLogin extends React.Component {
  constructor(props) {
    super(props);

    this.pkce = new PKCE({
      client_id: auth.eawag.clientId,
      redirect_uri: auth.eawag.redirectUri || window.location.origin + "/eawag",
      authorization_endpoint: "https://gitlab.eawag.ch/oauth/authorize",
      token_endpoint: "https://gitlab.eawag.ch/oauth/token",
      requested_scopes: "api read_api",
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
          <button onClick={this.disconnect} className="logout">Disconnect from Eawag GitLab</button>
        </div>
      </div>
    );

    return (
      <div className="section user">
        <h2>Eawag</h2>
        {user ? (
          <div>
            <h4>{user.name}, your profile will be used for the datasets hosted at <a href="https://gitlab.eawag.ch/" target="_blank" rel="noopener noreferrer"><b>Eawag</b> (gitlab.eawag.ch)</a>.</h4>
            <div className="container">
              <img src={user.avatar_url} alt="Avatar" width={80} />
              <div className="text">
                <p>Username: {user.username}</p>
                <p>Email: {user.email}</p>
              </div>
            </div>
            <div>
              <button onClick={this.disconnect} className="logout">Disconnect from Eawag</button>
            </div>
          </div>
        ) : (
          <div>
            <h4>Please identify yourself using your <a href="https://gitlab.eawag.ch/" target="_blank" rel="noopener noreferrer"><b>Eawag</b> (gitlab.eawag.ch)</a> account.</h4>
            <button onClick={this.connect} className="login">Connect to Eawag</button>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.auth?.eawag?.user,
});

const mapDispatchToProps = dispatch => ({
  logout: () => {
    dispatch({ type: 'LOGOUT_EAWAG' });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(EawagLogin);