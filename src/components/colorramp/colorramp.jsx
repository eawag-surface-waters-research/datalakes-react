import React, { Component } from "react";
import "./colorramp.css";
import colorlist from "./colors";

class ColorRamp extends Component {
  state = {
    open: false,
    selected: 0,
    gradients: colorlist
  };
  toggle = () => {
    this.setState({ open: !this.state.open });
  };

  closeEvent = event => {
    var { open } = this.state;
    var targetClass = "noclassselected";
    try {
      targetClass = event.target.attributes.class.value;
    } catch (e) {}
    var classes = [
      "colorramp-select",
      "colorramp-dropdown",
      "colorramp-option"
    ];
    if (!classes.includes(targetClass) && open) {
      this.setState({ open: false });
    }
  };

  selectColorRamp = index => {
    this.setState({ selected: index, open: false });
    if ("onChange" in this.props) {
      var { gradients } = this.state;
      var { onChange } = this.props;
      var ramp = JSON.parse(JSON.stringify(gradients[index].data));
      onChange(ramp);
    }
  };

  linearGradient = colors => {
    if (colors) {
      var lineargradient = [];
      for (var i = 0; i < colors.length; i++) {
        lineargradient.push(`${colors[i].color} ${colors[i].point * 100}%`);
      }
      return `linear-gradient(90deg,${lineargradient.join(",")})`;
    }
  };

  componentDidMount() {
    window.addEventListener("click", this.closeEvent);
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.closeEvent);
  }

  render() {
    var { gradients, selected, open } = this.state;
    var selectStyle = {
      background: this.linearGradient(gradients[selected].data)
    };
    if ("colors" in this.props) {
      selectStyle = {
        background: this.linearGradient(this.props.colors)
      };
    }

    return (
      <div className="colorramp">
        <div
          className="colorramp-select"
          onClick={this.toggle}
          style={selectStyle}
        >
          <div className="colorramp-arrow">{open ? "<" : ">"}</div>
        </div>
        <div
          className={open ? "colorramp-dropdown" : "colorramp-dropdown hide"}
        >
          {gradients.map((gradient, index) => {
            var style = {
              background: this.linearGradient(gradient.data)
            };
            return (
              <div
                className="colorramp-option"
                key={gradient.name}
                style={style}
                onClick={() => this.selectColorRamp(index)}
              >
                {gradient.name}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default ColorRamp;
