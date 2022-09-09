import React, { Component } from "react";
import axios from "axios";
import config from "../../../config.json";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import "../css/datadetail.css";

class ThreeDModelDownload extends Component {
  state = {
    year: 2020,
    week: 0,
    yearlist: [],
    dates: { 2020: [] },
  };

  onChangeYear = (event) => {
    var { dates } = this.state;
    this.setState({
      year: event.target.value,
      week: dates[event.target.value][0],
    });
  };

  onChangeWeek = (event) => {
    this.setState({ week: event.target.value });
  };

  getDateFromIsoweek = (isoweek, year, day) => {
    var simple = new Date(year, 0, 1 + (isoweek - 1) * 7, 3);
    var dow = simple.getDay();
    var ISOweekStart = simple;
    if (dow <= 4) {
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return new Date(ISOweekStart.setDate(ISOweekStart.getDate() + (day - 1)));
  };

  parseDateFormat = (date) => {
    var months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "July",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ];
    var day = date.getDate();
    var month = months[date.getMonth()];
    return `${day} ${month}`;
  };

  parseWeek = (week, year) => {
    return `${this.parseDateFormat(
      this.getDateFromIsoweek(week, year, 1)
    )} to ${this.parseDateFormat(this.getDateFromIsoweek(week, year, 7))}`;
  };

  async componentDidMount() {
    var { id } = this.props.dataset;
    var url;
    if (id === 17) {
      url = "/datalakesmodel/available";
    } else {
      url = "/externaldata/meteolakes/available";
    }
    var { data } = await axios
      .get(config.apiUrl + url, {
        timeout: 10000,
      })
      .catch((error) => {
        console.error(error);
      });
    var dates, lake;
    if (id === 11) {
      dates = data.find((d) => d.folder === "data_zurich").data;
      lake = "zurich";
    } else if (id === 14 || id === 17) {
      dates = data.find((d) => d.name === "Lake Geneva").data;
      lake = "geneva";
    } else if (id === 15) {
      dates = data.find((d) => d.name === "Lake Greifen").data;
      lake = "greifensee";
    }

    var new_key;
    for (var key in dates) {
      if (key.includes("Y")) {
        new_key = parseInt(key.replace("Y", ""));
        dates[new_key] = dates[key];
        delete dates[key];
      }
    }

    var yearlist = Object.keys(dates);
    var year = Math.max(...yearlist);
    var weeklist = dates[year];
    var week = Math.max(...weeklist);

    this.setState({
      yearlist,
      year,
      dates,
      week,
      lake,
    });
  }

  render() {
    const { getLabel, dataset } = this.props;
    var { mindatetime, maxdatetime, id } = dataset;
    mindatetime = new Date(mindatetime);
    maxdatetime = new Date(maxdatetime);
    var { lake, week, dates, year, yearlist } = this.state;

    var years = [];
    for (var i = 0; i < yearlist.length; i++) {
      years.push(
        <option key={yearlist[i]} value={yearlist[i]}>
          {yearlist[i]}
        </option>
      );
    }
    var weeks = [];
    for (var j = 0; j < dates[year].length; j++) {
      weeks.push(
        <option key={dates[year][j]} value={dates[year][j]}>
          {this.parseWeek(dates[year][j], year)}
        </option>
      );
    }
    var url, swagger, git;
    if (id === 17) {
      url = config.apiUrl + "/datalakesmodel";
      swagger = url + "/api";
      git = "https://gitlab.com/siam-sc/spux/tree/Datalakes-Spux";
    } else {
      url = "https://api.meteolakes.ch/api/datalakes";
      swagger = config.apiUrl + "/externaldata/meteolakes/api";
      git = "https://github.com/rkaravia/meteolakes";
    }

    var link = `${url}/nc/${lake}/${year}/${week}`;

    return (
      <div className="download">
        <div className="info-title">Licence</div>
        <a
          href={getLabel("licenses", dataset.licenses_id, "link")}
          title={getLabel("licenses", dataset.licenses_id, "description")}
        >
          {getLabel("licenses", dataset.licenses_id, "name")}
        </a>
        <div className="info-title">Citation</div>
        {dataset.citation}

        <div className="info-title">Git Repository</div>
        <a href={git} target="_blank" rel="noopener noreferrer">
          {git}
        </a>

        <div className="info-title">Available Data</div>
        <p>
          Data available from {mindatetime.toLocaleDateString()} to{" "}
          {maxdatetime.toLocaleDateString()}
        </p>

        <div className="info-title">Download</div>
        <p>
          Download NetCDF file containing one week of simulations (every 3hrs).
          Warning - files are around 160mb. For slices of the data please use
          the API below.
        </p>
        <div className="meteolakesdownload">
          <select value={year} onChange={this.onChangeYear}>
            Year: {years}
          </select>
          <select value={week} onChange={this.onChangeWeek}>
            Week: {weeks}
          </select>
          <a href={link}>
            <button>Download</button>
          </a>
        </div>

        <div className="info-title">API</div>

        <div className="api-meteolakes">
          [ Base URL: {url} ]
          <SwaggerUI url={swagger} />
        </div>
      </div>
    );
  }
}

export default ThreeDModelDownload;
