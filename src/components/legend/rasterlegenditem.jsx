import React, { Component } from "react";
import "./legend.css";

class RasterLegendItem extends Component {
  linearGradient = (colors) => {
    if (colors) {
      var lineargradient = [];
      for (var i = 0; i < colors.length; i++) {
        lineargradient.push(`${colors[i].color} ${colors[i].point * 100}%`);
      }
      return `linear-gradient(0deg,${lineargradient.join(",")})`;
    }
  };
  render() {
    var { min, max, unit, colors } = this.props;
    if (min === null) min = 0;
    if (max === null) max = 0;
    min = parseFloat(min);
    max = parseFloat(max);
    var inner = [];
    var fixedColor = false;
    var selectStyle;
    if (colors.length === 2 && colors[0].color === colors[1].color) {
      fixedColor = true;
    }
    if (fixedColor) {
      selectStyle = {
        background: colors[0].color,
      };
      inner.push(
        <tr key={0}>
          <td className="rasterdisplay-colorbar" style={selectStyle}></td>
          <td>Fixed color</td>
        </tr>
      );
    } else {
      selectStyle = {
        background: this.linearGradient(colors),
        border: "1px solid black",
        borderTop: "22px solid white",
        borderBottom: "22px solid white",
      };
      inner.push(
        <tr key={0}>
          <td
            className="rasterdisplay-colorbar"
            style={selectStyle}
            rowSpan={6}
          ></td>
          <td className="rasterdisplay-bar">&#9472;</td>
          <td>{Math.round(10 * max) / 10}</td>
          <td>{unit}</td>
        </tr>
      );
      inner.push(
        <tr
          key={1}
          style={{
            height: "60px",
          }}
        >
          <td className="rasterdisplay-bar">&#9472;</td>
          <td className="rasterdisplay-innerlabel">
            {Math.round(10 * ((max + min) / 2)) / 10}
          </td>
        </tr>
      );
      inner.push(
        <tr key={2}>
          <td className="rasterdisplay-bar">&#9472;</td>
          <td>{Math.round(10 * min) / 10}</td>
        </tr>
      );
    }
    return (
      <table className="rasterdisplay-table">
        <tbody>{inner}</tbody>
      </table>
    );
  }
}

export default RasterLegendItem;
