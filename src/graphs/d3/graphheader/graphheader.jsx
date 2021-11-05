import React, { Component } from "react";
import downloadIcon from "./img/download.svg";
import heatIcon from "./img/heat.svg";
import contourIcon from "./img/contour.svg";
import helpIcon from "./img/info.svg";
import shrinkIcon from "./img/shrink.svg";
import fullscreenIcon from "./img/fullscreen.svg";
import fontsizeIcon from "./img/fontsize.svg";
import xgraphIcon from "./img/xgraph.svg";
import ygraphIcon from "./img/ygraph.svg";
import "./graphheader.css";

class GraphHeader extends Component {
  componentDidMount() {
    window.addEventListener("keydown", this.exitFullscreen, false);
    window.addEventListener("click", this.closeDownload, false);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.exitFullscreen, false);
    window.removeEventListener("click", this.closeDownload, false);
  }

  closeDownload = (e) => {
    var { id, download } = this.props;
    if (
      download &&
      !document.getElementById("graphdownload" + id).contains(e.target)
    ) {
      this.props.toggleDownload();
    }
  };

  exitFullscreen = (e) => {
    var { fullscreen, toggleFullscreen } = this.props;
    if (e.key === "Escape" && fullscreen) {
      toggleFullscreen();
    }
  };

  render() {
    var {
      id,
      title,
      download,
      fullscreen,
      display,
      fontSize,
      editFontSize,
      toggleXgraph,
      toggleYgraph,
      toggleDownload,
      toggleFullscreen,
      toggleDisplay,
      downloadJSON,
      downloadCSV,
    } = this.props;
    var fulllabel = "Fullscreen";
    var fullicon = fullscreenIcon;
    if (fullscreen) {
      fulllabel = "Shrink Map";
      fullicon = shrinkIcon;
    }
    var displaylabel = "View as heat map";
    var displayicon = heatIcon;
    if (display === "heatmap") {
      displaylabel = "View as contour map";
      displayicon = contourIcon;
    }
    return (
      <React.Fragment>
        <div className="vis-header">
          <table className="downloadtable">
            <tbody>
              <tr>
                <td className="title">{title}</td>
                {toggleYgraph && (
                  <td style={{ width: "25px" }}>
                    <img
                      src={ygraphIcon}
                      alt="ygraph"
                      onClick={toggleYgraph}
                      title="Toggle y Graph"
                    />
                  </td>
                )}
                {toggleXgraph && (
                  <td style={{ width: "25px" }}>
                    <img
                      src={xgraphIcon}
                      alt="xgraph"
                      onClick={toggleXgraph}
                      title="Toggle X Graph"
                    />
                  </td>
                )}
                {display && (
                  <td style={{ width: "25px" }}>
                    <img
                      src={displayicon}
                      alt="heatmap"
                      onClick={toggleDisplay}
                      title={displaylabel}
                    />
                  </td>
                )}
                <td id={"graphdownload" + id} style={{ width: "25px" }}>
                  <img
                    src={downloadIcon}
                    alt="download"
                    onClick={toggleDownload}
                    title="Download"
                  />
                  <div
                    className={download ? "downloadbar" : "downloadbar hide"}
                  >
                    <div>Download Graph</div>
                    <button id={"png" + id} title="Download PNG">
                      PNG
                    </button>
                    <button
                      className="blue"
                      onClick={downloadJSON}
                      title="Download as JSON"
                    >
                      JSON
                    </button>
                    <button
                      className="red"
                      onClick={downloadCSV}
                      title="Download as CSV"
                    >
                      CSV
                    </button>
                  </div>
                </td>
                {fontSize && (
                  <td className="fontsize" style={{ width: "25px" }}>
                    <img
                      src={fontsizeIcon}
                      alt="Font Size"
                      onClick={toggleDisplay}
                      title="Edit font size"
                    />
                    <div className="fontsize-dropdown">
                      {[8, 10, 12, 14, 16, 18, 20, 22, 24].map((item) => (
                        <div
                          key={"fontsize" + item}
                          className={fontSize === item ? "sel" : ""}
                          onClick={() => editFontSize(item)}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </td>
                )}
                <td style={{ width: "25px" }}>
                  <img
                    src={fullicon}
                    alt="Toggle fullscreen"
                    onClick={toggleFullscreen}
                    title={fulllabel}
                  />
                </td>
                <td style={{ width: "25px" }}>
                  <div title="Help" className="graphhelpbar">
                    <img
                      src={helpIcon}
                      alt="help icon"
                      title={"How to use this graph"}
                    />
                    <div className="graphhelp">
                      <table>
                        <tbody>
                          <tr>
                            <th>Zoom X & Y</th>
                            <td>Scroll with mouse over plot area</td>
                          </tr>
                          <tr>
                            <th>Zoom X axis</th>
                            <td>Scroll with mouse over X axis</td>
                          </tr>
                          <tr>
                            <th>Zoom Y axis</th>
                            <td>Scroll with mouse over Y axis</td>
                          </tr>
                          <tr>
                            <th>Reset</th>
                            <td>Double click on plot area</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </React.Fragment>
    );
  }
}

export default GraphHeader;
