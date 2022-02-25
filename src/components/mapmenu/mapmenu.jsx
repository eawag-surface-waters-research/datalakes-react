import React, { Component } from "react";
import "./mapmenu.css";

class MapMenu extends Component {
  render() {
    var {
      menucontent,
      groupcontent,
    } = this.props;
    return (
      <div className="sidebar-gis">
        <div className="sidebar-content">{menucontent}</div>
        <div className="sidebar-content">{groupcontent}</div>
      </div>
    );
  }
}

export default MapMenu;