import React, { Component } from "react";
import slider from "interactive-slider";
import "./SliderSelect.css";

class SliderSelect extends Component {
  state = {
    graphid: Math.round(Math.random() * 100000),
  };

  updateDomain = (domain) => {
    this.domain = domain;
  };

  plotSliderSelect = async () => {
    var { graphid } = this.state;
    var { type, upper, lower, value, data: availability } = this.props;

    var options = {
      type,
      min: this.domain[0],
      max: this.domain[1],
      availability,
      onChange: this.onChange,
      onZoom: this.updateDomain,
    };

    if (type === "single") {
      options["value"] = value;
    } else {
      options["lower"] = lower;
      options["upper"] = upper;
    }
    slider("sliderselect" + graphid, options);
  };

  onChange = (value) => {
    var { onChangeLower, onChangeUpper, onChangeValue, type, upper, lower } =
      this.props;
    if (type === "single") {
      onChangeValue(value[0]);
    } else {
      if (lower !== value[0]) {
        onChangeLower(value[0]);
      } else if (upper !== value[1]) {
        onChangeUpper(value[1]);
      }
    }
  };

  componentDidMount() {
    this.domain = [this.props.min, this.props.max];
    setTimeout(this.plotSliderSelect, 10);
    window.addEventListener("resize", this.plotSliderSelect, false);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.plotSliderSelect, false);
  }

  componentDidUpdate(prevProps, prevState) {
    console.log();
    if (prevProps.min !== this.props.min && prevProps.min === 0)
      this.domain[0] = this.props.min;
    if (prevProps.max !== this.props.max && prevProps.max === 1)
      this.domain[1] = this.props.max;
    setTimeout(this.plotSliderSelect, 10);
  }
  render() {
    var { graphid } = this.state;
    return <div id={"sliderselect" + graphid} className="sliderselect" />;
  }
}

export default SliderSelect;
