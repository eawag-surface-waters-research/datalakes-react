import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { apiUrl } from "../../config.json";

class Monitor extends Component {
  state = {
    monitor: [],
  };
  async componentDidMount() {
    var { data } = await axios.get(apiUrl + "/monitor").catch((error) => {
      console.error(error);
    });
    var now = new Date().getTime();
    data.map((d) => {
      d.maxdatetime = new Date(d.maxdatetime);
      d.timedif = now - d.maxdatetime.getTime() - d.monitor * 1000;
      let color = "green";
      if (now > d.maxdatetime.getTime() - d.monitor * 1000) {
        color = "red";
      }
      d.color = color;
      return d;
    });
    data = data.sort((a, b) => b.timedif - a.timedif);

    this.setState({ monitor: data });
  }
  render() {
    document.title = "Live Data Monitor - Datalakes";
    var { monitor } = this.state;
    return (
      <div className="">
        <h2>Datalakes Monitoring</h2>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>Dataset</th>
              <th>Datetime</th>
              <th>Acceptable Datetime</th>
            </tr>
            {monitor.map((m) => {
              let now = new Date().getTime();
              return (
                <tr key={m.title}>
                  <td>
                    <div
                      className="circle"
                      style={{ backgroundColor: m.color }}
                    />
                  </td>
                  <td>
                    <Link to={"/datadetail/" + m.id}>{m.title}</Link>
                  </td>
                  <td>{m.maxdatetime.toUTCString()}</td>
                  <td>{new Date(now + m.monitor * 1000).toUTCString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <h1>Debugging</h1>
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
            Login to renkulab and check when was the last time data was uploaded
            to the repository, if this is recent then this could be an issue
            with the connection between Renkulab and Datalakes. This can likely
            only be fixed by James Runnalls. Otherwise it is likely to be an
            issue with the data processing so check that the format of recently
            produced files is consistent with old files.
          </li>
          <li>
            If data has not been uploaded to renkulab recently the next thing to
            try is to login to the Lexplore machine, navigate to the repository
            in git bash and check the git status of the repo. Sometime the git
            push can fail and you will see local is x commits ahead of remote.
            Here the git push command should fix the pipeline.
          </li>
          <li>
            If there are no commits then it means that either the processing
            step has failed or the instrument has stopped sending data (or is
            sending data to a new location). Look to see if new data has arrived
            in the expected folders, if not then its likely a problem with the
            instrument.
          </li>
        </ol>
      </div>
    );
  }
}

export default Monitor;
