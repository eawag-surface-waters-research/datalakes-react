import React, { Component } from "react";
import "./colorsolid.css";

class ColorSolid extends Component {
  updateColors = event => {
    var { onChange } = this.props;
    var colors = [
      { color: event.target.value, point: 0 },
      { color: event.target.value, point: 1 }
    ];
    onChange(colors);
  };

  render() {
    var { colors } = this.props;
    return (
      <div>
        <input
          type="color"
          value={colors[0].color}
          onChange={this.updateColors}
        ></input>
      </div>
    );
  }
}

export default ColorSolid;
