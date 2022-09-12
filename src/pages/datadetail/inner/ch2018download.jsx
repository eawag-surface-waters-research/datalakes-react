import React, { Component } from "react";
import axios from "axios";
import config from "../../../config.json";
import "../css/datadetail.css";

class Ch2018Download extends Component {
  state = {
    lakes: [],
    data: [],
    lake: "",
    depth: "surface",
    period: "p1",
    smoothing: 5,
  };

  updateLake = (event) => {
    this.setState({ lake: event.target.value });
  };

  async componentDidMount() {
    var { data: lakes } = await axios
      .get(config.apiUrl + "/externaldata/ch2018/lakes", {
        timeout: 10000,
      })
      .catch((error) => {
        console.error(error);
      });
    var lake = lakes[0].id;
    this.setState({ lakes, lake });
  }

  render() {
    var { dataset, getLabel } = this.props;
    var { lakes, lake } = this.state;
    var options = lakes.map((l) => (
      <option key={l.id} value={l.id}>
        {l.name}
      </option>
    ));
    var download = config.apiUrl + "/externaldata/ch2018/" + lake;
    return (
      <div className="download">
        <div className="info-title">Licence</div>
        <a
          href={getLabel("licenses", dataset.licenses_id, "link")}
          title={getLabel("licenses", dataset.licenses_id, "description")}
        >
          {getLabel("licenses", dataset.licenses_id, "name")}
        </a>
        <div className="info-title">Download Summary Data</div>
        <div className="remotesensingdownload">
          <p>
            It is possible to download a .JSON file containing summary
            information for a given lake in the study.
          </p>
          <p>The .JSON file contains the following statistics:</p>
          <ul>
            <li>
              Yearly average of surface and bottom temperature for each of the
              three climate scenarios.
            </li>
            <li>
              Seasonal average of surface and bottom temperature for each of the
              three climate scenarios over four time periods (2018-2011,
              2021-2040, 2041-2070, 2071-2100).
            </li>
            <li>
              Stratification for each of the three climate scenarios over four
              time periods (2018-2011, 2021-2040, 2041-2070, 2071-2100).
            </li>
          </ul>
          <div className="downloadinner">
            <select onChange={this.updateLake} value={lake}>
              {options}
            </select>
            <a href={download}>
              <button>Download</button>
            </a>
          </div>
        </div>
        <div className="info-title">Full Dataset</div>
        <p>
          <a
            href="https://opendata.eawag.ch/dataset/the-vulnerability-of-lakes-along-an-altitudinal-gradient-to-climate-change"
            target="_blank"
            rel="noopener noreferrer"
          >
            ERIC Open
          </a>
        </p>
        <div className="info-title">API</div>
        <p>Download list of lakes: <a href="https://api.datalakes-eawag.ch/externaldata/ch2018/lakes">https://api.datalakes-eawag.ch/externaldata/ch2018/lakes</a></p>
        <p>Download lake statistics: <a href="https://api.datalakes-eawag.ch/externaldata/ch2018/Maggiore">https://api.datalakes-eawag.ch/externaldata/ch2018/{"{lakeid}"}</a></p>
      </div>
    );
  }
}

export default Ch2018Download;
