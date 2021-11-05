import React, { Component } from "react";
import * as d3 from "d3";
import { scaleTime } from "d3";
import "./slider.css";

class AvailbilityBar extends Component {
  state = {
    plotted: false,
  };

  formatDate = (raw) => {
    return new Date(raw * 1000);
  };

  plotBar = () => {
    try {
      d3.select("#availabilitybarsvg").remove();
    } catch (e) {}

    try {
      var width = d3.select("#availabilitybar").node().getBoundingClientRect()
        .width;

      if (width > 0 && this.props.files.length > 0) {
        this.setState({ plotted: true });
        var { min, max, files } = this.props;
        var array = files.map((x) => ({
          min: new Date(x.mindatetime),
          max: new Date(x.maxdatetime),
        }));

        var svg = d3
          .select("#availabilitybar")
          .append("svg")
          .attr("id", "availabilitybarsvg")
          .attr("height", 6)
          .attr("width", width);
        var x = scaleTime().domain([min, max]).range([0, width]);
        svg
          .selectAll("dot")
          .data(array)
          .enter()
          .append("rect")
          .attr("height", 6)
          .attr("width", function (d) {
            return Math.max(1, x(d.max) - x(d.min));
          })
          .attr("stroke", "#28b5f5")
          .attr("fill", "#28b5f5")
          .attr("x", function (d) {
            return x(d.min);
          })
          .attr("y", function (d) {
            return 0;
          });
      }
    } catch (e) {
      console.error("Failed to plot availability bar");
    }
  };

  debounce = (func, time) => {
    time = time || 100;
    var timer;
    return function (event) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(func, time, event);
    };
  };

  componentDidMount() {
    this.plotBar();
    window.addEventListener("resize", this.debounce(this.plotBar, 300));
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.debounce(this.plotBar, 300));
  }

  componentDidUpdate(prevProps) {
    var { plotted } = this.state;
    if (!plotted || this.props.files.length !== prevProps.files.length) {
      this.plotBar();
    }
  }

  render() {
    return <div id="availabilitybar" className="availabilitybar"></div>;
  }
}

export default AvailbilityBar;
