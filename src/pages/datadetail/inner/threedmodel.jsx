import React, { Component } from "react";
import GIS from "../../../graphs/leaflet/datalakesgis";
import "../css/datadetail.css";
import "../css/threed.css";

class ThreeDModel extends Component {
  state = {};

  render() {
    var { dataset } = this.props;
    var defaults = {
      11: {
        selected: [
          [11, 25],
          [11, 5],
        ],
        center: [47.282, 8.729],
        zoom: 12,
      },
      14: {
        selected: [
          [14, 25],
          [14, 5],
        ],
        center: [46.409, 6.532],
        zoom: 11,
      },
      15: {
        selected: [
          [15, 25],
          [15, 5],
        ],
        center: [47.351, 8.682],
        zoom: 14,
      },
    };

    return (
      <div className="threed">
        <GIS defaults={defaults[dataset.id]} hidelayerbutton={true} />
      </div>
    );
  }
}

export default ThreeDModel;
