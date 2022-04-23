import React, { Component } from "react";
import "./filterbox.css";

class FilterBox extends Component {
  state = {
    open: false,
  };
  toggle = () => {
    this.setState({ open: !this.state.open }, () => {
      if (this.state.open) {
        window.dispatchEvent(new Event("resize"));
      }
    });
  };

  componentDidMount() {
    if (this.props.preopen === "true" || this.props.preopen === true) {
      this.toggle();
    }
  }
  componentDidUpdate(prevProps) {
    if (prevProps.preopen !== this.props.preopen) {
      this.toggle();
    }
  }

  render() {
    const { content, title, inner, newFeature } = this.props;
    const { open } = this.state;

    return (
      <div className={inner ? "filterbox inner" : "filterbox"}>
        <div className="toprow" onClick={this.toggle} title={open ? "Click to hide" : "Click to open"}>
          <div className="title">
            {title} {newFeature === "true" && <div className="new">NEW!</div>}
          </div>
          <span className="symbol">{open ? "-" : "+"}</span>
        </div>
        <div className={open ? "content" : "content hide"}>{content}</div>
      </div>
    );
  }
}

export default FilterBox;
