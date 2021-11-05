import React, { Component } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "./img/logo.svg";
import map from "./img/map.svg";
import data from "./img/data.svg";
import home from "./img/home.svg";
import more from "./img/more.svg";
import api from "./img/api.svg";
import contact from "./img/contact.svg";
import about from "./img/about.svg";

import "./header.css";

class Header extends Component {
  state = {
    showMenu: false,
    stuck: "",
  };

  toggle = () => {
    this.setState({ showMenu: !this.state.showMenu });
  };

  closeMenu = () => {
    this.setState({ showMenu: false });
  };

  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  handleScroll = () => {
    var { stuck } = this.state;
    if (window.pageYOffset > 35 && stuck === "") {
      this.setState({ stuck: "scroll" });
    } else if (window.pageYOffset < 35 && stuck === "scroll") {
      this.setState({ stuck: "" });
    }
  };

  render() {
    var { showMenu, stuck } = this.state;
    return (
      <header id="header">
        <div className={"header" + stuck}>
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
                    onClick={this.closeMenu}
                    to="/map"
                  >
                    Map Viewer
                  </NavLink>
                  <NavLink
                    activeClassName="active"
                    className="header-item"
                    onClick={this.closeMenu}
                    to="/data"
                  >
                    Data Portal
                  </NavLink>
                  <NavLink
                    activeClassName="active"
                    className="header-item"
                    onClick={this.closeMenu}
                    to="/api"
                  >
                    API
                  </NavLink>
                </div>
                <div className="menu-icon header-item" onClick={this.toggle}>
                  Menu <div className="symbol">{showMenu ? "<" : ">"}</div>
                </div>
              </div>
              <div className={showMenu ? "desktop-menu show" : "desktop-menu"}>
                <Link onClick={this.closeMenu} to="/">
                  Home
                </Link>
                <div className="midscreen">
                  <NavLink
                    activeClassName="active"
                    className="header-item"
                    onClick={this.closeMenu}
                    to="/map"
                  >
                    Map Viewer
                  </NavLink>
                  <NavLink
                    activeClassName="active"
                    className="header-item"
                    onClick={this.closeMenu}
                    to="/data"
                  >
                    Data Portal
                  </NavLink>
                  <NavLink
                    activeClassName="active"
                    className="header-item"
                    onClick={this.closeMenu}
                    to="/api"
                  >
                    API
                  </NavLink>
                </div>
                <Link
                  onClick={this.closeMenu}
                  className="header-item"
                  to="/?ourdata"
                >
                  Our Data
                </Link>
                <Link
                  onClick={this.closeMenu}
                  className="header-item"
                  to="/?accessoptions"
                >
                  Access Options
                </Link>
                <Link
                  onClick={this.closeMenu}
                  className="header-item"
                  to="/?about"
                >
                  About
                </Link>
                <Link
                  onClick={this.closeMenu}
                  className="header-item"
                  to="/?contact"
                >
                  Contact
                </Link>
              </div>
            </div>

            <div className="mobile-nav">
              <div className={showMenu ? "mobile-menu show" : "mobile-menu"}>
                <div className="mobile-flex">
                  <NavLink
                    activeClassName="imgactive"
                    onClick={this.closeMenu}
                    to="/api"
                  >
                    <img alt="API" src={api} />
                  </NavLink>
                  <NavLink onClick={this.closeMenu} to="/?about">
                    <img alt="About" src={about} />
                  </NavLink>
                  <NavLink onClick={this.closeMenu} to="/?contact">
                    <img alt="Contact" src={contact} />
                  </NavLink>
                </div>
              </div>
              <div className="mobile-navbar">
                <div className="mobile-flex">
                  <NavLink onClick={this.closeMenu} to="/">
                    <img alt="Home" src={home} />
                  </NavLink>
                  <NavLink
                    activeClassName="imgactive"
                    onClick={this.closeMenu}
                    to="/map"
                  >
                    <img alt="Map Viewer" src={map} />
                  </NavLink>
                  <NavLink
                    activeClassName="imgactive"
                    onClick={this.closeMenu}
                    to="/data"
                  >
                    <img alt="Data Portal" src={data} />
                  </NavLink>
                  <div onClick={this.toggle} className="more">
                    <img alt="More" src={more} />
                  </div>
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
