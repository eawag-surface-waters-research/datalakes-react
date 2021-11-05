import React, { Component } from "react";
import axios from "axios";
import "./reportissue.css";

class ReportIssue extends Component {
  state = {
    reported: false,
    modal: false,
    message: "",
    email: "",
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
  updateMessage = (event) => {
    this.setState({ message: event.target.value });
  };
  updateEmail = (event) => {
    this.setState({ email: event.target.value });
  };
  submitReport = async () => {
    var { message, email } = this.state;
    var { dataset } = this.props;
    var content = {
      from: {
        email: "james.runnalls@eawag.ch",
      },
      personalizations: [
        {
          to: [
            {
              email: "runnalls.james@gmail.com",
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
    await axios.post("https://api.datalakes-eawag.ch/contact", content);
    this.setState({ reported: true });
  };
  render() {
    var { reported, modal } = this.state;
    var { dataset } = this.props;
    return (
      <div className="report-issue">
        <div className="report-button">
          Does something not look right with this dataset?
          <button onClick={this.openModal}>Report Issue</button>
        </div>
        {modal && (
          <div className="report-modal" onClick={this.closeModal}>
            <div className="report-modal-box">
              <div className="close-modal" onClick={this.closeModal}>
                &#215;
              </div>
              <h2>Report Issue</h2>
              <p>
                Thanks for filling out a data report, please add a message
                describing the issue and your email address in case we have
                further questions.
              </p>
              <p>Dataset: {dataset}</p>
              <textarea
                placeholder="Please type your report here."
                onChange={this.updateMessage}
              />
              <input
                type="text"
                placeholder="Email address"
                onChange={this.updateEmail}
              />
              {reported ? (
                <p>
                  Thanks for submitting a data report. We will look into it as
                  soon as possible.
                </p>
              ) : (
                <div className="modal-submit">
                  <button onClick={this.submitReport}>Submit Report</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default ReportIssue;
