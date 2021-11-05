import React, { Component } from "react";
import "./slider.css";
import SliderSelect from "../SliderSelect/SliderSelect";

class SliderSingle extends Component {
  formatDate = (raw) => {
    return new Date(raw * 1000);
  };

  render() {
    var { value, onChange, type, min, max, file, files, onChangeFileInt } =
      this.props;
    var valueStr;
    if (type === "time") {
      valueStr =
        new Date(value).toDateString() +
        " " +
        new Date(value).toLocaleTimeString();
      min = this.formatDate(min);
      max = this.formatDate(max);
    } else if (type === "depth") {
      valueStr = value.toString();
    }
    var currentfile = file[file.length - 1];
    const availability = files.map((f) => [
      new Date(f.mindatetime),
      new Date(f.maxdatetime),
    ]);
    return (
      <div
        className="datetime-selector"
        title="Hint: use arrow keys to move between timesteps"
      >
        <div>
          <div
            className="slider-arrow"
            onClick={() => onChangeFileInt(parseInt(currentfile) + 1)}
          >
            &#60;
          </div>
          <div className="single-value">{valueStr}</div>
          <div
            className="slider-arrow"
            onClick={() => onChangeFileInt(parseInt(currentfile) - 1)}
          >
            &#62;
          </div>
        </div>
        <SliderSelect
          type="single"
          min={min}
          max={max}
          value={value}
          data={availability}
          onChangeValue={onChange}
        />
      </div>
    );
  }
}

export default SliderSingle;
