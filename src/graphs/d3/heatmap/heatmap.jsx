import React, { Component } from "react";
import * as d3 from "d3";
import "d3-contour";
import GraphHeader from "../graphheader/graphheader";
import "./heatmap.css";
import isEqual from "lodash/isEqual";
import D3LineGraph from "../linegraph/linegraph";
import CanvasHeatmap from "./canvasHeatmap";

class D3HeatMap extends Component {
  state = {
    graphid: Math.round(Math.random() * 100000),
    download: false,
    fullscreen: false,
    display: this.props.display ? this.props.display : "contour",
    zoom: false,
    fontSize: 12,
    xgraph: this.props.xgraph ? true : false,
    ygraph: this.props.ygraph ? true : false,
    mousex: false,
    mousey: false,
    mouse: false,
    idx: 0,
    autoDownSample: false,
    saved: [],
  };

  clearSaved = () => {
    this.setState({ saved: [] });
  };

  editFontSize = (fontSize) => {
    this.setState({ fontSize });
  };

  toggleXgraph = () => {
    var { saved, ygraph, xgraph } = this.state;
    if (ygraph === false && xgraph === true) saved = [];
    this.setState({ xgraph: !xgraph, saved }, () => {
      window.dispatchEvent(new Event("resize"));
    });
  };

  toggleYgraph = () => {
    var { saved, ygraph, xgraph } = this.state;
    if (xgraph === false && ygraph === true) saved = [];
    this.setState({ ygraph: !ygraph, saved }, () => {
      window.dispatchEvent(new Event("resize"));
    });
  };

  toggleDownload = () => {
    this.setState({ download: !this.state.download });
  };

  toggleFullscreen = () => {
    var { fullscreen, xgraph, ygraph } = this.state;
    this.setState(
      {
        fullscreen: !fullscreen,
        xgraph: false,
        ygraph: false,
      },
      () => {
        this.setState({ xgraph, ygraph });
      }
    );
  };

  toggleDisplay = () => {
    var { display } = this.state;
    if (display === "contour") {
      display = "heatmap";
    } else {
      display = "contour";
    }
    this.setState({ display });
  };

  closest = (num, arr) => {
    var curr = 0;
    var diff = Math.abs(num - arr[curr]);
    for (var val = 0; val < arr.length; val++) {
      var newdiff = Math.abs(num - arr[val]);
      if (newdiff < diff) {
        diff = newdiff;
        curr = val;
      }
    }
    return curr;
  };

  median = (arr) => {
    const mid = Math.floor(arr.length / 2),
      nums = [...arr].sort((a, b) => a - b);
    return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
  };

  gaps = (arr) => {
    var out = [];
    for (var i = 1; i < arr.length; i++) {
      out.push(arr[i] - arr[i - 1]);
    }
    return out;
  };

  indexOfClosest = (num, arr) => {
    var index = 0;
    var diff = Math.abs(num - arr[0]);
    for (var val = 0; val < arr.length; val++) {
      var newdiff = Math.abs(num - arr[val]);
      if (newdiff < diff) {
        diff = newdiff;
        index = val;
      }
    }
    return index;
  };

  columnSelect = (arr, i) => {
    return arr.map((a) => a[i]);
  };

  downloadCSV = () => {
    try {
      var { data, xlabel, ylabel, zlabel, xunits, yunits, zunits, title } =
        this.props;
      var printdata;
      if (Array.isArray(data)) {
        if (data.length !== 1) {
          alert(
            "Dataset too complex for single CSV download, please use the download interface for accessing CSV results for this dataset."
          );
          return;
        } else {
          printdata = data[0];
        }
      } else {
        printdata = data;
      }
      var csvContent = `data:text/csv;charset=utf-8,,${ylabel} (${yunits})\n${xlabel} (${xunits}),${zlabel} (${zunits})\n`;
      csvContent = csvContent + `,${printdata.y.join(",")}\n`;
      for (var i = 0; i < printdata.x.length; i++) {
        csvContent =
          csvContent +
          `${printdata.x[i]},${this.columnSelect(printdata.z, i).join(",")}\n`;
      }
      var name = "heatmap_data.csv";
      if (title) {
        name = title.split(" ").join("_") + ".csv";
      }
      var encodedUri = encodeURI(csvContent);
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", name);
      document.body.appendChild(link);
      link.click();
      this.setState({ download: false });
    } catch (e) {
      alert("Failed to convert data to .csv, please download in .json format.");
    }
  };

