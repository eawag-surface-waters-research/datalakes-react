import React, { Component } from "react";
import ReactMarkdown from "react-markdown";
import mail from "../img/mail.svg";
import calendar from "../img/calendar.svg";
import location from "../img/location.svg";
import git from "../img/git.svg";
import depth from "../img/depth.svg";
import download from "../img/download.svg";
import citation from "../img/citation.svg";
import licence from "../img/licence.svg";
import "../css/datadetail.css";

class Information extends Component {
  state = {};

  parseDate = (input) => {
    var months = [
      "Jan ",
      "Feb ",
      "Mar ",
      "Apr ",
      "May ",
      "Jun ",
      "Jul ",
      "Aug ",
      "Sept ",
      "Oct ",
      "Nov ",
      "Dec ",
    ];
    var date = new Date(input);
    return months[date.getMonth()] + date.getFullYear();
  };

  formatTime = (time) => {
    let parts = time.split("T");
    return parts[0] + " " + parts[1].slice(0, 5);
  };

  round = (num, dec) => {
    return Math.round(num * 10 ** dec) / 10 ** dec;
  };

  render() {
    const { dataset, getLabel, scripts, maintenance } = this.props;
    console.log(maintenance);
    var script = scripts.filter((s) => s.name.includes(".md"));
    var dict = {};
    for (let i = 0; i < maintenance.length; i++) {
      let dt =
        maintenance[i].starttime.toString() + maintenance[i].endtime.toString();
      if (dt in dict) {
        dict[dt]["parameters"].push(
          maintenance[i].name +
            (maintenance[i].detail !== "none"
              ? ` (${maintenance[i].detail})`
              : "")
        );
        dict[dt]["id"].push(maintenance[i].id);
      } else {
        dict[dt] = {
          start: maintenance[i].starttime,
          end: maintenance[i].endtime,
          parameters: [
            maintenance[i].name +
              (maintenance[i].detail !== "none"
                ? ` (${maintenance[i].detail})`
                : ""),
          ],
          description: maintenance[i].description,
          id: [maintenance[i].id],
          reporter: maintenance[i].reporter,
        };
      }
    }

    var rows = [];
    for (var key in dict) {
      rows.push(
        <tr key={key}>
          <td>{this.formatTime(dict[key].start)}</td>
          <td>{this.formatTime(dict[key].end)}</td>
          <td>{dict[key].parameters.join(", ")}</td>
          <td>{dict[key].description}</td>
          <td>{dict[key].reporter}</td>
        </tr>
      );
    }
    return (
      <React.Fragment>
        <div className="info-mation">
          <div className="description">
            <div className="data-row">
              <img src={calendar} alt="calendar" />{" "}
              {this.parseDate(dataset.mindatetime)} to{" "}
              {this.parseDate(dataset.maxdatetime)}
            </div>
            <div className="data-row">
              <img src={location} alt="location" />
              <a
                href={`https://www.google.com/maps/search/${dataset.latitude},${dataset.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {getLabel("lakes", dataset.lakes_id, "name")} [
                {this.round(dataset.latitude, 3)},{" "}
                {this.round(dataset.longitude, 3)}]
              </a>
            </div>
            <div className="data-row">
              <img src={git} alt="git" />
              <a
                href={dataset.datasourcelink.split("/-/blob")[0]}
                target="_blank"
                rel="noopener noreferrer"
              >
                Link to Git Repository
              </a>
            </div>
            {dataset.mindepth !== "-9999" && (
              <div className="data-row">
                <img src={depth} alt="depth" />
                {`${this.round(dataset.mindepth, 3)}m to ${this.round(
                  dataset.maxdepth,
                  3
                )}m`}
              </div>
            )}
            {dataset.downloads > 10 && (
              <div className="data-row">
                <img src={download} alt="download" /> {dataset.downloads}{" "}
                downloads
              </div>
            )}
            <div className="data-row">
              <img src={licence} alt="licence" />
              <a
                href={getLabel("licenses", dataset.licenses_id, "link")}
                target="_blank"
                rel="noopener noreferrer"
                title={getLabel("licenses", dataset.licenses_id, "description")}
              >
                {getLabel("licenses", dataset.licenses_id, "name")}
              </a>
            </div>
            <div className="data-row">
              <img src={citation} alt="citation" />
              {dataset.citation}
            </div>
          </div>
          <React.Fragment>
            {maintenance.length > 0 ? (
              <div className="description">
                <div className="desc-header">Reported maintenance periods:</div>
                <table>
                  <tbody>
                    <tr>
                      <th>Start</th>
                      <th>End</th>
                      <th>Parameters</th>
                      <th>Description</th>
                      <th>Reporter</th>
                    </tr>
                    {rows}
                  </tbody>
                </table>
                <div className="desc-warning">WARNING: Reported maintenance periods are masked on Datalakes however may not be in the downloadable files.</div>
              </div>
            ) : (
              ""
            )}
          </React.Fragment>
          <div className="readme">
            {script.length === 1 ? (
              <ReactMarkdown>{script[0].data}</ReactMarkdown>
            ) : (
              <React.Fragment>{dataset.description}</React.Fragment>
            )}
          </div>
          <div className="info-contact">
            <div className="contact-header">Questions about the dataset?</div>
            <div className="contact-inner">
              <div className="contact-icon">
                <img src={mail} alt="mail" />
              </div>
              <div className="contact-text">
                <div className="contact-name">
                  {getLabel("persons", dataset.persons_id, "name")}
                </div>
                <div className="contact-email">
                  {getLabel("persons", dataset.persons_id, "email")}
                </div>
                <div className="contact-job">
                  {getLabel("projects", dataset.projects_id, "name")},{" "}
                  {getLabel("organisations", dataset.organisations_id, "name")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Information;
