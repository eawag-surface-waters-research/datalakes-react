import React, { Component } from "react";
import Loading from "../../../components/loading/loading";
import D3HeatMap from "../../../graphs/d3/heatmap/heatmap";
import D3LineGraph from "../../../graphs/d3/linegraph/linegraph";
import SliderDouble from "../../../components/sliders/sliderdouble";
import "../css/bafu.css";

class Bafu extends Component {
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
      plotdots,
      thresholdStep,
      confidence,
      lcolor,
      lweight,
      xReverse,
      yReverse,
      yScale,
      minX,
      maxX,
      minZ,
      maxZ,
      lowerX,
      upperX,
      file,
      files,
      onChangeX,
      dropdown,
    } = this.props;
    // Overwrite defaults
    /*colors = [
      { color: "#0069a6", point: 0.0 },
      { color: "#0069a6", point: 0.167 },

      { color: "#00a2e8", point: 0.167 },
      { color: "#00a2e8", point: 0.333 },

      { color: "#98d4e1", point: 0.333 },
      { color: "#98d4e1", point: 0.5 },

      { color: "#ecad87", point: 0.5 },
      { color: "#ecad87", point: 0.667 },

      { color: "#dd6355", point: 0.667 },
      { color: "#dd6355", point: 0.833 },

      { color: "#9d3543", point: 0.833 },
      { color: "#9d3543", point: 1 },
    ];*/
    minZ = 0;
    maxZ = 30;
    thresholdStep = 50;
    var language = "de";

    if (ylabel !== "") {
      var ylabel_info = dropdown.parameters.find((f) => f.name === ylabel);
      if (ylabel_info.german) ylabel = ylabel_info.german;
    }
    if (zlabel !== "")
      zlabel = dropdown.parameters.find((f) => f.name === zlabel).german;

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
                minvalue={minZ}
                maxvalue={maxZ}
                yReverse={yReverse}
                xReverse={xReverse}
                display={"contour"}
                header={false}
                language={language}
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
                language={language}
              />
            </div>
          </div>
        );
      case "linegraph":
        var legend = [];
        for (var i = 0; i < file.length; i++) {
          var value = new Date(files[file[i]].ave);
          var text = value.toDateString() + " " + value.toLocaleTimeString();
          var color = lcolor[i];
          legend.push({ id: i, color, text, value });
        }
        lcolor[0] = "#FF0000";
        lcolor[1] = "#FF0000";
        lweight[0] = 2;
        return (
          <div className="bafu">
            <div className="graph">
              <D3LineGraph
                data={plotdata}
                confidence={confidence}
                title={title}
                legend={legend}
                xlabel={xlabel}
                ylabel={ylabel}
                xunits={xunits}
                yunits={yunits}
                lcolor={lcolor}
                lweight={lweight}
                bcolor={bcolor}
                xscale={"Time"}
                yscale={yScale}
                yReverse={yReverse}
                xReverse={xReverse}
                plotdots={plotdots}
                setDownloadGraph={this.setDownloadGraph}
                box={true}
                grid={true}
                header={false}
                fontSize={14}
                language={language}
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
                language={language}
              />
            </div>
          </div>
        );
    }
  }
}

export default Bafu;
