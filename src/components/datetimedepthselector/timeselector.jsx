import React, { Component } from "react";
import isEqual from "lodash/isEqual";
import * as d3 from "d3";
import "./timeselector.css";

class TimeSelector extends Component {
  state = {
    domain: false,
    instructions: true,
  };
  updateDomain = (domain) => {
    this.domain = domain;
  };
  close = () => {
    this.setState({ instructions: false });
  };
  plotLineGraph = async () => {
    try {
      d3.select("#timeselectorsvg").remove();
      d3.select("#tooltip").remove();
    } catch (e) {}
    var {
      selectedlayers,
      datetime,
      mindatetime,
      maxdatetime,
      onChangeDatetime,
    } = this.props;
    var { instructions } = this.state;
    var close = this.close;
    if (selectedlayers.length && mindatetime && maxdatetime) {
      try {
        // Set graph size
        var margin = { top: 0, right: 10, bottom: 20, left: 0 },
          viswidth = d3
            .select("#timeselector")
            .node()
            .getBoundingClientRect().width,
          visheight = margin.bottom + selectedlayers.length * 5,
          width = viswidth - margin.left - margin.right,
          height = visheight - margin.top - margin.bottom;

        // Format X-axis
        var x = d3
          .scaleTime()
          .range([0, width])
          .domain([mindatetime, maxdatetime]);
        var xx = d3
          .scaleTime()
          .range([0, width])
          .domain([mindatetime, maxdatetime]);

        // Define the axes
        var xAxis = d3.axisBottom(x).ticks(5);

        var updateDomain = this.updateDomain;
        var zoom = d3
          .zoom()
          .extent([
            [0, 0],
            [width, height],
          ])
          .on("zoom", zoomed)
          .on("end", zoomEnd);

        function zoomEnd(event) {
          if (event) {
            updateDomain(event.transform.rescaleX(xx).domain());
            if (instructions) close();
          }
        }

        function zoomed(event) {
          plotdata();
          if (event) {
            let d = event.transform.rescaleX(xx).domain();
            x.domain(d);
            current.attr("cx", x(datetime));
          }
          gX.call(xAxis);
        }

        // Adds the svg canvas
        var svg = d3
          .select("#timeselector")
          .append("svg")
          .attr("id", "timeselectorsvg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")"
          )
          .call(zoom);

        // Add the X Axis
        var gX = svg
          .append("g")
          .attr("class", "xaxis")
          .attr("id", "axis--x")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

        // Add the availability data
        var bars = svg.append("g").attr("class", "bars").attr("id", "bars");
        function plotdata() {
          d3.select("#bars").selectAll("*").remove();
          var array;
          for (let i = 0; i < selectedlayers.length; i++) {
            array = selectedlayers[i].files.map((x) => ({
              min: new Date(x.mindatetime),
              max: new Date(x.maxdatetime),
            }));
            bars
              .selectAll("dot")
              .data(array)
              .enter()
              .append("rect")
              .attr("height", 4)
              .attr("width", function (d) {
                return Math.max(2, x(d.max) - x(d.min));
              })
              .attr("stroke", selectedlayers[i].color)
              .attr("fill", selectedlayers[i].color)
              .attr("x", function (d) {
                return x(d.min);
              })
              .attr("y", function (d) {
                return i * 5;
              });
          }
        }

        plotdata();

        if (this.domain) {
          x.domain(this.domain);
          xx.domain(this.domain);
          zoomed(false);
        }

        // Add Focus
        var focus = svg
          .append("g")
          .append("circle")
          .style("fill", "#F83F3F")
          .attr("stroke", "#F83F3F")
          .attr("r", 5)
          .attr("cy", selectedlayers.length * 5)
          .style("opacity", 0);

        // Add the current value
        var current = svg
          .append("g")
          .append("circle")
          .style("fill", "red")
          .attr("stroke", "red")
          .attr("r", 6)
          .attr("cy", selectedlayers.length * 5)
          .attr("cx", x(datetime));

        // Add tooltip
        var tooltip = d3
          .select("#timeselector")
          .append("div")
          .attr("id", "tooltip")
          .attr("class", "timetooltip");

        svg
          .append("rect")
          .style("fill", "none")
          .style("pointer-events", "all")
          .attr("width", width)
          .attr("height", height + margin.bottom)
          .on("mouseover", mouseover)
          .on("mousemove", mousemove)
          .on("mouseout", mouseout)
          .on("click", onClick);

        function onClick(event) {
          tooltip.style("visibility", "hidden");
          focus.style("opacity", 0);
          var date = x.invert(d3.pointer(event)[0]);
          if (typeof date.getMonth === "function") {
            onChangeDatetime(date);
            current.attr("cx", d3.pointer(event)[0]);
            focus.style("opacity", 0);
          }
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
            focus.attr("cx", d3.pointer(event)[0]);
          } catch (e) {}
          try {
            tooltip
              .style("left", d3.pointer(event)[0] - 75 + "px")
              .html(tooltiptext(x.invert(d3.pointer(event)[0])))
              .style(
                "top",
                `-${
                  d3.select("#tooltip").node().getBoundingClientRect().height +
                  (30 - (selectedlayers.length - 1) * 5)
                }px`
              );
          } catch (e) {}
        }

        function tooltiptext(datetime) {
          var months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          var info =
            '<div class="tooltip-info"><b>Hint!</b><br>Scroll in on the slider to zoom in and select a specific date time.</div>';
          var datestring = `<div class="tooltip-title">${datetime.toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )} ${datetime.getDate()}-${
            months[datetime.getMonth()]
          } ${datetime.getFullYear()}</div>`;
          var layerstring = "<table><tbody>";
          for (var i = 0; i < selectedlayers.length; i++) {
            layerstring =
              layerstring +
              `<tr><td>${selectedlayers[i].title} <div style="color:${selectedlayers[i].color};display:inline-block">${selectedlayers[i].name}</div></td>` +
              `<td style="color:${selectedlayers[i].color}">&#9644;</td></tr>`;
          }
          layerstring = layerstring + "</tbody></table>";
          var string = datestring + layerstring + "</tbody></table>";
          string = instructions ? info + string : string;
          return string;
        }
      } catch (e) {
        console.error("Error plotting time selector", e);
      }
    }
  };
  componentDidMount() {
    this.domain = false;
    this.plotLineGraph();
    window.addEventListener("resize", this.plotLineGraph, false);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.plotLineGraph, false);
  }

  componentDidUpdate(prevProps, prevState) {
    if (!isEqual(prevProps, this.props)) this.plotLineGraph();
  }
  render() {
    return (
      <div className="timeselector">
        <div id="timeselector"></div>
      </div>
    );
  }
}

export default TimeSelector;
