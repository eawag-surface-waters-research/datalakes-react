import React, { Component } from "react";
import "./sidebarlayout.css";

class SidebarLayout extends Component {
  state = {
    open: window.innerWidth > 960,
    resize: true,
  };

  toggle = () => {
    this.setState({ resize: false }, () => {
      window.dispatchEvent(new Event("resize"));
      this.setState({ resize: true });
    });
    this.setState({ open: !this.state.open });
  };

  render() {
    const { open } = this.state;
    return (
      <div className="sidebarlayout">
        <div className={open ? "leftcontainer" : "leftcontainer full"}>
          {this.props.left}
        </div>
        <div className={open ? "rightcontainer" : "rightcontainer hide"}>
          <div
            className="righthead"
            title={open ? "Close sidebar" : "Open sidebar"}
            onClick={() => this.toggle()}
          >
            <div className="sidebartitle">{this.props.sidebartitle}</div>{" "}
            <span> > </span>
          </div>
          <div className="rightcontent">
            {"rightNoScroll" in this.props && this.props.rightNoScroll}
            {"right" in this.props && (
              <div className="scroll">{this.props.right}</div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default SidebarLayout;
