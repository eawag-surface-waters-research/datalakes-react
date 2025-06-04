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
      lowerX,
      upperX,
      files,
      onChangeX,
      dropdown,
      lang,
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
                display={"contour"}
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
        lcolor[0] = "#0E18EB";
        lcolor[1] = "#FF0000";
        lweight[0] = 2;
        lweight[1] = 2;
        var legend = [];
        if (plotdata.length > 1) {
          var yaxis_dict = {
            en: "name",
            de: "german",
            it: "italian",
            fr: "french",
          };
          var dp1 = this.props.datasetparameters.find(
            (d) => d.axis === this.props.yaxis[0]
          );
          var dp2 = this.props.datasetparameters.find(
            (d) => d.axis === this.props.yaxis[1]
          );
          legend = [
            {
              id: 0,
              color: lcolor[0],
              text:
                dropdown.parameters.find((f) => f.id === dp1.parameters_id)[
                  yaxis_dict[lang]
                ] + (dp1.detail === "none" ? "" : ` (${dp1.detail})`),
              value: "",
              xaxis: "x",
              yaxis: "y",
            },
            {
              id: 1,
              color: lcolor[1],
              text:
                dropdown.parameters.find((f) => f.id === dp2.parameters_id)[
                  yaxis_dict[lang]
                ] + (dp2.detail === "none" ? "" : ` (${dp2.detail})`),
              value: "",
              xaxis: "x",
              yaxis: "y",
            },
          ];
        }
        return (
          <div className="bafu" id="bafu">
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
                language={lang}
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

export default Bafu;
