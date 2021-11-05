import React, { Component } from "react";
import * as d3 from "d3";
import { scaleLinear } from "d3";
import "./slider.css";

class AvailbilityBarV extends Component {
  state = {
    plotted: false,
  };

  formatDate = (raw) => {
    return new Date(raw * 1000);
  };

  plotBar = () => {
    try {
      d3.select("#availabilitybarvsvg").remove();
    } catch (e) {}

    try {
      var height = d3.select("#availabilitybarv").node().getBoundingClientRect()
        .height;

      if (this.props.files.length > 0) {
        this.setState({ plotted: true });
        var { min, max, files } = this.props;

        var array = files.map((x) => ({
          min: x.mindepth,
          max: x.maxdepth,
        }));

        var svg = d3
          .select("#availabilitybarv")
          .append("svg")
          .attr("id", "availabilitybarvsvg")
          .attr("height", height)
          .attr("width", 6);
        var y = scaleLinear().domain([min, max]).range([0, height]);
        svg
          .selectAll("dot")
          .data(array)
          .enter()
          .append("rect")
          .attr("width", 6)
          .attr("height", function (d) {
            return Math.max(3, y(d.max) - y(d.min));
          })
          .attr("stroke", "#28b5f5")
          .attr("fill", "#28b5f5")
          .attr("y", function (d) {
            return y(d.min);
          })
          .attr("x", function (d) {
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
    return <div id="availabilitybarv" className="availabilitybarv"></div>;
  }
}

export default AvailbilityBarV;
