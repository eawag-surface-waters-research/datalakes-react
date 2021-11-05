import React, { Component } from "react";
import * as d3 from "d3";
import isEqual from "lodash/isEqual";

class D3StackedBarGraph extends Component {
  state = {
    graphid: Math.round(Math.random() * 100000),
  };
  plotBarGraph = async () => {
    var { graphid } = this.state;
    try {
      d3.select("#bargraphsvg" + graphid).remove();
    } catch (e) {}
    if (this.props.data) {
      try {
        var {
          data,
          keys,
          colors,
          xlabel,
          xunits,
          title,
          legend,
          setDownloadGraph,
        } = this.props;

        // Set graph size
        var margin = { top: 20, right: 20, bottom: 50, left: 50, legend: 50 },
          viswidth = d3
            .select("#vis" + graphid)
            .node()
            .getBoundingClientRect().width,
          visheight =
            d3
              .select("#vis" + graphid)
              .node()
              .getBoundingClientRect().height - 5,
          width = viswidth - margin.left - margin.right,
          height = visheight - margin.top - margin.bottom;

        var max = data.map((d) => {
          var arr = keys.map((k) => d[k]);
          return arr.reduce((a, b) => a + b, 0);
        });

        // Format X-axis
        var x = d3
          .scaleLinear()
          .domain([0, Math.max(...max)])
          .range([0, width]);

        // Format Y-axis
        var y = d3
          .scaleBand()
          .rangeRound([0, height])
          .domain(data.map((d) => d.name))
          .paddingInner(0.3)
          .align(0.1);

        if (legend) y.rangeRound([margin.legend, height]);

        var color = d3.scaleOrdinal().range(colors);

        // Define the axes
        var xAxis = d3.axisBottom(x);
        var yAxis = d3.axisLeft(y);

        // Adds the svg canvas
        var svg = d3
          .select("#vis" + graphid)
          .append("svg")
          .attr("id", "bargraphsvg" + graphid)
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom + margin.legend)
          .append("g")
          .attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")"
          );

        // Add bars
        var series = d3
          .stack()
          .keys(keys)(data)
          // eslint-disable-next-line
          .map((d) => (d.forEach((v) => (v.key = d.key)), d));
        svg
          .append("g")
          .selectAll("g")
          .data(series)
          .join("g")
          .attr("fill", (d) => color(d.key))
          .selectAll("rect")
          .data((d) => d)
          .join("rect")
          .attr("x", (d) => x(d[0]))
          .attr("y", (d, i) => y(d.data.name))
          .attr("width", (d) => x(d[1]) - x(d[0]))
          .attr("height", y.bandwidth())
          .append("title")
          .text((d) => `${d.key} ${d.data[d.key]} ${xunits}`);

        // Add the X Axis
        svg
          .append("g")
          .attr("class", "x axis")
          .attr("id", "axis--x")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

        if (xlabel) {
          svg
            .append("text")
            .attr(
              "transform",
              "translate(" +
                width / 2 +
                " ," +
                (height + margin.bottom / 1.5) +
                ")"
            )
            .attr("x", 6)
            .attr("dx", "1em")
            .style("text-anchor", "middle")
            .text(xunits ? `${xlabel} (${xunits})` : xlabel);
        }

        // Add the Y Axis
        svg
          .append("g")
          .attr("class", "y axis")
          .attr("id", "axis--y")
          .call(yAxis);

        // Add title
        var titlesvg = svg
          .append("text")
          .attr("x", width / 2)
          .attr("y", 2 - margin.top / 2)
          .attr("text-anchor", "middle")
          .style("font-size", "14px")
          .style("text-decoration", "underline")
          .style("opacity", "1")
          .text(title);
        d3.select("#pngdownloadline" + graphid).on("click", function () {
          downloadGraph();
        });

        // Add legend
        if (legend) {
          var legendblock = svg
            .append("g")
            .attr("id", "legendbox")
            .attr("pointer-events", "none");

          // Add one dot in the legend for each name.
          legendblock
            .selectAll("legendtext")
            .data(legend)
            .enter()
            .append("text")
            .attr("x", function (d) {
              return d.offset + 15;
            })
            .attr("y", margin.legend / 2)
            .style("font-size", "12")
            .text(function (d) {
              return d.text;
            })
            .attr("text-anchor", "start")
            .style("alignment-baseline", "middle");
          legendblock
            .selectAll("legendsquare")
            .data(legend)
            .enter()
            .append("rect")
            .attr("x", function (d) {
              return d.offset;
            })
            .attr("y", margin.legend / 2 - 7)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", function (d) {
              return d.color;
            });
        }

        function downloadGraph() {
          titlesvg.style("opacity", "1");
          var s = new XMLSerializer();
          var str = s.serializeToString(
            document.getElementById("linegraphsvg" + graphid)
          );

          var canvas = document.createElement("canvas"),
            context = canvas.getContext("2d");

          canvas.width = viswidth;
          canvas.height = visheight;

          var image = new Image();
          image.onerror = function () {
            alert(
              "Appologies .png download failed. Pleaseawait  download as .svg."
            );
          };
          image.onload = function () {
            context.drawImage(image, 0, 0);
            var a = document.createElement("a");
            a.download = "downloadgraph.png";
            a.href = canvas.toDataURL("image/png");
            a.click();
          };
          image.src =
            "data:image/svg+xml;charset=utf8," + encodeURIComponent(str);
          titlesvg.style("opacity", "0");
        }

        if (setDownloadGraph) {
          setDownloadGraph(downloadGraph);
        }
      } catch (e) {
        console.error("Error plotting line graph", e);
      }
    }
  };
  componentDidMount() {
    this.plotBarGraph();
    window.addEventListener("resize", this.plotBarGraph, false);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.plotBarGraph, false);
  }

  componentDidUpdate(prevProps, prevState) {
    if (!isEqual(prevProps, this.props)) {
      this.plotBarGraph();
    }
  }
  render() {
    var { graphid } = this.state;
    return (
      <React.Fragment>
        <div id={"vis" + graphid} className="vis-main"></div>
      </React.Fragment>
    );
  }
}

export default D3StackedBarGraph;
