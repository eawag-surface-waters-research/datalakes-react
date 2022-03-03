import React, { Component } from "react";
import GIS from "../../../graphs/leaflet/datalakesgis";
import "../css/datadetail.css";
import "../css/threed.css";

class RemoteSensing extends Component {
  state = {};

  render() {
    var { dataset, datasetparameters } = this.props;
    var p = datasetparameters.filter(
      (dp) => ![1, 2, 3, 4].includes(dp.parameters_id)
    )[0];
    var defaults = {
      selected: [[dataset.id, p.parameters_id]],
      center: [46.747, 8.177],
      zoom: 8,
    };

    return (
      <div className="threed">
        <GIS defaults={defaults} hidelayerbutton={true} />
      </div>
    );
  }
}

export default RemoteSensing;
