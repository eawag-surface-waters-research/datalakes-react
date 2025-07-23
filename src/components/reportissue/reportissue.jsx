import React, { Component } from "react";
import { connect } from 'react-redux';
import DateTimePicker from "react-datetime-picker";
import Select from "react-select";
import axios from "axios";
import { apiUrl } from "../../config.json";
import "./reportissue.css";
import { formatNumber } from "../../graphs/d3/linegraph/functions";
import { idProviderFromSsh } from "../../functions";
import { isGitProjectMaintainer, getGitUser, commentGitIssue, createGitIssue, makeGitIssueLink, closeGitIssue, applyGitIssueLabels } from "../../git";
import { is } from "date-fns/locale";


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
    title: "",
    description: "",
    reporter: "",
    maintainer: false,
    sensordepths: "",
    submitted: false,
    error: false,
    data: [],
    edited_ids: [],
    edited_issue: null,
  };

  getUser = () => {
    // get user for this dataset
    var { ssh } = this.props;
    return getGitUser(ssh);
  };

  isMaintainer = async () => {
    // authz check
    var { ssh } = this.props;
    return await isGitProjectMaintainer(ssh);
  };

  openModal = async () => {
    // init maintenance form with selected data
    var { selectedData } = this.props;
    var { start, end, parameters, sensordepths, reporter, email } = this.state;
    start = new Date();
    end = new Date();
    parameters = [];
    sensordepths = "";
    
    // authz check
    var user = this.getUser();
    reporter = user?.name || "";
    email = user?.email || "";
    var maintainer = false;
    if (user) {
      maintainer = await this.isMaintainer();
    }

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

    this.setState({
      start,
      end,
      parameters,
      sensordepths,
      reporter,
      email,
      maintainer,
      modal: true,
      error: false,
      edited_ids: [],
      edited_issue: null,
      title: "",
      description: "",
    });
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

  deleteMaintenance = async (ids, issueId) => {
    await closeGitIssue(this.props.ssh, issueId);
    for (let i = 0; i < ids.length; i++) {
      await axios.delete(apiUrl + "/maintenance/" + ids[i]);
    }
    this.updateMaintenances();
  };

  editMaintenance = (ids, issueId) => {
    // find the first maintenance request in the list
    var { data } = this.state;
    var maintenances = data.filter((d) => ids.includes(d.id));
    if (!maintenances || maintenances.length === 0) {
      window.alert("No maintenance request found to edit.");
      return;
    }
    const content = maintenances[0];
    var pids = maintenances.map((m) => m.datasetparameters_id);
    var parameters = this.props.datasetparameters
      .filter((d) => pids.includes(d.id))
      .map((p) => {
        return {
          value: p.id,
          label: p.name + (p.detail !== "none" ? ` (${p.detail})` : ""),
          id: p.parameters_id,
        };
      });
    this.setState({
      start: new Date(content.starttime),
      end: new Date(content.endtime),
      parameters,
      title: "",
      description: content.description,
      reporter: content.reporter,
      sensordepths: content.depths || "",
      error: false,
      edited_ids: ids,
      edited_issue: issueId || null,
    });
  };

  confirmMaintenance = async (ids, issueId) => {
    if (!issueId) {
      // create issue if not exists
      // find the first maintenance request in the list
      var { data } = this.state;
      var content = data.find((d) => ids.includes(d.id));
      if (!content) {
        window.alert("No maintenance request found to confirm.");
        return;
      }
      const ttl = `[maintenance] ${content.description.slice(0, 50)}`;
      const message = `Please check the maintenance request at: ${window.location.href}\n\n\`\`\`json\n${JSON.stringify(content, null, 2)}\n\`\`\``;
      issueId = await createGitIssue(this.props.ssh, ttl, message);
      // update the content with the issue ID
      await axios.put(apiUrl + "/maintenance/" + content.id + "/issue", { issue: issueId });
    }
    await applyGitIssueLabels(this.props.ssh, issueId, ["confirmed"]);
    for (let i = 0; i < ids.length; i++) {
      await axios.put(apiUrl + "/maintenance/" + ids[i] + "/state", {
        state: "confirmed",
      });
    }
    this.updateMaintenances();
  };

  unconfirmMaintenance = async (ids, issueId) => {
    await applyGitIssueLabels(this.props.ssh, issueId, []);
    for (let i = 0; i < ids.length; i++) {
      await axios.put(apiUrl + "/maintenance/" + ids[i] + "/state", {
        state: "reported",
      });
    }
    this.updateMaintenances();
  };

  resolveMaintenance = async (ids, issueId) => {
    await applyGitIssueLabels(this.props.ssh, issueId, ["resolved"]);
    await closeGitIssue(this.props.ssh, issueId);
    for (let i = 0; i < ids.length; i++) {
      await axios.put(apiUrl + "/maintenance/" + ids[i] + "/state", {
        state: "resolved",
      });
    }
    this.updateMaintenances();
  };

  updateMaintenances = async () => {
    var { data } = await axios.get(apiUrl + "/maintenance/" + this.props.id);
    this.setState({ data });
  };

  submitMaintenance = async () => {
    var { start, end, parameters, title, description, reporter, sensordepths, edited_ids, edited_issue } =
      this.state;
    var { id } = this.props;

    if (!edited_issue && !title) {
      window.alert(
        "Please enter an issue title."
      );
      return;
    }
    if (!description) {
      window.alert(
        "Please enter an issue description."
      );
      return;
    }

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

    if (edited_ids && edited_ids.length > 0) {
      // delete obsolete maintenance reports
      for (let i = 0; i < edited_ids.length; i++) {
        await axios.delete(apiUrl + "/maintenance/" + edited_ids[i]);
      }
    }
    try {
      const message = `${description}\n\n---\n\nPlease check the maintenance request at: ${window.location.href}\n\n\`\`\`json\n${JSON.stringify(content, null, 2)}\n\`\`\``;
      if (edited_issue) {
        // comment issue
        await commentGitIssue(this.props.ssh, edited_issue, message);
        content.issue = `${edited_issue}`;
      } else {
        // create issue
        const ttl = `[maintenance] ${title || description.slice(0, 50)}`;
        const issueId = await createGitIssue(this.props.ssh, ttl, message);
        content.issue = `${issueId}`;
      }
      // create maintenance reports
      await axios.post(apiUrl + "/maintenance", content);
      this.updateMaintenances();
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
      const start = typeof startVal === 'string' ? new Date(startVal) : startVal; 
      const end = typeof endVal === 'string' ? new Date(endVal) : endVal;
      return `${label ? label : 'Time'}: from ${this.formatTime(start.toISOString())} to ${this.formatTime(end.toISOString())}`;
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
    this.updateMaintenances();
  };

  render() {
    var {
      reported,
      modal,
      start,
      end,
      parameters,
      title,
      description,
      reporter,
      maintainer,
      sensordepths,
      error,
      data,
    } = this.state;
    console.log("ReportIssue render", this.state);
    var { ssh, dataset, datasetparameters, selectedData } = this.props;
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
      // use issue if exists, otherwise use start and end time as key
      let key = data[i].issue ? data[i].issue : data[i].starttime.toString() + data[i].endtime.toString();
      if (key in dict) {
        dict[key]["parameters"].push(data[i].name + (data[i].detail !== "none" ? ` (${data[i].detail})` : ""));
        dict[key]["id"].push(data[i].id);
      } else {
        dict[key] = {
          start: data[i].starttime,
          end: data[i].endtime,
          parameters: [data[i].name + (data[i].detail !== "none" ? ` (${data[i].detail})` : "")],
          depths: data[i].depths,
          description: data[i].description,
          id: [data[i].id],
          state: data[i].state,
          issue: data[i].issue,
          reporter: data[i].reporter,
        };
      }
    }

    var rows = [];
    for (var key in dict) {
      const row = dict[key];
      let ids = row.id;
      // check if the user is the reporter or a maintainer
      const reporterOrMaintainer = row.reporter === user?.name || maintainer;
      const issueId = row.issue;
      rows.push(
        <tr key={key}>
          <td>{this.formatTime(row.start)}</td>
          <td>{this.formatTime(row.end)}</td>
          <td>{row.parameters.join(", ")}</td>
          <td>{row.depths}</td>
          <td>{row.description}</td>
          <td><span className="badge badge-info">{row.state}</span></td>
          <td>{issueId ? <a href={makeGitIssueLink(ssh, issueId)} target="_blank" rel="noopener noreferrer">#{issueId}</a> : ''}</td>
          <td>{row.reporter}</td>
          <td>
            {maintainer && row.state !== "confirmed" && row.state !== "resolved" ? (
              <div
                className="inline"
                style={{ width: "20px", cursor: "pointer" }}
                title="Edit report"
                onClick={() => this.editMaintenance(ids, issueId)}
              >
                &#9998;
              </div>
            ) : null}
            {maintainer && row.state !== "confirmed" && row.state !== "resolved" ? (
              <div
                className="inline"
                style={{ width: "20px", cursor: "pointer" }}
                title="Confirm report"
                onClick={() => this.confirmMaintenance(ids, issueId)}
              >
                &#8631;
              </div>
            ) : null}
            {maintainer && row.state === "confirmed" ? (
              <div
                className="inline"
                style={{ width: "20px", cursor: "pointer" }}
                title="Revert confirm report"
                onClick={() => this.unconfirmMaintenance(ids, issueId)}
              >
                &#8630;
              </div>
            ) : null}
            {maintainer && row.state === "confirmed" ? (
              <div
                className="inline"
                style={{ width: "20px", cursor: "pointer" }}
                title="Resolve report"
                onClick={() => this.resolveMaintenance(ids, issueId)}
              >
                &#10003;
              </div>
            ) : null}
            {reporterOrMaintainer && row.state !== "resolved" ? (
              <div
                className="inline"
                style={{ width: "20px", color: "red", cursor: "pointer" }}
                title="Delete report"
                onClick={() => this.deleteMaintenance(ids, issueId)}
              >
                &#10005;
              </div>
            ) : null}
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
                  {!maintainer || (<p className="alert alert-success">
                    You are a Developer or Maintainer of this dataset and have access to advanced reporting features.
                  </p>)}
                  <p>Current maintenance periods:</p>
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Start</th>
                        <th>End</th>
                        <th>Parameters</th>
                        <th>Depths</th>
                        <th>Description</th>
                        <th>State</th>
                        <th>Issue</th>
                        <th>Reporter</th>
                        <th style={{ width: "60px" }}></th>
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
                        <th>Title</th>
                        <td>
                          <input
                            value={title}
                            type="text"
                            onChange={(event) =>
                              this.updateInput("title", event)
                            }
                            disabled={!!this.state.edited_issue}
                          />
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
                  {user?.name || (<p className="alert alert-warning">
                    Please login with your <b>{idProvider}</b> account for advanced reporting features.
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
                    <p className="alert alert-danger">
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
});

export default connect(mapStateToProps)(ReportIssue);