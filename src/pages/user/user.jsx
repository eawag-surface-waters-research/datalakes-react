import React, { Component } from "react";
import GithubLogin from "./githublogin";
import EawagLogin from "./eawaglogin";

class User extends Component {
  render() {
    document.title = "Identities - Datalakes";
    return (
      <div>
        <div className="user">
          <h1>Identities</h1>
          <h3>
            To access some Datalakes advanced features, please identify yourself
            using the account(s) where the dataset(s) of interest are hosted.
          </h3>
          <GithubLogin />
          <EawagLogin />
        </div>
      </div>
    );
  }
}

export default User;