  downloadJSON = () => {
    var { data, xlabel, ylabel, zlabel, xunits, yunits, zunits, title } =
      this.props;
    var arr = {
      ...{ xlabel, xunits, ylabel, yunits, zlabel, zunits, title },
      ...data,
    };
    var name = "heatmap_data.json";
    if (title) {
      name = title.split(" ").join("_") + ".json";
    }
    var encodedUri =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(arr));
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", name);
    document.body.appendChild(link);
    link.click();
    this.setState({ download: false });
  };

  getDomain = (domain) => {
    var minarr = domain.map((d) => d[0]);
    var maxarr = domain.map((d) => d[1]);
    var min = d3.extent(minarr)[0];
    var max = d3.extent(maxarr)[1];
    return [min, max];
  };

  thresholds = (domain, t) => {
    let thresholds = [];
    let step = (domain[1] - domain[0]) / (t + 1);
    for (let i = 0; i < t; i++) {
      thresholds.push(domain[0] + step * i);
    }
    return thresholds;
  };

  hover = (event) => {
    var { mousex, mousey } = event;
    this.setState({ mousex, mousey });
  };

  click = (event) => {
    var { saved, xgraph, ygraph } = this.state;
    if (xgraph || ygraph) {
      var { mousex, mousey } = event;
      saved.push({ mousex, mousey });
      if (saved.length > 10) {
        saved.splice(0, saved.length - 10);
      }
      this.setState({ saved });
    }
  };

  parseName = (data, label, timeLabels, unit) => {
    if (timeLabels.includes(label)) {
      return this.formatDateTime(data);
    } else {
      return data + unit;
    }
  };

  formatDateTime = (datetime) => {
    var a = new Date(datetime);
    var hour = a.getHours();
    var minute = a.getMinutes();
    var year = a.getFullYear();
    var month = a.getMonth() + 1;
    var date = a.getDate();
    return `${hour < 10 ? "0" + hour : hour}:${
      minute < 10 ? "0" + minute : minute
    } ${date < 10 ? "0" + date : date}.${
      month < 10 ? "0" + month : month
    }.${String(year).slice(-2)}`;
  };

  prepareOptions = () => {
    var { display, graphid, fontSize, autoDownSample } = this.state;
    var {
      xlabel,
      ylabel,
      zlabel,
      xunits,
      yunits,
      zunits,
      bcolor,
      colors,
      title,
      minvalue,
      maxvalue,
      yReverse,
      xReverse,
      thresholdStep,
      language,
      levels,
    } = this.props;

    if (typeof language === "string" || language instanceof String)
      language = language.toLowerCase();

    return {
      xLabel: xlabel,
      yLabel: ylabel,
      zLabel: zlabel,
      xUnit: xunits,
      yUnit: yunits,
      zUnit: zunits ? zunits : "",
      yReverse,
      xReverse,
      thresholdStep: parseFloat(thresholdStep),
      zMin: minvalue,
      zMax: maxvalue,
      colors,
      title,
      language: language,
      backgroundColor: bcolor,
      autoDownsample: autoDownSample,
      fontSize,
      contour: display === "contour",
      hover: this.hover,
      click: this.click,
      setDownloadGraphDiv: "png" + graphid,
      levels,
    };
  };

  componentDidMount() {
    if ("display" in this.props) {
      this.setState({ display: this.props.display });
    }
    const { data } = this.props;
    const { graphid } = this.state;
    const options = this.prepareOptions();
    this.heatmap = new CanvasHeatmap("vis" + graphid, data, options);
    let firstRun = true;
    const myObserver = new ResizeObserver((entries) => {
      if (firstRun) {
        firstRun = false;
        return;
      }
      entries.forEach((entry) => {
        this.heatmap.resize();
      });
    });
    myObserver.observe(document.getElementById("vis" + this.state.graphid));
  }

  componentDidUpdate(prevProps, prevState) {
    var { display, fontSize, fullscreen, xgraph, ygraph } = this.state;
    var compareProps = !isEqual(prevProps, this.props);
    if (
      !isEqual(prevProps.data.z, this.props.data.z) &&
      isEqual(
        { ...prevProps, data: { ...prevProps.data, z: undefined } },
        { ...this.props, data: { ...this.props.data, z: undefined } }
      )
    ) {
      this.heatmap.updateData(this.props.data);
    } else if (
      compareProps ||
      display !== prevState.display ||
      fontSize !== prevState.fontSize ||
      fullscreen !== prevState.fullscreen ||
      xgraph !== prevState.xgraph ||
      ygraph !== prevState.ygraph
    ) {
      const options = this.prepareOptions();
      this.heatmap.update(this.props.data, options);
    }
    if (compareProps) {
      this.setState({ saved: [] });
    }
  }
  render() {
    var {
      graphid,
      download,
      fullscreen,
      display,
      fontSize,
      xgraph,
      ygraph,
      mousex,
      mousey,
      idx,
      saved,
    } = this.state;
    var {
      title,
      ylabel,
      xlabel,
      zlabel,
      xunits,
      yunits,
      zunits,
      data,
      xReverse,
      yReverse,
      maxvalue,
      minvalue,
      dark,
    } = this.props;

    const TimeLabels = ["Time", "time", "datetime", "Datetime", "Date", "date"];

    var xy = " ";
    if (xgraph) xy = xy + "x";
    if (ygraph) xy = xy + "y";

    var datax = [];
    var datay = [];
    try {
      var linedata = data;
      if (Array.isArray(linedata)) linedata = linedata[idx];
      for (let s of saved) {
        if (xgraph && linedata) {
          datax.push({
            x: linedata.x,
            y: linedata.z[s.mousey],
            name: this.parseName(
              linedata.y[s.mousey],
              ylabel,
              TimeLabels,
              yunits
            ),
          });
        }
        if (ygraph && linedata) {
          datay.push({
            x: linedata.z.map((z) => z[s.mousex]),
            y: linedata.y,
            name: this.parseName(
              linedata.x[s.mousex],
              xlabel,
              TimeLabels,
              xunits
            ),
          });
        }
      }
      if (xgraph && mousey !== false && linedata) {
        datax.push({
          x: linedata.x,
          y: linedata.z[mousey],
          name: this.parseName(linedata.y[mousey], ylabel, TimeLabels, yunits),
        });
      }
      if (ygraph && mousex !== false && linedata) {
        datay.push({
          x: linedata.z.map((z) => z[mousex]),
          y: linedata.y,
          name: this.parseName(linedata.x[mousex], xlabel, TimeLabels, xunits),
        });
      }
    } catch (e) {
      console.error(e);
    }

    if (datax.length === 0) datax.push({ x: [], y: [] });
    if (datay.length === 0) datay.push({ x: [], y: [] });

    var lcolor = [
      dark ? "white" : "black",
      "#e6194B",
      "#3cb44b",
      "#4363d8",
      "#f58231",
      "#911eb4",
      "#42d4f4",
      "#f032e6",
      "#fabed4",
      "#469990",
      "#dcbeff",
      "#9A6324",
      "#fffac8",
      "#800000",
      "#aaffc3",
      "#808000",
      "#ffd8b1",
      "#000075",
    ];
    if (xlabel === "time") xlabel = "";
    return (
      <div className={fullscreen ? "vis-main full" : "vis-main"}>
        <div className="heatmap-main">
          {this.props.header !== false && (
            <div className="heatmap-header">
              <GraphHeader
                id={graphid}
                title={title}
                download={download}
                display={display}
                fontSize={fontSize}
                fullscreen={fullscreen}
                toggleDownload={this.toggleDownload}
                editFontSize={this.editFontSize}
                toggleDisplay={this.toggleDisplay}
                toggleFullscreen={this.toggleFullscreen}
                downloadJSON={this.downloadJSON}
                downloadCSV={this.downloadCSV}
                clearPlot={this.clearSaved}
                toggleXgraph={this.toggleXgraph}
                toggleYgraph={this.toggleYgraph}
              />
            </div>
          )}

          <div className="heatmap-graphs">
            <div className={"heatmap-top" + xy}>
              <div className={"heatmap-left" + xy}>
                {ygraph && (
                  <D3LineGraph
                    data={datay}
                    xlabel={zlabel}
                    ylabel={ylabel}
                    xunits={zunits}
                    yunits={yunits}
                    xmax={maxvalue}
                    xmin={minvalue}
                    fontSize={fontSize}
                    xReverse={false}
                    yReverse={yReverse}
                    lcolor={lcolor}
                    lweight={[1]}
                    marginTop={1}
                    marginRight={1}
                    bcolor={["white"]}
                    simple={false}
                    scatter={false}
                    curve={true}
                    xscale={TimeLabels.includes(zlabel) ? "Time" : ""}
                    yscale={TimeLabels.includes(ylabel) ? "Time" : ""}
                  />
                )}
              </div>
              <div className={"heatmap-right" + xy} id={"vis" + graphid}></div>
            </div>
            <div className={"heatmap-bottom" + xy}>
              {xgraph && (
                <D3LineGraph
                  data={datax}
                  xlabel={xlabel}
                  ylabel={zlabel}
                  xunits={xunits}
                  yunits={zunits}
                  fontSize={fontSize}
                  xReverse={xReverse}
                  yReverse={false}
                  lcolor={lcolor}
                  lweight={[1]}
                  bcolor={["white"]}
                  scatter={false}
                  curve={true}
                  marginLeft={58}
                  marginTop={1}
                  marginRight={1}
                  xscale={TimeLabels.includes(xlabel) ? "Time" : ""}
                  yscale={TimeLabels.includes(zlabel) ? "Time" : ""}
                  simple={false}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default D3HeatMap;
