// GithubLogin.js
import React from 'react';
import { connect } from 'react-redux';
import { auth } from "../../config.json";

class GithubLogin extends React.Component {
  
  connect = () => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${auth.github.clientId}&redirect_uri=${auth.github.redirectUri}&scope=repo,user`;
    window.location.replace(githubAuthUrl);
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
          <button onClick={this.disconnect} className="logout">Disconnect from GitHub</button>
        </div>
      </div>
    );

    return (
      <div className="section user">
        <h2>GitHub</h2>
        {user ? (
          <div>
            <h4>{user.name}, your profile will be used for the datasets hosted at <a href="https://github.com/" target="_blank" rel="noopener noreferrer"><b>GitHub</b> (github.com)</a>.</h4>
            <div className="container">
              <img src={user.avatar_url} alt="Avatar" width={80} />
              <div className="text">
                <p>Username: {user.login}</p>
                <p>Email: {user.email}</p>
              </div>
            </div>
            <div>
              <button onClick={this.disconnect} className="logout">Disconnect from GitHub</button>
            </div>
          </div>
        ) : (
          <div>
            <h4>Please identify yourself using your <a href="https://github.com/" target="_blank" rel="noopener noreferrer"><b>GitHub</b> (github.com)</a> account.</h4>
            <button onClick={this.connect} className="login">Connect to GitHub</button>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.auth?.github?.user,
});

const mapDispatchToProps = dispatch => ({
  logout: () => {
    dispatch({ type: 'LOGOUT_GITHUB' });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(GithubLogin);