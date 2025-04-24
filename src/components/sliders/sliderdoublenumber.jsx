import React, { Component } from "react";
import SliderSelect from "../SliderSelect/SliderSelect";
import "./slider.css";

class NumberSliderDouble extends Component {
  state = {
    _min: this.props.lower,
    _max: this.props.upper,
  };

  updateMin = () => {
    var { _min } = this.state;
    var { onChangeLower, min, lower } = this.props;
    if (Number.isNaN(_min)) {
      onChangeLower(min);
    } else if (_min !== lower) {
      onChangeLower(_min);
    }
  };

  enterMin = (event) => {
    if (event.key === "Enter") {
      this.updateMin();
    }
  };

  updateMax = () => {
    var { _max } = this.state;
    var { onChangeUpper, max, upper } = this.props;
    if (Number.isNaN(_max)) {
      onChangeUpper(max);
    } else if (_max !== upper) {
      onChangeUpper(_max);
    }
  };

  enterMax = (event) => {
    if (event.key === "Enter") {
      this.updateMax();
    }
  };

  setMin = (event) => {
    this.setState({ _min: parseFloat(event.target.value) });
  };

  setMax = (event) => {
    this.setState({ _max: parseFloat(event.target.value) });
  };

  onUpdate = (event) => {
    this.setState({ _min: event[0], _max: event[1] });
  };
  componentDidUpdate(prevProps) {
    if (this.props.upper !== prevProps.upper && !isNaN(this.props.upper)) {
      this.setState({ _max: this.props.upper });
    }
    if (this.props.lower !== prevProps.lower && !isNaN(this.props.lower)) {
      this.setState({ _min: this.props.lower });
    }
  }
  render() {
    var { _min, _max } = this.state;
    var { min, max, lower, upper, unit, onChangeLower, onChangeUpper } =
      this.props;
    var availability = [[min, max]];
    return (
      <div className="datetime-selector">
        <div>
          <input
            type="number"
            value={_min}
            step="0.1"
            onChange={this.setMin}
            onBlur={this.updateMin}
            onKeyDown={this.enterMin}
            className="input-number"
          />
          {unit} >{" "}
          <input
            type="number"
            value={_max}
            step="0.1"
            onChange={this.setMax}
            onBlur={this.updateMax}
            onKeyDown={this.enterMax}
            className="input-number"
          />
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
