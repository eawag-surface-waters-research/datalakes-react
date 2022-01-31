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

  onChange = (event) => {
    var lower = event[0];
    var upper = event[1];
    if (lower !== this.state.lower || upper !== this.state.upper) {
      this.props.onChange(event);
      this.setState({ upper, lower });
    }
  };

  render() {
    var { min, max, lower, upper, onChangeLower, onChangeUpper, files, language } =
      this.props;
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
        {onChangeLower && (
          <div className="datetime-picker">
            <div className="datetime-value" style={{ float: "left" }}>
              <DateTimePicker
                onChange={onChangeLower}
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
                onChange={onChangeUpper}
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
        )}
        <SliderSelect
          type="double"
          min={min}
          max={max}
          lower={lower}
          upper={upper}
          data={availability}
          onChangeLower={onChangeLower}
          onChangeUpper={onChangeUpper}
          language={language}
        />
      </div>
    );
  }
}

export default DateSliderDouble;
