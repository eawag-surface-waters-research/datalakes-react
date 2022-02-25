import React, { Component } from "react";
import GIS from "../../graphs/leaflet/datalakesgis";
import "./mapviewer.css";

class MapViewer extends Component {
  state = {};
  render() {
    document.title = "Map Viewer - Datalakes";
    return (
      <div className="mapviewer">
        <GIS />
      </div>
    );
  }
}

export default MapViewer;
