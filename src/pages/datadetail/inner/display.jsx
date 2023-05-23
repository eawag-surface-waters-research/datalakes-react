import React, { Component } from "react";
import Loading from "../../../components/loading/loading";
import D3HeatMap from "../../../graphs/d3/heatmap/heatmap";
import D3LineGraph from "../../../graphs/d3/linegraph/linegraph";
import "../css/display.css";

class Display extends Component {
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
      confidence,
      lcolor,
      lweight,
      xReverse,
      yReverse,
      yScale,
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

    var value = "";
    var time = "";

    if (plotdata.length > 0) {
      try {
        value = plotdata[0].y[plotdata[0].y.length - 1];
        let y = plotdata[0].x[plotdata[0].x.length - 1];
        var now = new Date();
        let diff = now - y;
        if (diff < 1000 * 3600) {
          time = `${Math.round(diff / (1000 * 60))} minutes`;
        } else if (diff < 1000 * 3600 * 24) {
          time = `${Math.round(diff / (100 * 3600)) / 10} hours`;
        } else {
          time = `${Math.round(diff / (100 * 3600 * 24)) / 10} days`;
        }
      } catch (e) {
        console.error(e);
      }
    }

    var head = (
      <div className="header">
        <div className="inner-header">
          <div className="value">{value}°C</div>
          <div className="time">Last reading: {time} ago</div>
          <div className="title">{title}</div>
          <a href={window.location.href.split("?")[0]} ><button>More info</button></a>
        </div>

        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            className="waves"
            preserveAspectRatio="none"
            viewBox="0 24 150 28"
          >
            <defs>
              <path
                id="gentle-wave"
                d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18v44h-352z"
              ></path>
            </defs>
            <g className="parallax">
              <use
                x="48"
                fill="rgba(255,255,255,0.7"
                xlinkHref="#gentle-wave"
              ></use>
              <use
                x="48"
                y="3"
                fill="rgba(255,255,255,0.5)"
                xlinkHref="#gentle-wave"
              ></use>
              <use
                x="48"
                y="5"
                fill="rgba(255,255,255,0.3)"
                xlinkHref="#gentle-wave"
              ></use>
              <use x="48" y="7" fill="#fff" xlinkHref="#gentle-wave"></use>
            </g>
          </svg>
        </div>
      </div>
    );

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
          <div className="display">
            {head}
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
          </div>
        );
      case "linegraph":
        lcolor[0] = "#673AB7";
        lcolor[1] = "#FF0000";
        lweight[0] = 2;
        lweight[1] = 2;
        var legend = [];
        return (
          <div className="display" id="display">
            {head}
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
                plotdots={false}
                setDownloadGraph={this.setDownloadGraph}
                header={false}
                fontSize={14}
                language={lang}
                border={true}
              />
            </div>
          </div>
        );
    }
  }
}

export default Display;
