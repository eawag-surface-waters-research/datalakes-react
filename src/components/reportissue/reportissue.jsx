import React, { Component } from "react";
import { connect } from 'react-redux';
import DateTimePicker from "react-datetime-picker";
import Select from "react-select";
import axios from "axios";
import { apiUrl } from "../../config.json";
import "./reportissue.css";
import { formatNumber } from "../../graphs/d3/linegraph/functions";
import { idProviderFromSsh } from "../../functions";


const RESERVED_PARAMETER_IDS = [1, 2, 18, 27, 28, 29, 30];

class ReportIssue extends Component {
  state = {
    reported: false,
    modal: false,
    message: "",
    email: "",
    start: new Date(),
    end: new Date(),
    parameters: null,
    description: "",
    reporter: "",
    sensordepths: "",
    submitted: false,
    error: false,
    data: [],
  };

  getUser = () => {
    // get user for this dataset
    var idProvider = idProviderFromSsh(this.props.ssh);
    if (idProvider === "renku" && this.props.auth?.renku?.user) {
      return this.props.auth.renku.user;
    }
    if (idProvider === "gitlab" && this.props.auth?.gitlab?.user) {
      return this.props.auth.gitlab.user;
    }
    if (idProvider === "github" && this.props.auth?.github?.user) {
      return this.props.auth.github.user;
    }
    return null;
  };

  openModal = () => {
    // init maintenance form with selected data
    var { selectedData, auth } = this.props;
    var { start, end, parameters, sensordepths, reporter, email } = this.state;
    start = new Date();
    end = new Date();
    parameters = [];
    sensordepths = "";
    var user = this.getUser();
    reporter = user?.name || "";
    email = user?.email || "";
    if (selectedData?.bbox && selectedData.bbox.length > 0) {
      if (selectedData.xTime) {
        start = selectedData.bbox[0][0];
        end = selectedData.bbox[1][0];
      }
      if (selectedData.yLabel === "Depth") {
        sensordepths = `${formatNumber(selectedData.bbox[0][1])}-${formatNumber(selectedData.bbox[1][1])}`;
      }
    }
    if (selectedData?.yLabel) {
      // find parameter with same name
      var parameter = this.props.datasetparameters
        .filter((d) => !RESERVED_PARAMETER_IDS.includes(d.parameters_id))
        .find(
          (d) => d.name === selectedData.yLabel
        );

      // if no parameter found, try with zLabel
      if (!parameter && selectedData.zLabel) {
        parameter = this.props.datasetparameters
          .filter((d) => !RESERVED_PARAMETER_IDS.includes(d.parameters_id))
          .find(
            (d) => d.name === selectedData.zLabel
          );
      }

      // case the x axis is not time
      if (!parameter && selectedData.xLabel && !selectedData.xTime) {
        parameter = this.props.datasetparameters
          .filter((d) => !RESERVED_PARAMETER_IDS.includes(d.parameters_id))
          .find(
            (d) => d.name === selectedData.xLabel
          );
      }

      // prefill form with found parameter
      if (parameter) {
        parameters = [
          {
            value: parameter.id,
            label: parameter.name + (parameter.detail !== "none" ? ` (${parameter.detail})` : ""),
            id: parameter.parameters_id,
          },
        ];
      }
    }

    this.setState({ start, end, parameters, sensordepths, reporter, email, modal: true });
  };

  closeModal = (event) => {
    if (
      event.target.className === "report-modal" ||
      event.target.className === "close-modal"
    )
      this.setState({ modal: false });
  };

  updateState = (parameter, event) => {
    if (event == null) {
      this.setState({ [parameter]: null });
    } else if (!("target" in event)) this.setState({ [parameter]: event });
  };

