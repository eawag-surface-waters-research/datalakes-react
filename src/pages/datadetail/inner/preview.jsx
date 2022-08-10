import React, { Component } from "react";
import Connect from "../img/connect.svg";
import "../css/datadetail.css";

class Preview extends Component {
  tableHeader = (i, datasetparameters, getLabel) => {
    var detail = "";
    if (
      datasetparameters[i] &&
      datasetparameters[i].detail !== null &&
      datasetparameters[i].detail !== "none"
    ) {
      detail = `[${datasetparameters[i].detail}]`;
    }
    return (
      datasetparameters[i] &&
      `${getLabel(
        "parameters",
        datasetparameters[i].parameters_id,
        "name"
      )} ${detail} (${datasetparameters[i].unit})`
    );
  };

  tableBody = (i, l, datasetparameters, data) => {
    var out = datasetparameters[i] && data[datasetparameters[i].axis][l];
    if (out === null) out = "null";
    return out;
  };

  render() {
    var { data, datasetparameters, getLabel } = this.props;
    if (data[0] !== false) {
      data = data[0];
      var inner = [];
      inner = [
        <tr key="h">
          <th>1</th>
          <td>{this.tableHeader(0, datasetparameters, getLabel)}</td>
          <td>{this.tableHeader(1, datasetparameters, getLabel)}</td>
          <td>{this.tableHeader(2, datasetparameters, getLabel)}</td>
          <td>{this.tableHeader(3, datasetparameters, getLabel)}</td>
          <td>{this.tableHeader(4, datasetparameters, getLabel)}</td>
          <td>{this.tableHeader(5, datasetparameters, getLabel)}</td>
          <td>{this.tableHeader(6, datasetparameters, getLabel)}</td>
        </tr>,
      ];
      var len = data.y ? data.y.length : data.x.length;
      for (var l = 0; l < Math.min(50, len); l++) {
        inner.push(
          <tr key={"h" + l}>
            <th>{l + 2}</th>
            <td>{this.tableBody(0, l, datasetparameters, data)}</td>
            <td>{this.tableBody(1, l, datasetparameters, data)}</td>
            <td>{this.tableBody(2, l, datasetparameters, data)}</td>
            <td>{this.tableBody(3, l, datasetparameters, data)}</td>
            <td>{this.tableBody(4, l, datasetparameters, data)}</td>
            <td>{this.tableBody(5, l, datasetparameters, data)}</td>
            <td>{this.tableBody(6, l, datasetparameters, data)}</td>
          </tr>
        );
      }
    }
    if (this.props.data[0] === false) {
      return (
        <div className="failed-download">
          <img src={Connect} alt="Disconnected" />
          Unable to download data from the Datalakes API. 
          <div><b>Please try refreshing the page or come back later.</b></div>
        </div>
      );
    } else {
      return (
        <div className="preview-table">
          <table className="excel">
            <tbody>
              <tr>
                <th></th>
                <th>a</th>
                <th>b</th>
                <th>c</th>
                <th>d</th>
                <th>e</th>
                <th>f</th>
                <th>g</th>
              </tr>
              {inner}
            </tbody>
          </table>
        </div>
      );
    }
  }
}

export default Preview;
