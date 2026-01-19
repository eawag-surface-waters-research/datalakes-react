import React, { Component } from "react";
import { connect } from "react-redux";
import DateTimePicker from "react-datetime-picker";
import Select from "react-select";
import axios from "axios";
import { apiUrl } from "../../config.json";
import "./reportissue.css";
import { formatNumber } from "../../graphs/d3/linegraph/functions";
import { idProviderFromSsh } from "../../functions";
import { GitService } from "../../git";
import Loading from "../../components/loading/loading";

const RESERVED_PARAMETER_IDS = [1, 2, 18, 27, 28, 29, 30];

class ReportIssue extends Component {
  state = {
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
    missing_issues: [],
    checking_issues: false,
    git_service: new GitService(this.props.ssh),
    loading: false,
  };

  getUser = () => {
    // get user for this dataset
    return this.state.git_service.getGitUser();
  };

  isMaintainer = async () => {
    // authz check
    return await this.state.git_service.isGitProjectMaintainer();
  };

  openModal = async () => {
    // init maintenance form with selected data
    var { selectedData } = this.props;
    var { start, end, parameters, sensordepths, reporter, email, data } = this.state;
    start = new Date();
    end = new Date();
    parameters = [];
    sensordepths = "";
    var checking_issues = false;

    // authz check
    var user = this.getUser();
    reporter = user?.name || "";
    email = user?.email || "";
    var maintainer = false;
    if (user) {
      maintainer = await this.isMaintainer();
    }

    if (user && maintainer) {
      const allIssuesIds = data
        ? new Set(data
            .map((d) => d.issue)
            .filter((id) => id))
        : [];
        checking_issues = true;
      this.checkGitIssuesExist([...allIssuesIds]).then(({ missing, valid }) => {
        // Inform user about missing issues
        console.warn(`The following issues are missing or inaccessible: ${missing.join(", ")}`);
        this.setState({ missing_issues: missing, checking_issues: false });
      }).catch((error) => {
        console.error("Error while checking Git issues existence:", error);
        this.setState({ missing_issues: [], checking_issues: false });
      });
    }

    if (selectedData?.bbox && selectedData.bbox.length > 0) {
      if (selectedData.xTime) {
        start = selectedData.bbox[0][0];
        end = selectedData.bbox[1][0];
      }
      if (selectedData.yLabel === "Depth") {
        sensordepths = `${formatNumber(selectedData.bbox[0][1])}-${formatNumber(
          selectedData.bbox[1][1]
        )}`;
      }
    }
    if (selectedData?.yLabel) {
      // find parameter with same name
      var parameter = this.props.datasetparameters
        .filter((d) => !RESERVED_PARAMETER_IDS.includes(d.parameters_id))
        .find((d) => d.name === selectedData.yLabel);

      // if no parameter found, try with zLabel
      if (!parameter && selectedData.zLabel) {
        parameter = this.props.datasetparameters
          .filter((d) => !RESERVED_PARAMETER_IDS.includes(d.parameters_id))
          .find((d) => d.name === selectedData.zLabel);
      }

      // case the x axis is not time
      if (!parameter && selectedData.xLabel && !selectedData.xTime) {
        parameter = this.props.datasetparameters
          .filter((d) => !RESERVED_PARAMETER_IDS.includes(d.parameters_id))
          .find((d) => d.name === selectedData.xLabel);
      }

      // prefill form with found parameter
      if (parameter) {
        parameters = [
          {
            value: parameter.id,
            label:
              parameter.name +
              (parameter.detail !== "none" ? ` (${parameter.detail})` : ""),
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
      missing_issues: [],
      checking_issues,
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

  checkGitIssuesExist = async (issueIds) => {
    const validIssues = [];
    const missingIssues = [];
    for (let i = 0; i < issueIds.length; i++) {
      const issueId = issueIds[i];
      try {
        if (!issueId) continue;
        const exists =await this.state.git_service.checkGitIssueExist(issueId);
        if (exists) validIssues.push(issueId);
        else missingIssues.push(issueId);
      } catch (e) {
        missingIssues.push(issueId);
      }
    }
    return { missing: missingIssues, valid: validIssues };
  };

  deleteMaintenance = async (ids, issueId) => {
    await this.state.git_service.closeGitIssue(issueId);
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
    const event = this.makeEvent(maintenances);
    this.setState({
      ...event,
      title: "",
      error: false,
      edited_ids: ids,
      edited_issue: issueId || null,
    });
  };

  duplicateMaintenance = (ids) => {
    // find the first maintenance request in the list
    var { data } = this.state;
    var maintenances = data.filter((d) => ids.includes(d.id));
    if (!maintenances || maintenances.length === 0) {
      window.alert("No maintenance request found to edit.");
      return;
    }
    const event = this.makeEvent(maintenances);
    this.setState({
      ...event,
      title: "",
      error: false,
      edited_ids: [],
      edited_issue: null,
    });
  };

  makeEvent = (maintenances) => {
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

    return {
      start: new Date(content.starttime),
      end: new Date(content.endtime),
      parameters,
      description: content.description,
      reporter: content.reporter,
      sensordepths: content.depths || "",
    };
  };

  confirmMaintenance = async (ids, issueId) => {
    this.setState({ loading: true });
    try {
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
        const message = `Please check the maintenance request at: ${
          window.location.href
        }\n\n\`\`\`json\n${JSON.stringify(content, null, 2)}\n\`\`\``;
        issueId = await this.state.git_service.createGitIssue(ttl, message);
        // update the content with the issue ID
        await axios.put(apiUrl + "/maintenance/" + content.id + "/issue", {
          issue: issueId,
        });
      }
      await this.state.git_service.applyGitIssueLabels(issueId, ["confirmed"]);
      for (let i = 0; i < ids.length; i++) {
        await axios.put(apiUrl + "/maintenance/" + ids[i] + "/state", {
          state: "confirmed",
        });
      }
      this.updateMaintenances();
    } finally {
      this.setState({ loading: false });
    }
  };

  unconfirmMaintenance = async (ids, issueId) => {
    this.setState({ loading: true });
    try {
      await this.state.git_service.applyGitIssueLabels(issueId, []);
      for (let i = 0; i < ids.length; i++) {
        await axios.put(apiUrl + "/maintenance/" + ids[i] + "/state", {
          state: "reported",
        });
      }
      this.updateMaintenances();
    } finally {
      this.setState({ loading: false });
    }
  };

  resolveMaintenance = async (ids, issueId) => {
    this.setState({ loading: true });
    try {
      var { data, git_service } = this.state;
      var maintenances = data.filter((d) => ids.includes(d.id));
      if (!maintenances || maintenances.length === 0) {
        window.alert("No maintenance request found to edit.");
        return;
      }
      const event = this.makeEvent(maintenances);
      const requestId = await git_service.makeEventsMergeRequest(
        issueId,
        event
      );
      await git_service.applyGitIssueLabels(issueId, ["resolved"]);
      for (let i = 0; i < ids.length; i++) {
        await axios.put(apiUrl + "/maintenance/" + ids[i] + "/state", {
          state: "resolved",
          request: `${requestId}`,
        });
      }
      this.updateMaintenances();
    } finally {
      this.setState({ loading: false });
    }
  };

  updateMaintenances = async () => {
    var { data } = await axios.get(apiUrl + "/maintenance/" + this.props.id);
    this.setState({ data });
  };

  submitMaintenance = async () => {
    this.setState({ loading: true });
    try {
      var {
        start,
        end,
        parameters,
        title,
        description,
        reporter,
        sensordepths,
        edited_ids,
        edited_issue,
        missing_issues,
      } = this.state;
      var { id } = this.props;

      if (!edited_issue && !title) {
        window.alert("Please enter an issue title.");
        return;
      }
      if (!description) {
        window.alert("Please enter an issue description.");
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

      try {
        const message = `${description}\n\n---\n\nPlease check the maintenance request at: ${
          window.location.href
        }\n\n\`\`\`json\n${JSON.stringify(content, null, 2)}\n\`\`\``;
        if (edited_issue && !missing_issues.includes(edited_issue)) {
          // comment issue
          await this.state.git_service.commentGitIssue(edited_issue, message);
          content.issue = `${edited_issue}`;
        } else {
          // create issue
          const ttl = `[maintenance] ${title || description.slice(0, 50)}`;
          const issueId = await this.state.git_service.createGitIssue(
            ttl,
            message
          );
          content.issue = `${issueId}`;
        }

        // create maintenance reports
        await axios.post(apiUrl + "/maintenance", content);
        if (edited_ids && edited_ids.length > 0) {
          // delete obsolete maintenance reports
          for (let i = 0; i < edited_ids.length; i++) {
            await axios.delete(apiUrl + "/maintenance/" + edited_ids[i]);
          }
        }
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
    } finally {
      this.setState({ loading: false });
    }
  };

  formatTime = (time) => {
    let parts = time.split("T");
    return parts[0] + " " + parts[1].slice(0, 5);
  };

  formatRange = (label, unit, time, startVal, endVal) => {
    if (time) {
      const start =
        typeof startVal === "string" ? new Date(startVal) : startVal;
      const end = typeof endVal === "string" ? new Date(endVal) : endVal;
      return `${label ? label : "Time"}: from ${this.formatTime(
        start.toISOString()
      )} to ${this.formatTime(end.toISOString())}`;
    } else {
      return `${label ? label : "Values"}${
        unit ? " (" + unit + ")" : ""
      }: [${formatNumber(
        startVal < endVal ? startVal : endVal
      )}, ${formatNumber(startVal > endVal ? startVal : endVal)}]`;
    }
  };

  formatLabel = (label, unit) => {
    return label + (unit ? " (" + unit + ")" : "");
  };

  capitalizeFirstLetter = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  componentDidMount = async () => {
    this.updateMaintenances();
  };

  render() {
    var {
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
      loading,
      missing_issues,
      checking_issues,
    } = this.state;
    var { ssh, datasetparameters, person } = this.props;
    var show = false;
    try {
      var idProvider = this.capitalizeFirstLetter(idProviderFromSsh(ssh));
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
        let key = data[i].issue
          ? data[i].issue
          : data[i].starttime.toString() + data[i].endtime.toString();
        if (key in dict) {
          dict[key]["parameters"].push(
            data[i].name +
              (data[i].detail !== "none" ? ` (${data[i].detail})` : "")
          );
          dict[key]["id"].push(data[i].id);
        } else {
          dict[key] = {
            start: data[i].starttime,
            end: data[i].endtime,
            parameters: [
              data[i].name +
                (data[i].detail !== "none" ? ` (${data[i].detail})` : ""),
            ],
            depths: data[i].depths,
            description: data[i].description,
            id: [data[i].id],
            state: data[i].state,
            issue: data[i].issue,
            request: data[i].request,
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
        const requestId = row.request;
        const issueExists = issueId ? !missing_issues.includes(issueId) : false;
        const canEdit = reporterOrMaintainer && !checking_issues && (!issueExists || (row.state !== "confirmed" && row.state !== "resolved"));
        const canConfirm = maintainer && !checking_issues && row.state !== "confirmed" && row.state !== "resolved" && issueExists;
        const canUnConfirm = maintainer && !checking_issues && row.state === "confirmed" && issueExists;
        const canResolve = maintainer && !checking_issues && row.state === "confirmed" && issueExists;
        const canDuplicate = reporterOrMaintainer && !checking_issues;
        const canDelete = reporterOrMaintainer && !checking_issues;
        rows.push(
          <tr key={key}>
            <td>{this.formatTime(row.start)}</td>
            <td>{this.formatTime(row.end)}</td>
            <td>{row.parameters.join(", ")}</td>
            <td>{row.depths}</td>
            <td>{row.description}</td>
            <td>
              <span className={checking_issues ? "badge" : (issueExists ? "badge badge-info" : "badge badge-danger")}>{row.state}</span>
            </td>
            <td>
              {issueId ? (
                <a
                  href={this.state.git_service.makeGitIssueLink(issueId)}
                  target="_blank"
                  title="Issue"
                  rel="noopener noreferrer"
                  style={{ color: issueExists ? "inherit" : "red" }}
                >
                  #{issueId}
                </a>
              ) : (
                ""
              )}
              {requestId ? (
                <a
                  href={this.state.git_service.makeGitRequestLink(requestId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Merge request"
                  style={{ marginLeft: "5px" }}
                >
                  (#{requestId})
                </a>
              ) : (
                ""
              )}
            </td>
            <td>{row.reporter}</td>
            <td>
              {reporterOrMaintainer && checking_issues ? (
                <span>...</span>
              ) : null}
              {canEdit ? (
                <div
                  className="inline"
                  style={{
                    width: "20px",
                    cursor: "pointer",
                    color: loading ? "#ccc" : "inherit",
                  }}
                  title="Edit report"
                  onClick={() =>
                    loading ? null : this.editMaintenance(ids, issueId)
                  }
                >
                  &#9998;
                </div>
              ) : null}
              {canConfirm ? (
                <div
                  className="inline"
                  style={{
                    width: "20px",
                    cursor: "pointer",
                    color: loading ? "#ccc" : "inherit",
                  }}
                  title="Confirm report"
                  onClick={() =>
                    loading ? null : this.confirmMaintenance(ids, issueId)
                  }
                >
                  &#8631;
                </div>
              ) : null}
              {canUnConfirm ? (
                <div
                  className="inline"
                  style={{
                    width: "20px",
                    cursor: "pointer",
                    color: loading ? "#ccc" : "inherit",
                  }}
                  title="Revert confirm report"
                  onClick={() =>
                    loading ? null : this.unconfirmMaintenance(ids, issueId)
                  }
                >
                  &#8630;
                </div>
              ) : null}
              {canResolve ? (
                <div
                  className="inline"
                  style={{
                    width: "20px",
                    cursor: "pointer",
                    color: loading ? "#ccc" : "inherit",
                  }}
                  title="Resolve report"
                  onClick={() =>
                    loading ? null : this.resolveMaintenance(ids, issueId)
                  }
                >
                  &#10003;
                </div>
              ) : null}
              {canDuplicate ? (
                <div
                  className="inline"
                  style={{
                    width: "20px",
                    color: loading ? "#ccc" : "green",
                    cursor: "pointer",
                  }}
                  title="Duplicate report"
                  onClick={() =>
                    loading ? null : this.duplicateMaintenance(ids)
                  }
                >
                  &#10011;
                </div>
              ) : null}
              {canDelete ? (
                <div
                  className="inline"
                  style={{
                    width: "20px",
                    color: loading ? "#ccc" : "red",
                    cursor: "pointer",
                  }}
                  title="Delete report"
                  onClick={() =>
                    loading ? null : this.deleteMaintenance(ids, issueId)
                  }
                >
                  &#10005;
                </div>
              ) : null}
            </td>
          </tr>
        );
      }
      show = true;
    } catch (e) {
      console.error(e);
    }
    return (
      <div className="report-issue">
        {show && (
          <div className="report-button">
            <button
              className="click"
              onClick={this.openModal}
              title="Does something not look right with this dataset?"
            >
              Report Issue
            </button>
          </div>
        )}
        {modal && (
          <div className="report-modal" onClick={this.closeModal}>
            <div className="report-modal-box">
              <div className="close-modal" onClick={this.closeModal}>
                &#215;
              </div>
              <h2>Report Issue {loading && <Loading size="sm" inline />}</h2>
              {maintenance ? (
                <React.Fragment>
                  {!maintainer || (
                    <p className="alert alert-success">
                      You are a Developer or Maintainer of this dataset and have
                      access to advanced reporting features.
                    </p>
                  )}
                  {rows.length > 0 && (
                    <>
                      <p>Current maintenance periods: {checking_issues && <span style={{color: "red"}}>[checking Git issues...]</span>}</p>
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
                            <th style={{ width: "80px" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>{rows}</tbody>
                      </table>
                      <div style={{color: "gray"}}>
                        Actions hint: &#9998; Edit | &#8631; Confirm | &#8630; Revert Confirm | 
                        &#10003; Resolve | &#10011; Duplicate | &#10005; Delete
                      </div>
                    </>
                  )}
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
                    <button
                      className="click"
                      onClick={loading ? null : this.submitMaintenance}
                    >
                      Submit Report
                    </button>
                  </div>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {user?.name || (
                    <p className="alert alert-warning">
                      Please login with your <b>{idProvider}</b> account for
                      advanced reporting features.
                    </p>
                  )}
                  <p>
                    Don't use <b>{idProvider}</b>? No worries, you can still
                    report issues directly to the dataset maintainer:
                  </p>
                  <div className="person-name">{person.name}</div>
                  <div className="person-email">
                    <a href={`mailto:${person.email}`}>{person.email}</a>
                  </div>
                  <p>
                    If possible, please include the following information:
                    <ul>
                      <li>Dataset ID (The number in the URL)</li>
                      <li>Parameters impacted (e.g. Temperature)</li>
                      <li>Time period concerned</li>
                    </ul>
                  </p>
                  <p>
                    Thanks for helping us ensure data on Datalakes is high
                    quality!
                  </p>
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