  addAllParameters = () => {
    var parameters = this.props.datasetparameters
      .filter((d) => !RESERVED_PARAMETER_IDS.includes(d.parameters_id))
      .map((p) => {
        return {
          value: p.id,
          label: p.name + (p.detail !== "none" ? ` (${p.detail})` : ""),
          id: p.parameters_id,
        };
      });
    this.setState({ parameters });
  };

  updateInput = (parameter, event) => {
    this.setState({ [parameter]: event.target.value });
  };

  updateMessage = (event) => {
    this.setState({ message: event.target.value });
  };

  updateEmail = (event) => {
    this.setState({ email: event.target.value });
  };

  submitReport = async () => {
    var { message, email } = this.state;
    var { dataset, repositories_id, selectedData } = this.props;

    if (!message) {
      window.alert(
        "Please enter an issue description."
      );
      return;
    }

    if (!email) {
      window.alert(
        "Please enter a contact email."
      );
      return;
    }

    var dataDetails = "";
    if (selectedData?.bbox && selectedData.bbox.length > 0) {
      dataDetails = "Data region:\n* " + this.formatRange(selectedData.xLabel, selectedData.xUnit, selectedData.xTime, selectedData.bbox[0][0], selectedData.bbox[1][0]);
      dataDetails += "\n* " + this.formatRange(selectedData.yLabel, selectedData.yUnit, selectedData.yTime, selectedData.bbox[0][1], selectedData.bbox[1][1]);
      if (selectedData.zLabel) {
        dataDetails += "\n* " + this.formatLabel(selectedData.zLabel, selectedData.zUnit);
      }
    } else {
      window.alert(
        "Please select a data region on the graph to report an issue with (use Ctrl and Click to select)."
      );
      return;
    }

    var content = {
      from: {
        email: "runnalls.james@gmail.com",
      },
      personalizations: [
        {
          to: [
            {
              email: "james.runnalls@eawag.ch",
            },
          ],
          dynamic_template_data: {
            dataset: dataset,
            email: email,
            url: window.location.href,
            message: message + (message ? "\n\n" : "") + dataDetails,
          },
        },
      ],
      template_id: "d-819e0202b4724bbb99069fdff49d667a",
    };
    var issues = {
      title: message,
      description: "Reported by: " + email + "\n\n" + dataDetails,
      repo_id: repositories_id,
    };
    try {
      await axios.post(apiUrl + "/contact", content);
      try {
        await axios.post(apiUrl + "/issues", issues);
      } catch (e) {
        console.error(e);
      }
      this.setState({ reported: true, error: false });
    } catch (e) {
      console.error(e);
      this.setState({ error: true });
    }
  };

  deleteMaintenance = async (ids) => {
    for (let i = 0; i < ids.length; i++) {
      await axios.delete(apiUrl + "/maintenance/" + ids[i]);
    }
    this.updateMaintenance();
  };

  updateMaintenance = async () => {
    var { data } = await axios.get(apiUrl + "/maintenance/" + this.props.id);
    this.setState({ data });
  };

  submitMaintenance = async () => {
    var { start, end, parameters, description, reporter, sensordepths } =
      this.state;
    var { id, auth } = this.props;
    var user = this.getUser();

    if (parameters === null) {
      window.alert("You must select at least one parameter.");
      return;
    }
    var p = parameters.map((p) => p.id);
    var dp = parameters.map((p) => p.value);
    var content = {
      id,
      start,
      end,
      parameters: p,
      description,
      reporter,
      sensordepths,
      datasetparameters: dp,
    };

    try {
      await axios.post(apiUrl + "/maintenance", content);
      this.updateMaintenance();
      this.setState({
        start: new Date(),
        end: new Date(),
        parameters: null,
        description: "",
        reporter: user?.name || "",
        sensordepths: "",
        error: false,
      });
    } catch (e) {
      console.error(e);
      this.setState({ error: true });
    }
  };

  formatTime = (time) => {
    let parts = time.split("T");
    return parts[0] + " " + parts[1].slice(0, 5);
  };

