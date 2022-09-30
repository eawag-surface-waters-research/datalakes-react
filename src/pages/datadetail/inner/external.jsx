import React, { Component } from "react";
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

  render() {
    const { dataset, getLabel } = this.props;
    var lake = getLabel("lakes", dataset.lakes_id, "name");
    console.log(lake);
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
                {lake}{" "}
                {lake !== "Multiple"
                  ? `[${dataset.latitude}, ${dataset.longitude}]`
                  : ""}
              </a>
            </div>
            <div className="data-row">
              <img src={git} alt="git" />
              <a
                href={dataset.datasourcelink.split("/-/blob")[0]}
                target="_blank"
                rel="noopener noreferrer"
              >
                Link to external data
              </a>
            </div>
            {dataset.mindepth !== "-9999" && (
              <div className="data-row">
                <img src={depth} alt="depth" />
                {`${dataset.mindepth}m to ${dataset.maxdepth}m`}
              </div>
            )}

            <div className="data-row">
              <img src={download} alt="download" /> {dataset.downloads}{" "}
              downloads
            </div>
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
          <div className="description">
            <div className="exinfo">
              The data source is hosted by an external partner. For more details
              please contact {getLabel("persons", dataset.persons_id, "name")}{" "}
              using the contact details listed below.
            </div>
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
