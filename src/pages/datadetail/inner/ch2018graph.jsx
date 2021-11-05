import React, { Component } from "react";
import axios from "axios";
import { apiUrl } from "../../../config.json";
import D3LineGraph from "../../../graphs/d3/linegraph/linegraph";
import D3GroupedBarGraph from "../../../graphs/d3/groupedbargraph/groupedbargraph";
import "../css/datadetail.css";

class Ch2018Graph extends Component {
  state = {
    lakes: [],
    data: [],
    lake: "",
    depth: "surface",
    period: "p1",
    smoothing: 5,
  };

  updateSmoothing = (event) => {
    this.setState({ smoothing: parseInt(event.target.value) });
  };

  updateLake = async (event) => {
    var { data } = this.state;
    var lake = event.target.value;
    if (!Object.keys(data).includes(lake)) {
      var { data: lakedata } = await axios
        .get(apiUrl + "/externaldata/ch2018/" + lake, {
          timeout: 10000,
        })
        .catch((error) => {
          console.error(error);
        });
      data[lake] = lakedata;
      this.setState({ lake, data });
    } else {
      this.setState({ lake });
    }
  };

  updateDepth = (event) => {
    this.setState({ depth: event.target.value });
  };

  updatePeriod = (event) => {
    this.setState({ period: event.target.value });
  };

  movingAvg = (array, count, qualifier) => {
    if (count === 0) {
      return array;
    }
    // calculate average for subarray
    var avg = function (array, qualifier) {
      var sum = 0,
        count = 0,
        val;
      for (var i in array) {
        val = array[i];
        if (!qualifier || qualifier(val)) {
          sum += val;
          count++;
        }
      }

      return sum / count;
    };

    var result = [],
      val;

    // pad beginning of result with null values
    for (var i = 0; i < count - 1; i++) result.push(null);

    // calculate average for each subarray and add to result
    for (var j = 0, len = array.length - count; j <= len; j++) {
      val = avg(array.slice(j, j + count), qualifier);
      if (isNaN(val)) result.push(null);
      else result.push(val);
    }

    return result;
  };

  async componentDidMount() {
    var { data: lakes } = await axios
      .get(apiUrl + "/externaldata/ch2018/lakes", {
        timeout: 10000,
      })
      .catch((error) => {
        console.error(error);
      });
    var { data: lakedata } = await axios
      .get(apiUrl + "/externaldata/ch2018/" + lakes[0].id, {
        timeout: 10000,
      })
      .catch((error) => {
        console.error(error);
      });

    var index = 0;
    if (this.props.search) {
      var l = this.props.search.replace("?", "");
      if (lakes.map((ll) => ll.id).includes(l)) {
        index = lakes.map((ll) => ll.id).indexOf(l);
      }
    }

    var data = {};

    data[lakes[index].id] = lakedata;
    this.setState({ lakes, data, lake: lakes[index].id });
  }

