import React, { Component } from "react";
import "./mapmenu.css";

class MapMenu extends Component {
  render() {
    var {
      menu,
      help,
      group,
      menucontent,
      helpcontent,
      groupcontent,
      toggleMenu,
      toggleHelp,
      toggleGroup,
    } = this.props;
    return (
      <div className="sidebar-gis">
        <div className={menu ? "sidebar-gis-inner" : "sidebar-gis-inner hide"}>
          <div
            className="sidebar-title"
            onClick={toggleMenu}
            title="Hide plot controls"
          >
            Menu
            <div className="sidebar-symbol">{"\u2715"}</div>
          </div>
          <div className="sidebar-content">{menucontent}</div>
        </div>

        <div
          className={
            group ? "sidebar-gis-inner wide" : "sidebar-gis-inner wide hide"
          }
        >
          <div
            className="sidebar-title"
            onClick={toggleGroup}
            title="Hide plot controls"
          >
            Layer Groups
            <div className="sidebar-symbol">{"\u2715"}</div>
          </div>
          <div className="sidebar-content">{groupcontent}</div>
        </div>

        <div className={help ? "sidebar-gis-inner" : "sidebar-gis-inner hide"}>
          <div className="sidebar-title" onClick={toggleHelp} title="Hide help">
            Information
            <div className="sidebar-symbol">{"\u2715"}</div>
          </div>
          <div className="sidebar-content">{helpcontent}</div>
        </div>
      </div>
    );
  }
}

export default MapMenu;