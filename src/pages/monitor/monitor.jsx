import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import config from "../../config.json";
import "./monitor.css";

class Dataset extends Component {
  labelGap = (seconds) => {
    if (Math.abs(seconds) < 60) {
      return `${Math.round(seconds)} s`;
    } else if (Math.abs(seconds) < 60 * 60) {
      return `${Math.round(seconds / 60)} mins`;
    } else if (Math.abs(seconds) < 60 * 60 * 24) {
      return `${Math.round(seconds / (60 * 60))} hrs`;
    } else if (Math.abs(seconds) < 60 * 60 * 24 * 7) {
      return `${Math.round((seconds / (60 * 60 * 24)) * 10) / 10} days`;
    } else {
      return `${Math.round((seconds / (60 * 60 * 24 * 7)) * 10) / 10} weeks`;
    }
  };
  render() {
    var { id, color, title, latest, delay } = this.props;
    if (latest < 0) latest = 0;
    return (
      <Link to={"/datadetail/" + id}>
        <div className="dataset" style={{ borderColor: color }}>
          <div className="title">{title}</div>
          <div className="inner">
            {delay < 0
              ? `Updated ${this.labelGap(latest)} ago.`
              : `Out of date by ${this.labelGap(latest)}.`}
          </div>
        </div>
      </Link>
    );
  }
}

class Monitor extends Component {
  state = {
    monitor: [],
  };

  async componentDidMount() {
    var { data } = await axios.get(config.apiUrl + "/monitor").catch((error) => {
      console.error(error);
    });
    var now = new Date().getTime();
    data.map((d) => {
      d.maxdatetime = new Date(d.maxdatetime);
      d.latest = (now - d.maxdatetime.getTime()) / 1000;
      d.timedif = (now + d.monitor * 1000 - d.maxdatetime.getTime()) / 1000;
      let color = "#d4f6d4";
      if (d.timedif > 0) {
        color = "#eec77f";
      }
      if (d.timedif > Math.abs(d.monitor * 5)) {
        color = "#ef7979";
      }
      d.color = color;
      return d;
    });
    data = data.sort((a, b) => b.timedif - a.timedif);

    this.setState({ monitor: data });
  }
  render() {
    document.title = "Monitor - Datalakes";
    var { monitor } = this.state;
    return (
      <div className="monitor">
        <h1>Live Status</h1>
        {monitor.map((m) => {
          return (
            <Dataset
              key={m.id}
              id={m.id}
              color={m.color}
              title={m.title}
              delay={m.timedif}
              latest={m.latest}
            />
          );
        })}

        <div className="debugging">
          <h2>Debugging</h2>
          <p>
            There are a number of sections of the data pipeline that can break
            down, listed here are common fixes that can help to restart a broken
            pipeline. The main sections of the pipeline are as follows:
          </p>
          <ul>
            <li>Transfer from intrument</li>
            <li>Processing of data</li>
            <li>Upload to renkulab</li>
            <li>Datalakes update</li>
          </ul>
          <p>
            In order to detect which section of the process is broken the
            following process can be followed.
          </p>
          <ol>
            <li>
              Login to renkulab and check when was the last time data was
              uploaded to the repository, if this is recent then this could be
              an issue with the connection between Renkulab and Datalakes. This
              can likely only be fixed by James Runnalls. Otherwise it is likely
              to be an issue with the data processing so check that the format
              of recently produced files is consistent with old files.
            </li>
            <li>
              If data has not been uploaded to renkulab recently the next thing
              to try is to login to the Lexplore machine, navigate to the
              repository in git bash and check the git status of the repo.
              Sometime the git push can fail and you will see local is x commits
              ahead of remote. Here the git push command should fix the
              pipeline.
            </li>
            <li>
              If there are no commits then it means that either the processing
              step has failed or the instrument has stopped sending data (or is
              sending data to a new location). Look to see if new data has
              arrived in the expected folders, if not then its likely a problem
              with the instrument.
            </li>
          </ol>
        </div>
      </div>
    );
  }
}

export default Monitor;
