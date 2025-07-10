import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from "axios";
import { apiUrl } from "../../config.json";

// GitHub callback page: read the code from the URL, get the tokens and fetch the user data
class GithubUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      loading: true,
    };
  }

  componentDidMount() {
    // Check if redirected back with a code
    if (!this.props.user && window.location.search.includes('code=')) {
      const code = new URLSearchParams(window.location.search).get('code');
      console.debug("GitHub code:", code);
      
      axios.post(`${apiUrl}/auth/github/token`, { code })
        .then(response => {
          const { token, user } = response.data;
          this.props.setAuth(user, token, null, null);
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
    document.title = "Identities - GitHub - Datalakes";
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
  user: state.auth?.github?.user,
  accessToken: state.auth?.github?.accessToken,
  refreshToken: state.auth?.github?.refreshToken,
  expiresIn: state.auth?.github?.expiresIn,
});

const mapDispatchToProps = dispatch => ({
  setAuth: (user, accessToken, refreshToken, expiresIn) => {
    dispatch({ type: 'SET_AUTH_GITHUB', payload: {user, accessToken, refreshToken, expiresIn} });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(GithubUser);