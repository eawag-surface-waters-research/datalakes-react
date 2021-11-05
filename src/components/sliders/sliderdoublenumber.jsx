import React, { Component } from "react";
import SliderSelect from "../SliderSelect/SliderSelect";
import "./slider.css";

class NumberSliderDouble extends Component {
  state = {
    tupper: this.props.upper,
    tlower: this.props.lower,
  };
  onUpdate = (event) => {
    this.setState({ tlower: event[0], tupper: event[1] });
  };
  componentDidUpdate(prevProps) {
    if (this.props.upper !== prevProps.upper && !isNaN(this.props.upper)) {
      this.setState({ tupper: this.props.upper });
    }
    if (this.props.lower !== prevProps.lower && !isNaN(this.props.lower)) {
      this.setState({ tlower: this.props.lower });
    }
  }
  render() {
    var { tlower, tupper } = this.state;
    var {
      min,
      max,
      lower,
      upper,
      unit,
      onChangeLower,
      onChangeUpper,
    } = this.props;
    var availability = [[min, max]];
    return (
      <div className="datetime-selector">
        <div>
          {tlower.toFixed(2)}
          {unit} > {tupper.toFixed(2)}
          {unit}
        </div>
        <SliderSelect
          type="double"
          min={min}
          max={max}
          lower={lower}
          upper={upper}
          data={availability}
          onChangeLower={onChangeLower}
          onChangeUpper={onChangeUpper}
        />
      </div>
    );
  }
}

export default NumberSliderDouble;
