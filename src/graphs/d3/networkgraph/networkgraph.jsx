import React, { Component } from "react";
import * as d3 from "d3";
import isEqual from "lodash/isEqual";
import "./networkgraph.css";

class NetworkGraph extends Component {
  plotNetworkGraph = async () => {
    try {
      d3.select("#networksvg").remove();
    } catch (e) {}
    if (this.props.data) {
      try {
        var { data, dataset } = this.props;
        data = JSON.parse(JSON.stringify(data.data.lineage));

        // Repo link
        var url = dataset.datasourcelink.split("blob/");
        var rootlink = url[0] + "blob/" + url[1].split("/")[0] + "/";

        // Set graph size
        var width = d3.select("#vis").node().getBoundingClientRect().width;
        var height = d3.select("#vis").node().getBoundingClientRect().height;

        const simulation = d3
          .forceSimulation(data.nodes)
          .force(
            "link",
            d3.forceLink(data.edges).id((d) => d.id)
          )
          .force("charge", d3.forceManyBody().strength(-400))
          .force("x", d3.forceX())
          .force("y", d3.forceY());

        // Adds the svg canvas
        var svg = d3
          .select("#vis")
          .append("svg")
          .attr("id", "networksvg")
          .attr("viewBox", [-width / 3, -height / 3, width, height]);

        svg
          .append("defs")
          .append("marker")
          .attr("id", "marker")
          .attr("viewBox", "0 -5 10 10")
          .attr("refX", 25)
          .attr("refY", 0)
          .attr("markerWidth", 6)
          .attr("markerHeight", 6)
          .attr("orient", "auto")
          .append("path")
          .attr("d", "M0,-5L10,0L0,5");

        var link = svg
          .append("g")
          .attr("class", "links")
          .selectAll("line")
          .data(data.edges)
          .enter()
          .append("line")
          .attr("stroke-width", "2")
          .attr("stroke", "black")
          .attr("marker-end", "url(#marker)");

        var node = svg
          .append("g")
          .attr("class", "nodes")
          .selectAll("g")
          .data(data.nodes)
          .enter()
          .append("g");

        node
          .append("circle")
          .attr("r", function (d) {
            if (d.id.includes(".cwl")) {
              return 2;
            } else {
              return 10;
            }
          })
          .attr("fill", "white")
          .attr("stroke-width", "1")
          .attr("stroke", "black")
          .call(
            d3
              .drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended)
          );

        node
          .append("a")
          .attr("xlink:href", function (d) {
            return rootlink + d.id;
          })
          .append("text")
          .text(textlabel)
          .attr("x", 12)
          .attr("y", 5);

        simulation.nodes(data.nodes).on("tick", ticked);

        simulation.force("link").links(data.edges);

        function textlabel(label) {
          if (label.id.includes(".cwl")) {
            return "";
          } else {
            label = label.id.split("/");
            label = label.pop();
            return label;
          }
        }

        function ticked() {
          link
            .attr("x1", function (d) {
              return d.source.x;
            })
            .attr("y1", function (d) {
              return d.source.y;
            })
            .attr("x2", function (d) {
              return d.target.x;
            })
            .attr("y2", function (d) {
              return d.target.y;
            });

          node.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
          });
        }
        function dragstarted(event, d) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }

        function dragged(event, d) {
          d.fx = event.x;
          d.fy = event.y;
        }

        function dragended(event, d) {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  componentDidMount() {
    this.plotNetworkGraph();
    window.addEventListener("resize", this.plotNetworkGraph, false);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.plotNetworkGraph, false);
  }

  componentDidUpdate(prevProps, prevState) {
    if (!isEqual(prevProps, this.props)) {
      this.plotNetworkGraph();
    }
  }

  render() {
    return (
      <React.Fragment>
        <div id="vis"></div>
      </React.Fragment>
    );
  }
}

export default NetworkGraph;
