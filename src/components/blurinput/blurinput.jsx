import React, { Component } from "react";

class BlurInput extends Component {
  state = { value: 0 };

  onChange = (e) => {
    var value = e.target.value;
    this.setState({ value });
  };
  onKeyUp = (e) => {
    if (e.keyCode === 13) {
      var { onBlur } = this.props;
      var value = [document.getElementById("input").value];
      onBlur(value);
    }
  };
  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.setState({ value: this.props.value });
    }
  }
  render() {
    var { type, onBlur } = this.props;
    var { value } = this.state;
    return (
      <input
        id="input"
        value={value}
        type={type}
        onChange={this.onChange}
        onBlur={onBlur}
        onKeyUp={this.onKeyUp}
        min={0}
      />
    );
  }
}

export default BlurInput;
