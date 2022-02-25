import React, { Component } from "react";
import "./css/datalakesgis.css"

class GIS extends Component {
  state = {};
  render() {
    return (
      <div className="gis">
        <div className="sidebar">
          <div className="boundary" />
          <div className="sidebar-inner">Some sidebar stuff here</div>
        </div>
        <div className="map">
            Basemap Here
        </div>
      </div>
    );
  }
}

export default GIS;
