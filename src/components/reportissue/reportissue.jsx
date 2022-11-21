import React, { Component } from "react";
import DateTimePicker from "react-datetime-picker";
import Select from "react-select";
import axios from "axios";
import { apiUrl } from "../../config.json";
import "./reportissue.css";

class ReportIssue extends Component {
  state = {
    reported: false,
    modal: false,
    maintenance: false,
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

  openModal = () => {
    this.setState({ modal: true });
  };

  closeModal = (event) => {
    if (
      event.target.className === "report-modal" ||
      event.target.className === "close-modal"
    )
      this.setState({ modal: false });
  };

  updateState = (parameter, event) => {
    if (!("target" in event)) this.setState({ [parameter]: event });
  };

  addAllParameters = () => {
    var parameters = this.props.datasetparameters
      .filter((d) => ![1, 2, 18, 27, 28, 29, 30].includes(d.parameters_id))
      .map((p) => {
        return { value: p.parameters_id, label: p.name };
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

  toggleMaintenance = () => {
    if (!this.state.maintenance) {
      var key = "thetis";
      var output = window.prompt(
        "Please enter the password to report maintenance.",
        ""
      );
      if (key !== output) {
        window.alert("Incorrect password.");
      } else {
        this.setState({ maintenance: !this.state.maintenance });
      }
    } else {
      this.setState({ maintenance: !this.state.maintenance });
    }
  };

  submitReport = async () => {
    var { message, email } = this.state;
    var { dataset, repositories_id } = this.props;
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
            message: message,
          },
        },
      ],
      template_id: "d-819e0202b4724bbb99069fdff49d667a",
    };
    var issues = {
      title: message,
      description: "Reported by: " + email,
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
    var { id } = this.props;

    if (parameters === null) {
      window.alert("You must select at least one parameter.");
      return;
    }
    parameters = parameters.map((p) => p.value);
    var content = {
      id,
      start,
      end,
      parameters,
      description,
      reporter,
      sensordepths,
    };

    try {
      await axios.post(apiUrl + "/maintenance", content);
      this.updateMaintenance();
      this.setState({
        start: new Date(),
        end: new Date(),
        parameters: null,
        description: "",
        reporter: "",
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

  componentDidMount = async () => {
    this.updateMaintenance();
  };

  render() {
    var {
      reported,
      modal,
      maintenance,
      start,
      end,
      parameters,
      description,
      reporter,
      sensordepths,
      error,
      data,
    } = this.state;
    var { dataset, datasetparameters } = this.props;
    var dp = datasetparameters
      .filter((d) => ![1, 2, 18, 27, 28, 29, 30].includes(d.parameters_id))
      .map((p) => {
        return { value: p.parameters_id, label: p.name };
      });
    var sd =
      datasetparameters.filter(
        (dp) => dp.parameters_id === 2 && dp.axis === "y"
      ).length > 0;

    var dict = {};
    for (let i = 0; i < data.length; i++) {
      let dt = data[i].starttime.toString() + data[i].endtime.toString();
      if (dt in dict) {
        dict[dt]["parameters"].push(data[i].name);
        dict[dt]["id"].push(data[i].id);
      } else {
        dict[dt] = {
          start: data[i].starttime,
          end: data[i].endtime,
          parameters: [data[i].name],
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
              <div className="reportslider">
                Report Maintenance
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={maintenance}
                    onChange={this.toggleMaintenance}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              {maintenance ? (
                <React.Fragment>
                  <p>Current maintenance periods:</p>
                  <table>
                    <tbody>
                      <tr>
                        <th>Start</th>
                        <th>End</th>
                        <th>Parameters</th>
                        <th>Description</th>
                        <th>Reporter</th>
                        <th></th>
                      </tr>
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
                          <th>Comma Seperated Sensor Depths</th>
                          <td>
                            <textarea
                              value={sensordepths}
                              placeholder="1.6,4.5,18.0"
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
                  <p>
                    Thanks for filling out a data report, please add a message
                    describing the issue and your email address in case we have
                    further questions.
                  </p>
                  <p>Dataset: {dataset}</p>
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

export default ReportIssue;
