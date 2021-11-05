import React, { Component } from "react";
import Loading from "../../../components/loading/loading";

class Publish extends Component {
  state = {
    message: "",
    loading: true
  };

  nextStep = e => {
    this.setState({
      loading: true,
      message: "Publishing Dataset."
    });
    e.preventDefault();
    this.props.nextStep().catch(error => {
      console.error(error.message);
      this.setState({
        message: error.message,
        loading: false
      });
    });
  };

  prevStep = e => {
    e.preventDefault();
    this.props.prevStep();
  };

  getDropdownLabel = (input, id) => {
    try {
      const { dropdown } = this.props;
      return dropdown[input].find(x => x.id === id).name;
    } catch (e) {
      console.error(input, id, e.message);
    }
  };

  render() {
    const { datasetparameters, dataset } = this.props;
    var { message, loading } = this.state;

    if (message !== "") {
      var userMessage = (
        <div className="loading">
          {loading && <Loading />}
          {message}
        </div>
      );
    }

    // Parameter Table
    var rows = [];
    var i = 0;
    for (var row of datasetparameters) {
      if (row.included) {
        rows.push(
          <tr key={"row" + i}>
            <td>{this.getDropdownLabel("parameters", row.parameters_id)}</td>
            <td>{row.axis}</td>
            <td>{row.detail}</td>
            <td>{row.unit}</td>
            <td>{this.getDropdownLabel("sensors", row.sensors_id)}</td>
          </tr>
        );
        i++;
      }
    }

    // Renku
    var renku = "";
    if (dataset["renku"] === 0) {
      renku = "Lineage managed through Renku";
    } else {
      renku = "Not used.";
    }

    return (
      <div className="publish">
        <h3>Dataset Parameters</h3>
        <table className="parameter">
          <tbody>
            <tr>
              <th>Parameter</th>
              <th>Axis</th>
              <th>Extra Detail</th>
              <th>Units</th>
              <th>Sensor</th>
            </tr>
            {rows}
          </tbody>
        </table>
        <h3>Dataset Metadata</h3>
        <table className="metadata">
          <tbody>
            <tr>
              <th>Link to Git Repo</th>
              <td>{dataset["datasourcelink"]}</td>
            </tr>
            <tr>
              <th>Min Datetime</th>
              <td>{new Date(dataset["mindatetime"]).toString()}</td>
            </tr>
            <tr>
              <th>Max Datetime</th>
              <td>{new Date(dataset["maxdatetime"]).toString()}</td>
            </tr>
            <tr>
              <th>Location</th>
              <td>
                {dataset["latitude"]},{dataset["longitude"]}
              </td>
            </tr>
            <tr>
              <th>Minimum Depth</th>
              <td>{dataset["mindepth"]}m</td>
            </tr>
            <tr>
              <th>Maximum Depth</th>
              <td>{dataset["maxdepth"]}m</td>
            </tr>
            <tr>
              <th>Lake</th>
              <td>{this.getDropdownLabel("lakes", dataset["lakes_id"])}</td>
            </tr>
            <tr>
              <th>Title</th>
              <td>{dataset["title"]}</td>
            </tr>
            <tr>
              <th>Description</th>
              <td>{dataset["title"]}</td>
            </tr>
            <tr>
              <th>Project</th>
              <td>
                {this.getDropdownLabel("projects", dataset["projects_id"])}
              </td>
            </tr>

            <tr>
              <th>Person</th>
              <td>{this.getDropdownLabel("persons", dataset["persons_id"])}</td>
            </tr>
            <tr>
              <th>Organisation</th>
              <td>
                {this.getDropdownLabel(
                  "organisations",
                  dataset["organisations_id"]
                )}
              </td>
            </tr>
            <tr>
              <th>License</th>
              <td>
                {this.getDropdownLabel("licenses", dataset["licenses_id"])}
              </td>
            </tr>
            <tr>
              <th>Citation</th>
              <td>{dataset["citation"]}</td>
            </tr>
            <tr>
              <th>Renku</th>
              <td>{renku}</td>
            </tr>
            <tr>
              <th>Live Connection</th>
              <td>{dataset["liveconnect"]}</td>
            </tr>
          </tbody>
        </table>
        <div className="error-message">{userMessage}</div>
        <div className="buttonnav">
          <button onClick={this.prevStep}>Back</button>
          <button onClick={this.nextStep}>Publish </button>
        </div>
      </div>
    );
  }
}

export default Publish;
