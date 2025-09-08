import React, { Component } from "react";
import "./loading.css";

class Loading extends Component {
  render() {
    return <div className={(this.props.size ? `box-loader box-loader-${this.props.size}` : "box-loader") + (this.props.inline ? " box-loader-inline" : "")}></div>;
  }
}

export default Loading;
