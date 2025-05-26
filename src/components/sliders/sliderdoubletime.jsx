import React, { Component } from "react";
import DateTimePicker from "react-datetime-picker";
import { format } from "date-fns";
import "./slider.css";
import SliderSelect from "../SliderSelect/SliderSelect";

class DateSliderDouble extends Component {
  state = {
    upper: this.props.upper,
    lower: this.props.lower,
  };
  formatDate = (raw) => {
    return new Date(raw * 1000);
  };

  formatTick = (ms) => {
    const { min, max } = this.props;
    const diff = max - min;
    if (diff < 172800) {
      // 3 Days
      return format(new Date(ms), "hh:mm:ss");
    } else if (diff < 31556952) {
      // 1 Year
      return format(new Date(ms), "dd MMM");
    } else if (diff < 157784760) {
      // 5 Years
      return format(new Date(ms), "MMM yy");
    } else {
      return format(new Date(ms), "yyyy");
    }
  };

  onChangeLower = (event) => {
    if (event instanceof Date) {
      this.setState({ lower: event.getTime() / 1000 });
    }
  };

  onChangeUpper = (event) => {
    if (event instanceof Date) {
      this.setState({ upper: event.getTime() / 1000 });
    }
  };

  updatePlot = () => {
    this.props.onChange([this.state.lower * 1000, this.state.upper * 1000]);
  };

  render() {
    var { min, max, files, language } = this.props;
    var { lower, upper } = this.state;
    const update = lower === this.props.lower && upper === this.props.upper;
    min = this.formatDate(min);
    max = this.formatDate(max);
    lower = this.formatDate(lower);
    upper = this.formatDate(upper);
    const availability = files.map((f) => [
      new Date(f.mindatetime),
      new Date(f.maxdatetime),
    ]);
    return (
      <div className="datetime-selector">
        <div className="datetime-picker">
          <div className="datetime-value" style={{ float: "left" }}>
            <DateTimePicker
              onChange={this.onChangeLower}
              value={lower}
              clearIcon={null}
              calendarIcon={null}
              maxDate={upper}
              minDate={min}
              disableClock={true}
              format={"dd.MM.y H:mm"}
              locale={language}
            />
          </div>
          <div className="datetime-value">{">"}</div>
          <div className="datetime-value" style={{ float: "right" }}>
            <DateTimePicker
              onChange={this.onChangeUpper}
              value={upper}
              clearIcon={null}
              calendarIcon={null}
              maxDate={max}
              minDate={lower}
              disableClock={true}
              format={"dd.MM.y H:mm"}
              locale={language}
            />
          </div>
        </div>
        <SliderSelect
          type="double"
          min={min}
          max={max}
          lower={lower}
          upper={upper}
          data={availability}
          onChangeLower={this.onChangeLower}
          onChangeUpper={this.onChangeUpper}
          language={language}
        />
        <button
          className={update ? "grey" : "update"}
          title="Update time period"
          onClick={this.updatePlot}
        >
          Update Plot
        </button>
      </div>
    );
  }
}

export default DateSliderDouble;
