import React, { Component } from "react";
import * as d3 from "d3";
import "./colorslider.css";

class ColorSlider extends Component {
  state = {
  };

  histogram = (array, bins) => {
    var min = Math.min(...array);
    var max = Math.max(...array);
    var bin_width = (max - min) / bins;
    var data = [];
    var x, index;
    for (var i = 0; i < bins; i++) {
      x = min + i * bin_width;
      data.push({ x: x, y: 0 });
    }
    for (i = 0; i < array.length; i++) {
      index = Math.max(Math.ceil((array[i] - min) / bin_width) - 1, 0);
      data[index].y++;
    }
    return { bin_width: bin_width, data: data };
  };

  plotHistogram = async () => {
    try {
      d3.select("#histogramsvg").remove();
    } catch (e) {}

    var { array, colors } = this.props;

    if (this.props.array.length > 0) {
      try {
        var bins = 500;

        var { bin_width, data } = this.histogram(array, bins);

        // Set graph size
        var histogramwidth = d3
            .select("#histogram")
            .node()
            .getBoundingClientRect().width,
          histogramheight = d3
            .select("#histogram")
            .node()
            .getBoundingClientRect().height,
          width = histogramwidth,
          height = histogramheight;

        var svg = d3
          .select("#histogram")
          .append("svg")
          .attr("id", "histogramsvg")
          .attr("width", width)
          .attr("height", height)
          .append("g");

        var x = d3
          .scaleLinear()
          .range([0, width])
          .domain([Math.min(...array), Math.max(...array)]);

        var y = d3.scaleLinear().range([height, 0]);
        y.domain([
          0,
          d3.max(data, function(d) {
            return d.y;
          })
        ]);

        

        svg
          .selectAll("rect")
          .data(data)
          .enter()
          .append("rect")
          .attr("x", function(d) {
            return x(d.x);
          })
          .attr("y", function(d) {
            return y(d.y);
          })
          .attr("width", x(bin_width))
          .attr("height", function(d) {
            return height - y(d.y);
          })
          .style("fill", "#fff");

        // Create gradients

        var defs = svg.append("defs");
        defs
          .append("linearGradient")
          .attr("id", "svgGradient")
          .attr("x1", "0%")
          .attr("y1", "0%")
          .attr("x2", "100%")
          .attr("y2", "0%")
          .selectAll("stop")
          .data(colors)
          .enter()
          .append("stop")
          .attr("offset", function(d) {
            return d.point;
          })
          .attr("stop-color", function(d) {
            return d.color;
          });

        svg
          .append("g")
          .append("rect")
          .attr("width", width)
          .attr("height", 20)
          .attr("x", 0)
          .attr("y", 0)
          .attr("fill", "url(#svgGradient)");

      } catch (e) {
        console.error("Error plotting histogram", e);
      }
    }
  };

  componentDidMount() {
    this.plotHistogram();
  }

  componentDidUpdate() {
    this.plotHistogram();
  }

  render() {
    return (
      <div>
        <div id="histogram" className="colorslider-histogram"></div>
      </div>
    );
  }
}

export default ColorSlider;
