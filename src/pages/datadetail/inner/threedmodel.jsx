import React, { Component } from "react";
import GIS from "../../../graphs/leaflet/datalakesgis";
import "../css/datadetail.css";
import "../css/threed.css";

class ThreeDModel extends Component {
  state = {};

  render() {
    var defaults = {
      selected: [
        [11, 25],
        [11, 5],
      ],
      center: [47.282, 8.729],
      zoom: 12,
    };

    return (
      <div className="threed">
        <GIS defaults={defaults} />
      </div>
    );
  }
}

export default ThreeDModel;
