import React, { Component } from "react";
import * as d3 from "d3";
import "./depthselector.css";

class DepthSelector extends Component {
  plotLineGraph = async () => {
    try {
      d3.select("#depthselectorsvg").remove();
      d3.select("#tooltipdepth").remove();
    } catch (e) {}
    var {
      selectedlayers,
      depth,
      mindepth,
      maxdepth,
      onChangeDepth,
    } = this.props;
    if (selectedlayers.length > 0 && !isNaN(mindepth) && !isNaN(maxdepth)) {
      try {
        // Set graph size
        var margin = { top: 10, right: 40, bottom: 10, left: 40 },
          visheight = d3.select("#depthselector").node().getBoundingClientRect()
            .height,
          viswidth = margin.left + margin.right + selectedlayers.length * 5,
          width = viswidth - margin.left - margin.right,
          height = visheight - margin.top - margin.bottom;

        // Format Y-axis
        var y = d3
          .scaleLinear()
          .range([0, height])
          .domain([mindepth, maxdepth]);
        var yy = d3
          .scaleLinear()
          .range([0, height])
          .domain([mindepth, maxdepth]);

        // Define the axes
        var yAxis = d3.axisLeft(y).ticks(5);

        var zoom = d3
          .zoom()
          .scaleExtent([1, 100000000])
          .extent([
            [0, 0],
            [width, height],
          ])
          .on("zoom", zoomed);

        function zoomed(event) {
          y.domain(event.transform.rescaleY(yy).domain());
          plotdata();
          current.attr("cy", y(depth));
          gY.call(yAxis);
        }

        // Adds the svg canvas
        var svg = d3
          .select("#depthselector")
          .append("svg")
          .attr("id", "depthselectorsvg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")"
          )
          .call(zoom);

        // Add the Y Axis
        var gY = svg
          .append("g")
          .attr("class", "yaxis")
          .attr("id", "axis--y")
          .call(yAxis);

        // Add the availability data
        var bars = svg
          .append("g")
          .attr("class", "bars")
          .attr("id", "verticalbars");

        function plotdata() {
          d3.select("#verticalbars").selectAll("*").remove();
          var array;
          for (let i = 0; i < selectedlayers.length; i++) {
            array = selectedlayers[i].files.map((x) => ({
              min: x.mindepth,
              max: x.maxdepth,
            }));
            bars
              .selectAll("dot")
              .data(array)
              .enter()
              .append("rect")
              .attr("width", 4)
              .attr("height", function (d) {
                return Math.max(1, y(d.max) - y(d.min));
              })
              .attr("stroke", selectedlayers[i].color)
              .attr("fill", selectedlayers[i].color)
              .attr("y", function (d) {
                return y(d.min);
              })
              .attr("x", function (d) {
                return i * 5 + 2;
              });
          }
        }

        plotdata();

        // Add Focus
        var focus = svg
          .append("g")
          .append("circle")
          .style("fill", "#F83F3F")
          .attr("stroke", "#F83F3F")
          .attr("r", 5)
          .attr("cx", 0)
          .style("opacity", 0);

        // Add the current value
        var current = svg
          .append("g")
          .append("circle")
          .style("fill", "red")
          .attr("stroke", "red")
          .attr("r", 6)
          .attr("cx", 0)
          .attr("cy", y(depth));

        // Add tooltip
        var tooltip = d3
          .select("#depthselector")
          .append("div")
          .attr("id", "tooltipdepth")
          .attr("class", "tooltipdepth");

        svg
          .append("rect")
          .style("fill", "none")
          .style("pointer-events", "all")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height)
          .attr("transform", "translate(-" + margin.left + "," + 0 + ")")
          .on("mouseover", mouseover)
          .on("mousemove", mousemove)
          .on("mouseout", mouseout)
          .on("click", onClick);

        function onClick(event) {
          var depth = y.invert(d3.pointer(event)[1]);
          depth = Math.round(depth * 100) / 100;
          current.attr("cy", d3.pointer(event)[1]);
          onChangeDepth(depth);
        }

        function mouseover() {
          focus.style("opacity", 1);
          tooltip.style("visibility", "visible");
        }

        function mouseout() {
          focus.style("opacity", 0);
          tooltip.style("visibility", "hidden");
        }

        function mousemove(event) {
          try {
            focus.attr("cy", d3.pointer(event)[1]);
          } catch (e) {}
          try {
            tooltip
              .style("top", d3.pointer(event)[1] - 30 + "px")
              .html(tooltiptext(y.invert(d3.pointer(event)[1])))
              .style("left", "75px");
          } catch (e) {}
        }

        function dataAvailable(files, depth) {
          var color = "red";
          for (var i = 0; i < files.length; i++) {
            if (depth >= files[i].mindepth && depth <= files[i].maxdepth)
              color = "green";
          }
          return color;
        }

        function tooltiptext(depth) {
          var depthstring = `<div class="tooltip-title">${
            Math.round(depth * 100) / 100
          }m below surface</div>`;
          var layerstring = "<table><tbody>";
          for (var i = 0; i < selectedlayers.length; i++) {
            layerstring =
              layerstring +
              `<tr><td>${selectedlayers[i].title} <div style="color:${selectedlayers[i].color};display:inline-block">${selectedlayers[i].name}</div></td>` +
              `<td style="color:${dataAvailable(
                selectedlayers[i].files,
                depth
              )}">&#9673;</td></tr>`;
          }
          layerstring = layerstring + "</tbody></table>";
          return depthstring + layerstring;
        }
      } catch (e) {
        console.error("Error plotting time selector", e);
      }
    }
  };
  componentDidMount() {
    this.plotLineGraph();
    window.addEventListener("resize", this.plotLineGraph, false);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.plotLineGraph, false);
  }

  componentDidUpdate(prevProps, prevState) {
    this.plotLineGraph();
  }
  render() {
    return (
      <div className="depthselector">
        <div id="depthselector"></div>
      </div>
    );
  }
}

export default DepthSelector;