  formatRange = (label, unit, time, startVal, endVal) => {
    if (time) {
      return `${label ? label : 'Time'}: from ${this.formatTime(startVal.toISOString())} to ${this.formatTime(endVal.toISOString())}`;
    } else {
      return `${label ? label : 'Values'}${unit ? ' (' + unit + ')' : ''}: [${formatNumber(startVal < endVal ? startVal : endVal)}, ${formatNumber(startVal > endVal ? startVal : endVal)}]`;
    }
  };

  formatLabel = (label, unit) => {
    return label + (unit ? " (" + unit + ")" : "");
  };

  capitalizeFirstLetter = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  componentDidMount = async () => {
    this.updateMaintenance();
  };

  render() {
    var {
      reported,
      modal,
      start,
      end,
      parameters,
      description,
      reporter,
      sensordepths,
      error,
      data,
    } = this.state;
    var { dataset, datasetparameters, selectedData, auth } = this.props;
    var idProvider = this.capitalizeFirstLetter(idProviderFromSsh(this.props.ssh));
    var user = this.getUser();
    var maintenance = user?.name;

    var dp = datasetparameters
      .filter((d) => !RESERVED_PARAMETER_IDS.includes(d.parameters_id))
      .map((p) => {
        return {
          value: p.id,
          label: p.name + (p.detail !== "none" ? ` (${p.detail})` : ""),
          id: p.parameters_id,
        };
      });
    var sd =
      datasetparameters.filter(
        (dp) => dp.parameters_id === 2 && dp.axis === "y"
      ).length > 0;

    var dict = {};
    for (let i = 0; i < data.length; i++) {
      let dt = data[i].starttime.toString() + data[i].endtime.toString();
      if (dt in dict) {
        dict[dt]["parameters"].push(data[i].name + (data[i].detail !== "none" ? ` (${data[i].detail})` : ""));
        dict[dt]["id"].push(data[i].id);
      } else {
        dict[dt] = {
          start: data[i].starttime,
          end: data[i].endtime,
          parameters: [data[i].name + (data[i].detail !== "none" ? ` (${data[i].detail})` : "")],
          depths: data[i].depths,
          description: data[i].description,
          id: [data[i].id],
          reporter: data[i].reporter,
        };
      }
    }

    var rows = [];
    for (var key in dict) {
      let ids = dict[key].id;
      rows.push(
        <tr key={key}>
          <td>{this.formatTime(dict[key].start)}</td>
          <td>{this.formatTime(dict[key].end)}</td>
          <td>{dict[key].parameters.join(", ")}</td>
          <td>{dict[key].depths}</td>
          <td>{dict[key].description}</td>
          <td>{dict[key].reporter}</td>
          <td
            style={{ width: "20px" }}
            className="close"
            title="Delete report"
            onClick={() => this.deleteMaintenance(ids)}
          >
            &#10005;
          </td>
        </tr>
      );
    }

    return (
      <div className="report-issue">
        <div className="report-button">
          <button
            className="click"
            onClick={this.openModal}
            title="Does something not look right with this dataset?"
          >
            Report Issue
          </button>
        </div>
        {modal && (
          <div className="report-modal" onClick={this.closeModal}>
            <div className="report-modal-box">
              <div className="close-modal" onClick={this.closeModal}>
                &#215;
              </div>
              <h2>Report Issue</h2>
              {maintenance ? (
                <React.Fragment>
                  <p>Current maintenance periods:</p>
                  <table>
                    <thead>
                      <tr>
                        <th>Start</th>
                        <th>End</th>
                        <th>Parameters</th>
                        <th>Depths</th>
                        <th>Description</th>
                        <th>Reporter</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows}
                    </tbody>
                  </table>
                  <p>
                    Please complete the form below to suggest a maintenance
                    period for the dataset.
                  </p>
                  <table className="report">
                    <tbody>
                      <tr>
                        <th>Start time</th>
                        <td>
                          <DateTimePicker
                            onChange={(event) =>
                              this.updateState("start", event)
                            }
                            value={start}
                            clearIcon={null}
                            calendarIcon={null}
                            disableClock={true}
                            format={"dd.MM.y H:mm"}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>End time</th>
                        <td>
                          <DateTimePicker
                            onChange={(event) => this.updateState("end", event)}
                            value={end}
                            clearIcon={null}
                            calendarIcon={null}
                            disableClock={true}
                            format={"dd.MM.y H:mm"}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>Parameters</th>
                        <td>
                          <Select
                            options={dp}
                            value={parameters}
                            isMulti
                            className="multi-select"
                            classNamePrefix="reportparameter"
                            onChange={(event) =>
                              this.updateState("parameters", event)
                            }
                          />
                          <div
                            className="addbutton"
                            onClick={this.addAllParameters}
                          >
                            Add all
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th>Description</th>
                        <td>
                          <textarea
                            value={description}
                            onChange={(event) =>
                              this.updateInput("description", event)
                            }
                          />
                        </td>
                      </tr>
                      {sd && (
                        <tr>
                          <th>Sensor Depths</th>
                          <td>
                            <textarea
                              value={sensordepths}
                              placeholder="List: 1.6,4.5,18.0 or Range: 1.6-18.0"
                              onChange={(event) =>
                                this.updateInput("sensordepths", event)
                              }
                            />
                          </td>
                        </tr>
                      )}
                      <tr>
                        <th>Reporter</th>
                        <td>
                          <input
                            value={reporter}
                            type="text"
                            onChange={(event) =>
                              this.updateInput("reporter", event)
                            }
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="modal-submit">
                    {error &&
                      "Failed to submit please refresh the page and try again."}
                    <button className="click" onClick={this.submitMaintenance}>
                      Submit Report
                    </button>
                  </div>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {user?.name || (<p style={{color: "red"}}>
                    If you are a Developer or Maintainer of this dataset, please login with your <b>{idProvider}</b> account for advanced reporting features.
                  </p>)}
                  <p>
                    Thanks for filling out a data report, please add a message
                    describing the issue and your email address in case we have
                    further questions.
                  </p>
                  <p>Dataset: {dataset}</p>
                  {selectedData?.bbox && selectedData.bbox.length > 0 ? (
                    <div>
                      <p>
                        Selected data:
                      </p>
                      <ul>
                        <li>{this.formatRange(selectedData.xLabel, selectedData.xUnit, selectedData.xTime, selectedData.bbox[0][0], selectedData.bbox[1][0])}</li>
                        <li>{this.formatRange(selectedData.yLabel, selectedData.yUnit, selectedData.yTime, selectedData.bbox[0][1], selectedData.bbox[1][1])}</li>
                        {selectedData.zLabel ? (<li>{this.formatLabel(selectedData.zLabel, selectedData.zUnit)}</li>) : null}
                      </ul>
                    </div>
                  ) : (
                    <p style={{color: "red"}}>
                      Please select a data region on the graph to report an issue
                      with (use Ctrl and Click to select).
                    </p>
                  )}
                  <textarea
                    placeholder="Please type your report here."
                    onChange={this.updateMessage}
                    readOnly={reported}
                  />
                  <input
                    type="text"
                    placeholder="Email address"
                    onChange={this.updateEmail}
                    readOnly={reported}
                  />
                  {reported ? (
                    <p>
                      Thanks for submitting a data report. We will look into it
                      as soon as possible.
                    </p>
                  ) : (
                    <div className="modal-submit">
                      {error &&
                        "Failed to submit please refresh the page and try again."}
                      <button className="click" onClick={this.submitReport}>
                        Submit Report
                      </button>
                    </div>
                  )}
                </React.Fragment>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  selectedData: state.selection.selectedData,
  auth: state.auth,
});

export default connect(mapStateToProps)(ReportIssue);