  render() {
    var { lakes, depth, lake, data: inData, period, smoothing } = this.state;
    var lake_options = [];
    var data = JSON.parse(JSON.stringify(inData));
    for (var listlake of lakes) {
      lake_options.push(
        <option value={listlake.id} key={listlake.id}>
          {listlake.name}
        </option>
      );
    }
    var lakeproperties = {};
    if (lakes.length > 0) lakeproperties = lakes.find((l) => l.id === lake);
    var { name, altitude, area, volume } = lakeproperties;
    var lcolor = [];
    var lweight = [];
    var yearly = [];
    var seasonal = [];
    var legend = [];
    var barlegend = [];
    var barcolors = [];
    var stratification = [];
    var yearlyConfidence = [];
    var seasonalConfidence = [];
    if (Object.keys(data).length > 0) {
      lcolor = ["green", "#FF8C00", "red"];
      lweight = [1, 1, 1];
      legend = [
        { color: "green", text: "RCP 2.6" },
        { color: "#FF8C00", text: "RCP 4.5" },
        { color: "red", text: "RCP 8.5" },
      ];
      barlegend = [
        { color: "#F4A460", text: "Summer Stratification", offset: 0 },
        { color: "#8FBC8F", text: "Mixed", offset: 140 },
        { color: "#87CEFA", text: "Winter Stratification", offset: 200 },
        { color: "#ADD8E6", text: "Ice Cover", offset: 330 },
      ];
      barcolors = ["#F4A460", "#8FBC8F", "#87CEFA", "#ADD8E6"];

      stratification = data[lake].stratification[period];

      yearly = [
        {
          x: data[lake]["yearly"][depth]["RCP26"]["x"],
          y: this.movingAvg(
            data[lake]["yearly"][depth]["RCP26"]["y_ave"],
            smoothing
          ),
        },
        {
          x: data[lake]["yearly"][depth]["RCP45"]["x"],
          y: this.movingAvg(
            data[lake]["yearly"][depth]["RCP45"]["y_ave"],
            smoothing
          ),
        },
        {
          x: data[lake]["yearly"][depth]["RCP85"]["x"],
          y: this.movingAvg(
            data[lake]["yearly"][depth]["RCP85"]["y_ave"],
            smoothing
          ),
        },
      ];
      yearlyConfidence = [
        {
          CI_upper: data[lake]["yearly"][depth]["RCP26"]["y_max"],
          CI_lower: data[lake]["yearly"][depth]["RCP26"]["y_min"],
        },
        {
          CI_upper: data[lake]["yearly"][depth]["RCP45"]["y_max"],
          CI_lower: data[lake]["yearly"][depth]["RCP45"]["y_min"],
        },
        {
          CI_upper: data[lake]["yearly"][depth]["RCP85"]["y_max"],
          CI_lower: data[lake]["yearly"][depth]["RCP85"]["y_min"],
        },
      ];
      seasonal = [
        {
          y: data[lake]["seasonal"][depth][period]["RCP26"]["ave"],
          x: [
            ...Array(
              data[lake]["seasonal"][depth][period]["RCP26"]["ave"].length
            ).keys(),
          ],
        },
        {
          y: data[lake]["seasonal"][depth][period]["RCP45"]["ave"],
          x: [
            ...Array(
              data[lake]["seasonal"][depth][period]["RCP45"]["ave"].length
            ).keys(),
          ],
        },
        {
          y: data[lake]["seasonal"][depth][period]["RCP85"]["ave"],
          x: [
            ...Array(
              data[lake]["seasonal"][depth][period]["RCP85"]["ave"].length
            ).keys(),
          ],
        },
      ];
      seasonalConfidence = [
        {
          CI_upper: data[lake]["seasonal"][depth][period]["RCP26"]["max"],
          CI_lower: data[lake]["seasonal"][depth][period]["RCP26"]["min"],
        },
        {
          CI_upper: data[lake]["seasonal"][depth][period]["RCP45"]["max"],
          CI_lower: data[lake]["seasonal"][depth][period]["RCP45"]["min"],
        },
        {
          CI_upper: data[lake]["seasonal"][depth][period]["RCP85"]["max"],
          CI_lower: data[lake]["seasonal"][depth][period]["RCP85"]["min"],
        },
      ];
    }

    var perioddict = {
      p1: "1980 - 2011",
      p2: "2012 - 2040",
      p3: "2041 - 2070",
      p4: "2071 - 2100",
    };

    var depthdict = { surface: "Surface", bottom: "Bottom" };

    return (
      <div className="ch2018graph">
        <div className="selections">
          <table>
            <tbody>
              <tr>
                <td>Lake</td>
                <td>Surface/ Bottom</td>
                <td>Time Period</td>
                <td>Smoothing</td>
                <td>Altitude</td>
                <td>Area</td>
                <td>Volume</td>
              </tr>
              <tr>
                <td>
                  <select value={lake} onChange={this.updateLake}>
                    {lake_options}
                  </select>
                </td>
                <td>
                  <select value={depth} onChange={this.updateDepth}>
                    <option value="surface">Surface</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </td>
                <td>
                  <select value={period} onChange={this.updatePeriod}>
                    <option value="p1">1980 - 2011</option>
                    <option value="p2">2012 - 2040</option>
                    <option value="p3">2041 - 2070</option>
                    <option value="p4">2071 - 2100</option>
                  </select>
                </td>
                <td>
                  <select value={smoothing} onChange={this.updateSmoothing}>
                    <option value="0">None</option>
                    <option value="2">2Yr Moving Ave</option>
                    <option value="3">3Yr Moving Ave</option>
                    <option value="5">5Yr Moving Ave</option>
                    <option value="10">10Yr Moving Ave</option>
                  </select>
                </td>
                <td>{altitude} m a.s.l.</td>
                <td>{area} km&sup2;</td>
                <td>{volume} km&sup3;</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="left">
          <D3LineGraph
            data={yearly}
            title={`Average Yearly ${depthdict[depth]} Temperature for ${name}`}
            xlabel={"Year"}
            ylabel={`${depthdict[depth]} Temperature`}
            yunits={"°C"}
            lcolor={lcolor}
            lweight={lweight}
            xscale={"linear"}
            yscale={"linear"}
            confidence={yearlyConfidence}
            legend={legend}
          />
        </div>
        <div className="right">
          <div className="upper">
            <D3GroupedBarGraph
              title={`Seasonal Stratification for ${name} (${perioddict[period]})`}
              xlabel={"Average Days per Year"}
              data={stratification}
              colors={barcolors}
              xunits={"days"}
              legend={barlegend}
            />
          </div>
          <div className="lower">
            <D3LineGraph
              data={seasonal}
              title={`Seasonal ${depthdict[depth]} Temperature for ${name} (${perioddict[period]})`}
              xlabel={"Day of Year"}
              ylabel={`${depthdict[depth]} Temperature`}
              yunits={"°C"}
              lcolor={lcolor}
              lweight={lweight}
              xscale={"linear"}
              yscale={"linear"}
              confidence={seasonalConfidence}
              legend={legend}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Ch2018Graph;
