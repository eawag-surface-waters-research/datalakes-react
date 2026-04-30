import React, { Component } from "react";
import Loading from "../../../components/loading/loading";
import D3HeatMap from "../../../graphs/d3/heatmap/heatmap";
import D3LineGraph from "../../../graphs/d3/linegraph/linegraph";
import SliderDouble from "../../../components/sliders/sliderdouble";
import "../css/bafu.css";

class Minimal extends Component {
  onChangeLowerX = (event) => {
    this.props.onChangeX([event.getTime(), this.props.upperX * 1000]);
  };
  onChangeUpperX = (event) => {
    this.props.onChangeX([this.props.lowerX * 1000, event.getTime()]);
  };
  render() {
    var {
      graph,
      plotdata,
      title,
      xlabel,
      ylabel,
      zlabel,
      xunits,
      yunits,
      zunits,
      bcolor,
      colors,
      thresholdStep,
      display,
      lowerX,
      upperX,
      minX,
      maxX,
      confidence,
      lcolor,
      lweight,
      timeaxis,
      xReverse,
      yReverse,
      y2Reverse,
      x2Reverse,
      file,
      files,
      xaxis,
      yaxis,
      xScale,
      yScale,
      datasetparameters,
      lang,
      onChangeX,
      dropdown,
    } = this.props;
    thresholdStep = 50;

    var lang_map = { en: "name", de: "german", fr: "french", it: "italian" };

    if (ylabel !== "") {
      var ylabel_info = dropdown.parameters.find((f) => f.name === ylabel);
      if (ylabel_info[lang_map[lang]] !== null)
        ylabel = ylabel_info[lang_map[lang]];
    }

    if (zlabel !== "") {
      var zlabel_info = dropdown.parameters.find((f) => f.name === zlabel);
      if (zlabel_info[lang_map[lang]] !== null)
        zlabel = zlabel_info[lang_map[lang]];
    }

    switch (graph) {
      default:
        return (
          <React.Fragment>
            <table className="loading-table">
              <tbody>
                <tr>
                  <td>
                    <Loading />
                    Loading Data
                  </td>
                </tr>
              </tbody>
            </table>
          </React.Fragment>
        );
      case "heatmap":
        return (
          <div className="bafu">
            <div className="graph">
              <D3HeatMap
                data={plotdata}
                title={title}
                xlabel={xlabel}
                ylabel={ylabel}
                zlabel={zlabel}
                xunits={xunits}
                yunits={yunits}
                zunits={zunits}
                bcolor={bcolor}
                colors={colors}
                thresholdStep={thresholdStep}
                yReverse={yReverse}
                xReverse={xReverse}
                display={display}
                header={false}
                language={lang}
                levels={true}
              />
            </div>
            <div className="selector">
              <SliderDouble
                onChange={onChangeX}
                onChangeLower={this.onChangeLowerX}
                onChangeUpper={this.onChangeUpperX}
                min={minX}
                max={maxX}
                lower={lowerX}
                upper={upperX}
                files={files}
                language={lang}
              />
            </div>
          </div>
        );
      case "linegraph":
        if (timeaxis === "x") xScale = "Time";
        if (timeaxis === "y") yScale = "Time";
        var x2label = "";
        var x2units = "";
        var y2label = "";
        var y2units = "";

        var legend = [];
        if (xaxis.length > 1 && file.length < 2) {
          xlabel = "";
          for (let i = 0; i < xaxis.length; i++) {
            let dp = datasetparameters.find((d) => d.axis === xaxis[i]);
            let axis = "x";
            if (i > 0 && legend[0].unit !== dp.unit) {
              axis = "x2";
              xlabel = this.props.xlabel;
              x2label = dp.name;
              x2units = dp.unit;
            }
            legend.push({
              id: i,
              color: lcolor[i],
              text: dp.name + (dp.detail === "none" ? "" : ` (${dp.detail})`),
              unit: dp.unit,
              xaxis: axis,
              yaxis: "y",
            });
          }
          if (legend.filter((l) => l.xaxis === "x").length > 1) xlabel = "";
          if (legend.filter((l) => l.xaxis === "x").length > 1) x2label = "";
        } else if (yaxis.length > 1 && file.length < 2) {
          for (let i = 0; i < yaxis.length; i++) {
            let dp = datasetparameters.find((d) => d.axis === yaxis[i]);
            let axis = "y";
            if (i > 0 && legend[0].unit !== dp.unit) {
              axis = "y2";
              y2label = dp.name;
              y2units = dp.unit;
            }
            legend.push({
              id: i,
              color: lcolor[i],
              text: dp.name + (dp.detail === "none" ? "" : ` (${dp.detail})`),
              name: dp.name,
              unit: dp.unit,
              yaxis: axis,
              xaxis: "x",
            });
          }
          var yNames = new Set(
            legend.filter((l) => l.yaxis === "y").map((l) => l.name)
          );
          if (yNames.size > 1) ylabel = "";
          var y2Names = new Set(
            legend.filter((l) => l.yaxis === "y2").map((l) => l.name)
          );
          if (y2Names.size > 1) y2label = "";
        } else {
          for (let i = 0; i < file.length; i++) {
            var value = new Date(files[file[i]].ave);
            var text = value.toDateString() + " " + value.toLocaleTimeString();
            var color = lcolor[i];
            legend.push({ id: i, color, text, value, yaxis: "y", xaxis: "x" });
          }
        }
        return (
          <div className="bafu" id="bafu">
            <div className="graph">
              <D3LineGraph
                data={plotdata}
                legend={legend}
                confidence={confidence}
                title={title}
                xlabel={xlabel}
                ylabel={ylabel}
                xunits={xunits}
                yunits={yunits}
                x2label={x2label}
                y2label={y2label}
                x2units={x2units}
                y2units={y2units}
                lcolor={lcolor}
                lweight={lweight}
                bcolor={bcolor}
                xscale={xScale}
                yscale={yScale}
                yReverse={yReverse}
                xReverse={xReverse}
                y2Reverse={y2Reverse}
                x2Reverse={x2Reverse}
                header={false}
                fontSize={14}
                border={true}
              />
            </div>
            <div className="selector">
              <SliderDouble
                onChange={onChangeX}
                onChangeLower={this.onChangeLowerX}
                onChangeUpper={this.onChangeUpperX}
                min={minX}
                max={maxX}
                lower={lowerX}
                upper={upperX}
                files={files}
                language={lang}
              />
            </div>
          </div>
        );
    }
  }
}

export default Minimal;
