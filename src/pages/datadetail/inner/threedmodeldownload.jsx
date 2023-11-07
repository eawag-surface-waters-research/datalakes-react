import React, { Component } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import "../css/datadetail.css";

class ThreeDModelDownload extends Component {
  state = {
    year: 2020,
    week: 0,
    dates: { 2020: [] },
  };

  onChangeYear = (event) => {
    this.setState({
      year: event.target.value,
      week: 0,
    });
  };

  onChangeWeek = (event) => {
    this.setState({ week: event.target.value });
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

  parseSimpleDate = (date) => {
    if (date !== undefined) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}${month}${day}`;
    } else {
      return "";
    }
  };

  parseWeek = (date) => {
    var end = new Date(date.getTime());
    end.setDate(end.getDate() + 7);
    return `${this.parseDateFormat(date)} to ${this.parseDateFormat(end)}`;
  };

  async componentDidMount() {
    var { mindatetime, maxdatetime } = this.props.dataset;

    const dates = {};
    let currentDate = new Date(mindatetime);
    let endDate = new Date(maxdatetime);
    while (currentDate <= endDate) {
      if (currentDate.getDay() === 0) {
        const year = currentDate.getFullYear();
        if (!dates[year]) {
          dates[year] = [];
        }
        dates[year].push(new Date(currentDate.getTime()));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    var year = Math.max(...Object.keys(dates).map((d) => parseInt(d)));
    var week = dates[String(year)].length - 1;
    this.setState({ dates, year, week });
  }

  render() {
    const { getLabel, dataset } = this.props;
    var { mindatetime, maxdatetime, datasourcelink } = dataset;
    let arr = datasourcelink.split("/");
    var lake = arr[arr.length - 1];
    mindatetime = new Date(mindatetime);
    maxdatetime = new Date(maxdatetime);
    var { dates, year, week } = this.state;

    var years = [];
    var yearlist = Object.keys(dates);
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
        <option key={dates[year][j]} value={j}>
          {this.parseWeek(dates[year][j])}
        </option>
      );
    }

    var url = "https://alplakes-api.eawag.ch";
    var swagger = "https://alplakes-api.eawag.ch/openapi.json";
    var git =
      "https://github.com/eawag-surface-waters-research/alplakes-simulations";
    var sunday = this.parseSimpleDate(dates[year][week]);
    var link = `${url}/simulations/file/delft3d-flow/${lake}/${sunday}`;

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
