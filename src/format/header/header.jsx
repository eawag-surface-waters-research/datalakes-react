import React, { Component } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "./img/logo.svg";
import map from "./img/map.svg";
import data from "./img/data.svg";
import home from "./img/home.svg";
import about from "./img/about.svg";

import "./header.css";

class Header extends Component {
  state = {};

  render() {
    return (
      <header id="header">
        <div className="header">
          <div className="header-inner">
            <div className="logo">
              <Link to="/">
                <img alt="Datalakes logo" src={logo} />
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
                    MAP VIEWER
                  </NavLink>
                  <NavLink
                    activeClassName="active"
                    className="header-item"
                    to="/data"
                  >
                    DATA PORTAL
                  </NavLink>
                  <NavLink
                    activeClassName="active"
                    className="header-item"
                    to="/api"
                  >
                    API
                  </NavLink>
                  <Link className="header-item" to="/?about">
                    ABOUT
                  </Link>
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

export default Header;
