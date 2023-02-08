import React, { Component } from "react";
import * as d3 from "d3";
import "d3-contour";
import GraphHeader from "../graphheader/graphheader";
import "./heatmap.css";
import isEqual from "lodash/isEqual";
import D3LineGraph from "../linegraph/linegraph";
import heatmap from "canvas-heatmap";

class D3HeatMap extends Component {
  state = {
    graphid: Math.round(Math.random() * 100000),
    download: false,
    fullscreen: false,
    display: this.props.display ? this.props.display : "heatmap",
    zoom: false,
    fontSize: 12,
    xgraph: false,
    ygraph: false,
    mousex: false,
    mousey: false,
    idx: 0,
    ads: 500,
  };

  editFontSize = (fontSize) => {
    this.setState({ fontSize });
  };

  toggleXgraph = () => {
    this.setState({ xgraph: !this.state.xgraph }, () => {
      window.dispatchEvent(new Event("resize"));
    });
  };

  toggleYgraph = () => {
    this.setState({ ygraph: !this.state.ygraph }, () => {
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
      var name = title + ".csv";
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
    var name = title.split(" ").join("_") + ".json";
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

  hover = (obj) => {
    this.setState(obj);
  };

  plotHeatMap = () => {
    var { display, graphid, fontSize, ads } = this.state;
    if (this.props.data !== undefined) {
      try {
        var {
          data,
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

        var options = {
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
          language,
          backgroundColor: bcolor,
          autoDownsample: ads,
          fontSize,
          contour: display === "contour",
          hover: this.hover,
          setDownloadGraphDiv: "png" + graphid,
          levels,
        };
        heatmap("vis" + graphid, data, options);
      } catch (e) {
        console.log("Heatmap failed to plot", e);
      }
    }
  };

  componentDidMount() {
    if ("display" in this.props) {
      this.setState({ display: this.props.display });
    }
    this.plotHeatMap();
    window.addEventListener("resize", this.plotHeatMap);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.plotHeatMap);
  }

  componentDidUpdate(prevProps, prevState) {
    var { display, fontSize, fullscreen, xgraph, ygraph } = this.state;
    if (
      !isEqual(prevProps, this.props) ||
      display !== prevState.display ||
      fontSize !== prevState.fontSize ||
      fullscreen !== prevState.fullscreen ||
      xgraph !== prevState.xgraph ||
      ygraph !== prevState.ygraph
    )
      this.plotHeatMap();
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
    } = this.props;

    const TimeLabels = ["Time", "time", "datetime", "Datetime", "Date", "date"];

    var xy = " ";
    if (xgraph) xy = xy + "x";
    if (ygraph) xy = xy + "y";

    var dxy = [];
    var dxx = [];
    var dyy = [];
    var dyx = [];

    try {
      let linedata = data;
      if (Array.isArray(linedata)) linedata = linedata[idx];
      if (xgraph && mousey !== false && linedata) {
        dxx = linedata.x;
        dxy = linedata.z[mousey];
      }
      if (ygraph && mousex !== false && linedata) {
        dyx = linedata.z.map((z) => z[mousex]);
        dyy = linedata.y;
      }
    } catch (e) {
      console.log(e);
    }

    var datax = [{ x: dxx, y: dxy }];
    var datay = [{ x: dyx, y: dyy }];

    var x_dots = false;
    var y_dots = false;

    if (datax[0].x.length < 100) x_dots = true
    if (datay[0].y.length < 100) y_dots = true

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
                    lcolor={["black"]}
                    lweight={[1]}
                    bcolor={["white"]}
                    simple={true}
                    plotdots={y_dots}
                    xscale={TimeLabels.includes(zlabel) ? "Time" : ""}
                    yscale={TimeLabels.includes(ylabel) ? "Time" : ""}
                  />
                )}
              </div>
              <div className={"heatmap-right" + xy} id={"vis" + graphid} />
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
                  lcolor={["black"]}
                  lweight={[1]}
                  bcolor={["white"]}
                  plotdots={x_dots}
                  xscale={TimeLabels.includes(xlabel) ? "Time" : ""}
                  yscale={TimeLabels.includes(zlabel) ? "Time" : ""}
                  simple={true}
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
