import React, { Component } from "react";
import GIS from "../../../graphs/leaflet/gis";
import "../css/datadetail.css";
import "../css/threed.css";

class MapComponent extends Component {
  state = {};

  render() {
    var { dataset, datasetparameters } = this.props;
    var p = datasetparameters.filter(
      (dp) => ![1, 2, 3, 4].includes(dp.parameters_id)
    );
    p.sort((a, b) =>
      a.parameters_id > b.parameters_id
        ? -1
        : b.parameters_id > a.parameters_id
        ? 1
        : 0
    );
    var zoom = 8;
    if (["meteolakes", "datalakes"].includes(dataset.mapplotfunction))
      zoom = 11;
    var defaults = {
      selected: p.map((param) => [dataset.id, param.parameters_id]),
      center: [dataset.latitude, dataset.longitude],
      datetime: new Date(dataset.maxdatetime),
      zoom: zoom,
    };
    return (
      <div className="threed">
        <GIS defaults={defaults} hidelayerbutton={true} />
      </div>
    );
  }
}

export default MapComponent;
