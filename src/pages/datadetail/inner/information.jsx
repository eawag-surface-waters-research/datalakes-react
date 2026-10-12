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
import { urlFromSsh, groupMaintenance, formatLocalTime } from '../../../functions';
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

  round = (num, dec) => {
    return Math.round(num * 10 ** dec) / 10 ** dec;
  };

  render() {
    const { dataset, getLabel, scripts, maintenance, events } = this.props;
    var script = scripts.filter((s) => s.name.includes(".md"));
    var dict = groupMaintenance(maintenance);

    var rows = [];
    for (var key in dict) {
      const row = dict[key];
      rows.push(
        <tr key={key}>
          <td>{formatLocalTime(row.start)}</td>
          <td>{formatLocalTime(row.end)}</td>
          <td>{row.parameters.join(", ")}</td>
          <td>{row.depths}</td>
          <td>{row.description}</td>
          <td><span className="badge badge-info">{row.state}</span></td>
          <td>{row.reporter}</td>
        </tr>
      );
    }

    var eventRows = [];
    if (events && events.length > 0) {
      for (var i = 0; i < events.length; i++) {
        var event = events[i];
        eventRows.push(
          <tr key={i}>
            <td>{formatLocalTime(event.start)}</td>
            <td>{formatLocalTime(event.stop)}</td> 
            <td>{event.parameter}</td>
            <td>{event.depth ? event.depth.split(",").join(", ") : ""}</td>
            <td>{event.comments}</td>
          </tr>
        );
      }
    }
    
    urlFromSsh(dataset.ssh)
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
                href={urlFromSsh(dataset.ssh)}
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
          <div className="readme">
            {script.length === 1 ? (
              <ReactMarkdown>{script[0].data}</ReactMarkdown>
            ) : (
              <React.Fragment>{dataset.description}</React.Fragment>
            )}
          </div>
          <React.Fragment>
            {maintenance.length > 0 ? (
              <div className="description">
                <div className="desc-header">Reported data issues:</div>
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th style={{ width: "150px" }}>Start</th>
                      <th style={{ width: "150px" }}>End</th>
                      <th>Parameters</th>
                      <th>Depths</th>
                      <th>Description</th>
                      <th style={{ width: "150px" }}>State</th>
                      <th>Reporter</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows}
                  </tbody>
                </table>
                <div className="desc-warning">WARNING: Confirmed data issues are masked on Datalakes but may still be present in the downloadable files.</div>
              </div>
            ) : (
              ""
            )}
          </React.Fragment>
          <React.Fragment>
            {events && events.length > 0 ? (
              <div className="description">
                <div className="desc-header">Data masked in processing:</div>
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th style={{ width: "150px" }}>Start</th>
                      <th style={{ width: "150px" }}>End</th>
                      <th>Parameters</th>
                      <th>Depths</th>
                      <th>Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventRows}
                  </tbody>
                </table>
                <div className="desc-warning">INFO: Data in these periods is masked by the processing pipeline, so it is also masked in the downloadable files.</div>
              </div>
            ) : (
              ""
            )}
          </React.Fragment>
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
