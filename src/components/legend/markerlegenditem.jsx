import React, { Component } from "react";
import "./legend.css";

class MarkerLegendItem extends Component {
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
    var {
      min,
      max,
      unit,
      colors,
      markerFixedSize,
      markerSymbol,
    } = this.props;
    if (min === null || min === Infinity) min = 0;
    if (max === null || max === -Infinity) max = 0;
    var minSize = 10,
      maxSize = 40,
      inner = [],
      color,
      fontSize;

    var fixedColor = false;
    if (colors.length === 2 && colors[0].color === colors[1].color) {
      fixedColor = true;
    }

    if (markerFixedSize && fixedColor) {
      inner.push(
        <tr>
          <td className="markerdisplay-symbol">
            <div
              className={markerSymbol}
              style={{
                height: minSize,
                width: minSize,
                backgroundColor: colors[0].color,
                margin: "auto",
              }}
            ></div>
          </td>
          <td>Fixed size and color</td>
        </tr>
      );
    } else {
      if (colors.length < 7) {
        for (var i = colors.length - 1; i > -1; i--) {
          var value = (min + (max - min) * colors[i].point).toExponential(3);
          if (markerFixedSize) {
            fontSize = minSize;
          } else {
            fontSize = minSize + (maxSize - minSize) * (i / colors.length);
          }
          if (fixedColor) {
            color = colors[0].color;
          } else {
            // Check possibility of color bars
            if (i < colors.length - 1) {
              var color1 = colors[i].color;
              var color2 = colors[i + 1].color;
              if (color1 === color2) {
                value =
                  value +
                  " - " +
                  (min + (max - min) * colors[i + 1].point).toExponential(3);
                i++;
              }
            }
            color = colors[i].color;
          }
          // Check possibility of tiny change
          if (i === 0) {
            if (colors[1].point < 0.0001) {
              continue;
            }
          }
          if (i === colors.length - 1) {
            if (1 - colors[colors.length - 2].point < 0.0001) {
              continue;
            }
          }
          inner.push(
            <tr key={i}>
              <td className="markerdisplay-symbol">
                <div
                  className={markerSymbol}
                  style={{
                    height: fontSize,
                    width: fontSize,
                    backgroundColor: color,
                    margin: "auto",
                  }}
                ></div>
              </td>
              <td>{value}</td>
              <td>{i === 0 && unit}</td>
            </tr>
          );
        }
      } else {
        var selectStyle = {
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
            <td>{Math.round(1000 * max) / 1000}</td>
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
              {Math.round(1000 * ((max + min) / 2)) / 1000}
            </td>
          </tr>
        );
        inner.push(
          <tr key={2}>
            <td className="rasterdisplay-bar">&#9472;</td>
            <td>{Math.round(1000 * min) / 1000}</td>
          </tr>
        );
      }
    }
    return (
      <table className="markerdisplay-table">
        <tbody>{inner}</tbody>
      </table>
    );
  }
}

export default MarkerLegendItem;
