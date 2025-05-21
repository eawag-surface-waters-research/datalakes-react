import React, { Component } from "react";
import { connect } from 'react-redux';
import { Link, NavLink } from "react-router-dom";
import logo from "./img/logo.svg";
import map from "./img/map.svg";
import data from "./img/data.svg";
import home from "./img/home.svg";
import about from "./img/about.svg";
import anonymous from "./img/anonymous.svg";
import user from "./img/user.svg";

import map_2 from "./img/map_2.svg";
import data_2 from "./img/data_2.svg";
import api_2 from "./img/api_2.svg";
import about_2 from "./img/about_2.svg";

import "./header.css";
import { th } from "date-fns/locale";

class Header extends Component {
  state = {};

  getUser = () => {
    if (this.props.auth?.renku?.user) {
      return this.props.auth.renku.user;
    } else if (this.props.auth?.gitlab?.user) {
      return this.props.auth.gitlab.user;
    } else {
      return null;
    }
  }

  render() {

    const userObj = this.getUser();
    const isAnonymous = userObj === null;

    return (
      <header id="header">
        <div className="header">
          <div className="header-inner">
            <div className="logo">
              <Link to="/?home">
                <img alt="Datalakes logo" src={logo} title="Go to homepage"/>
              </Link>
            </div>

            <div className="desktop-nav">
              <div className="desktop-navbar">
                <div className="links">
                  <NavLink
                    activeClassName="active"
                    className="header-item"
                    to="/map"
                  >
                    <img alt="Map Viewer" src={map_2} />
                    Map Viewer
                  </NavLink>
                  <NavLink
                    activeClassName="active"
                    className="header-item"
                    to="/data"
                  >
                    <img alt="Data Portal" src={data_2} />
                    Data Portal
                  </NavLink>
                  <NavLink
                    activeClassName="active"
                    className="header-item"
                    to="/api"
                  >
                    <img alt="API" src={api_2} />
                    API
                  </NavLink>
                  <Link className="header-item" to="/?about">
                    <img alt="About" src={about_2} />
                    About
                  </Link>
                  {
                    isAnonymous ? (
                      <Link className="header-item" to="/user">
                        <img alt="Login" src={anonymous} />
                        Login
                      </Link>
                    ) : (
                      <Link className="header-item" to="/user">
                        <img alt="Logout" src={user} />
                        {userObj.name}
                      </Link>
                    )
                  }
                </div>
              </div>
            </div>

            <div className="mobile-nav">
              <div className="mobile-navbar">
                <div className="mobile-flex">
                  <NavLink to="/?home">
                    <img alt="Home" src={home} />
                  </NavLink>
                  <NavLink activeClassName="imgactive" to="/map">
                    <img alt="Map Viewer" src={map} />
                  </NavLink>
                  <NavLink activeClassName="imgactive" to="/data">
                    <img alt="Data Portal" src={data} />
                  </NavLink>
                  <NavLink to="/?about">
                    <img alt="About" src={about} />
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(Header);
