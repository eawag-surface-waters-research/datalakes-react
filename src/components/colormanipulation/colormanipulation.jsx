import React, { Component } from "react";
import "./colormanipulation.css";
import ColorRamp from "../colorramp/colorramp";
import ColorTable from "../colortable/colortable";
import ColorSlider from "../colorslider/colorslider";
import ColorSolid from "../colorsolid/colorsolid";

class ColorManipulation extends Component {
  state = {
    manipulation: "ramp",
    colors: [
      { color: "#000080", point: 0 },
      { color: "#3366FF", point: 0.142857142857143 },
      { color: "#00B0DC", point: 0.285714285714286 },
      { color: "#009933", point: 0.428571428571429 },
      { color: "#FFFF5B", point: 0.571428571428571 },
      { color: "#E63300", point: 0.714285714285714 },
      { color: "#CC0000", point: 0.857142857142857 },
      { color: "#800000", point: 1 },
    ],
  };

  setManipulation = (manipulation) => {
    if (manipulation !== this.state.manipulation) {
      this.setState({ manipulation });
    }
  };

  render() {
    var { manipulation } = this.state;
    var { onChange, array, colors } = this.props;
    return (
      <div className="colormanipulation-outer">
        <div className="colormanipulation-headerbar">
          <div
            className={
              manipulation === "solid"
                ? "colormanipulation-header header-active"
                : "colormanipulation-header"
            }
            onClick={() => this.setManipulation("solid")}
          >
            Solid
          </div>
          <div
            className={
              manipulation === "ramp"
                ? "colormanipulation-header header-active"
                : "colormanipulation-header"
            }
            onClick={() => this.setManipulation("ramp")}
          >
            Ramp
          </div>
          <div
            className={
              manipulation === "table"
                ? "colormanipulation-header header-active"
                : "colormanipulation-header"
            }
            onClick={() => this.setManipulation("table")}
          >
            Table
          </div>
          {/*<div
            className={
              manipulation === "slider"
                ? "colormanipulation-header header-active"
                : "colormanipulation-header"
            }
            onClick={() => this.setManipulation("slider")}
          >
            Slider
          </div>*/}
        </div>
        {manipulation === "solid" && (
          <ColorSolid onChange={onChange} colors={colors} />
        )}
        {manipulation === "ramp" && (
          <ColorRamp onChange={onChange} colors={colors} />
        )}
        {manipulation === "table" && (
          <ColorTable
            onChange={onChange}
            colors={colors}
            array={array}
            autoOptimise={true}
          />
        )}
        {manipulation === "slider" && (
          <ColorSlider onChange={onChange} colors={colors} array={array} />
        )}
      </div>
    );
  }
}

export default ColorManipulation;
