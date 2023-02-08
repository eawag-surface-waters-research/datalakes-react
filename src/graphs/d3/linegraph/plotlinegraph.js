import {
  select,
  area,
  extent,
  scaleTime,
  scaleLog,
  scaleLinear,
  timeFormat,
  timeSecond,
  timeMinute,
  timeHour,
  timeDay,
  timeMonth,
  timeYear,
  timeWeek,
  axisBottom,
  axisLeft,
  axisRight,
  axisTop,
  line,
  zoomIdentity,
  zoom as d3zoom,
  format,
  timeFormatDefaultLocale,
} from "d3";

import {
  closest,
  formatDate,
  formatNumber,
  isNumeric,
  languageOptions,
  scientificNotation,
} from "./functions";

import {
  verifyString,
  verifyBool,
  verifyNumber,
  verifyDiv,
  verifyFunction,
} from "./verify";

const plotlinegraph = (div, data, options = {}) => {
  for (var r of ["svg", "canvas", "tooltip", "background"]) {
    try {
      select(`#${r}_${div}`).remove();
    } catch (e) {
      console.log(e);
    }
  }

  try {
    verifyDiv(div);

    data = processData(data);
    if (data.length < 1) return;
    options = processOptions(div, data, options);

    var { xDomain, yDomain, x2Domain, y2Domain } = dataExtents(data, options);

    const context = addCanvas(div, options);
    const svg = addSVG(div, options);

    timeFormatDefaultLocale(languageOptions(options.language));

    var xAxis = addXAxis(svg, xDomain, x2Domain, options);
    var yAxis = addYAxis(svg, yDomain, y2Domain, options);

    addInteractionBoxes(svg, div, options);

    if (options.title) addTitle(svg, div, options);
    if (options.border) addBorder(svg, options);
    if (options.backgroundColor) addBackground(div, options);
    if (options.setDownloadGraph)
      options.setDownloadGraph(() => downloadGraph(div, options));
    if (options.setDownloadGraphDiv)
      select("#" + options.setDownloadGraphDiv).on("click", function () {
        downloadGraph(div, options);
      });

    var plot = addPlottingArea(div, svg, options);
    if (options.legend) addLegend(svg, div, data, options);
    if (options.lines) plotLines(div, plot, data, xAxis, yAxis);
    if (options.scatter) plotScatter(context, data, xAxis, yAxis, options);
    if (options.zoom) addZoom(plot, context, data, div, xAxis, yAxis, options);
    if (options.tooltip) addTooltip(data, div, xAxis, yAxis, options);
  } catch (e) {
    console.error(e);
  }
};

const addPlottingArea = (div, svg, options) => {
  svg
    .append("defs")
    .append("svg:clipPath")
    .attr("id", "clip_" + div)
    .append("svg:rect")
    .attr("width", options.canvasWidth)
    .attr("height", options.canvasHeight)
    .attr("x", 0)
    .attr("y", 0);
  var plot = svg
    .append("g")
    .attr("id", "plot_" + div)
    .attr("clip-path", "url(#clip_" + div + ")")
    .style("pointer-events", "none");
  return plot;
};

const processData = (data) => {
  if (!Array.isArray(data)) data = [data];
  for (var i = 0; i < data.length; i++) {
    var d = data[i];
    if (!("x" in d)) throw new Error("Array of data for x-axis not found.");
    if (!("y" in d)) throw new Error("Array of data for y-axis not found.");
    if (d.x.length !== d.y.length)
      throw new Error("Axis have different lengths");
    if (!("name" in d)) data[i]["name"] = `Dataset ${i + 1}`;
    if (!("lineColor" in d)) data[i]["lineColor"] = "#000000";
    if (!("lineWeight" in d)) data[i]["lineWeight"] = 1;
    if (!("xaxis" in d)) data[i]["xaxis"] = "x";
    if (!("yaxis" in d)) data[i]["yaxis"] = "y";
    if (data[i]["xaxis"] === "" || data[i]["xaxis"] === undefined)
      data[i]["xaxis"] = "x";
    if (data[i]["yaxis"] === "" || data[i]["yaxis"] === undefined)
      data[i]["yaxis"] = "y";
  }
  return data;
};

const processOptions = (div, data, userOptions) => {
  var defaultOptions = [
    { name: "language", default: "en", verify: verifyString },
    { name: "tooltip", default: true, verify: verifyBool },
    { name: "yReverse", default: false, verify: verifyBool },
    { name: "xReverse", default: false, verify: verifyBool },
    { name: "xLabel", default: false, verify: verifyString },
    { name: "yLabel", default: false, verify: verifyString },
    { name: "x2Label", default: false, verify: verifyString },
    { name: "y2Label", default: false, verify: verifyString },
    { name: "xUnit", default: false, verify: verifyString },
    { name: "yUnit", default: false, verify: verifyString },
    { name: "x2Unit", default: false, verify: verifyString },
    { name: "y2Unit", default: false, verify: verifyString },
    { name: "xMax", default: false, verify: verifyNumber },
    { name: "yMax", default: false, verify: verifyNumber },
    { name: "xMin", default: false, verify: verifyNumber },
    { name: "yMin", default: false, verify: verifyNumber },
    { name: "xLog", default: false, verify: verifyBool },
    { name: "yLog", default: false, verify: verifyBool },
    { name: "scatter", default: false, verify: verifyBool },
    { name: "lines", default: true, verify: verifyBool },
    { name: "grid", default: false, verify: verifyBool },
    { name: "border", default: false, verify: verifyBool },
    { name: "xPadding", default: false, verify: verifyBool },
    { name: "yPadding", default: true, verify: verifyBool },
    { name: "title", default: false, verify: verifyString },
    { name: "fontSize", default: 12, verify: verifyNumber },
    { name: "marginTop", default: 10, verify: verifyNumber },
    { name: "marginLeft", default: 46, verify: verifyNumber },
    { name: "marginBottom", default: 46, verify: verifyNumber },
    { name: "marginRight", default: 70, verify: verifyNumber },
    { name: "zoom", default: true, verify: verifyBool },
    { name: "legend", default: true, verify: verifyBool },
    { name: "legendPosition", default: "bottomRight", verify: verifyString },
    { name: "setDownloadGraph", default: false, verify: verifyFunction },
    { name: "setDownloadGraphDiv", default: false, verify: verifyString },
    { name: "hover", default: false, verify: verifyFunction },
    {
      name: "backgroundColor",
      default: false,
      verify: () => {
        return true;
      },
    },
    {
      name: "width",
      default: select("#" + div)
        .node()
        .getBoundingClientRect().width,
      verify: verifyNumber,
    },
    {
      name: "height",
      default: select("#" + div)
        .node()
        .getBoundingClientRect().height,
      verify: verifyNumber,
    },
  ];

  var options = {};
  for (let i = 0; i < defaultOptions.length; i++) {
    if (defaultOptions[i].name in userOptions) {
      if (userOptions[defaultOptions[i].name] === undefined) {
        options[defaultOptions[i].name] = defaultOptions[i].default;
      } else if (
        defaultOptions[i].verify(userOptions[defaultOptions[i].name])
      ) {
        options[defaultOptions[i].name] = userOptions[defaultOptions[i].name];
      } else {
        console.error(
          `${userOptions[defaultOptions[i].name]} is not a valid input for ${
            defaultOptions[i].name
          }`
        );
        options[defaultOptions[i].name] = defaultOptions[i].default;
      }
    } else {
      options[defaultOptions[i].name] = defaultOptions[i].default;
    }
  }

  options.dualaxis = false;
  for (let d of data) {
    if (d.yaxis === "y2") {
      options.dualaxis = "y2";
      options.dualaxisColor = d.lineColor;
    }
    if (d.xaxis === "x2") {
      options.dualaxis = "x2";
      options.dualaxisColor = d.lineColor;
    }
  }

  if (!("marginLeft" in userOptions))
    options.marginLeft = options.fontSize * 3 + 10;
  if (!("marginRight" in userOptions)) {
    if (options.dualaxis === "y2") {
      options.marginRight = options.fontSize * 3 + 10;
    } else {
      options.marginRight = 10;
    }
  }
  if (!("marginBottom" in userOptions))
    options.marginBottom = options.fontSize * 3 + 10;
  if (!("marginTop" in userOptions)) {
    if (options.title) {
      if (options.dualaxis === "x2") {
        options.marginTop = options.fontSize * 3 + 10;
      } else {
        options.marginTop = options.fontSize + 2;
      }
    } else {
      options.marginTop = 10;
    }
  }

  options.xTime = false;
  options.yTime = false;
  if (data[0].x[0] instanceof Date) options.xTime = true;
  if (data[0].y[0] instanceof Date) options.yTime = true;

  options.canvasWidth = Math.floor(
    options.width - options.marginLeft - options.marginRight
  );
  options.canvasHeight = Math.floor(
    options.height - options.marginTop - options.marginBottom
  );
  return options;
};

const getDomain = (domain) => {
  var minarr = domain.map((d) => d[0]);
  var maxarr = domain.map((d) => d[1]);
  var min = extent(minarr)[0];
  var max = extent(maxarr)[1];
  return [min, max];
};

const dataExtents = (data, options) => {
  var xdomarr = [];
  var ydomarr = [];
  var y2domarr = [];
  var x2domarr = [];
  for (var i = 0; i < data.length; i++) {
    let xext = extent(data[i].x);
    let yext = extent(data[i].y);
    if (data[i].yaxis === "y2") {
      y2domarr.push(yext);
    } else {
      ydomarr.push(yext);
    }
    if (data[i].xaxis === "x2") {
      x2domarr.push(xext);
    } else {
      xdomarr.push(xext);
    }
  }
  var xDomain = getDomain(xdomarr);
  var yDomain = getDomain(ydomarr);
  var y2Domain = getDomain(y2domarr);
  var x2Domain = getDomain(x2domarr);

  if (options.xMin) xDomain[0] = options.xMin
  if (options.xMax) xDomain[1] = options.xMax
  if (options.yMin) yDomain[0] = options.yMin
  if (options.yMax) yDomain[1] = options.yMax

  return { xDomain, yDomain, x2Domain, y2Domain };
};

const addSVG = (div, options) => {
  return select("#" + div)
    .append("svg")
    .attr("id", "svg_" + div)
    .attr("width", options.width)
    .style("z-index", 2)
    .style("position", "absolute")
    .attr("height", options.height)
    .append("g")
    .attr(
      "transform",
      "translate(" + options.marginLeft + "," + options.marginTop + ")"
    );
};

const addCanvas = (div, options) => {
  var left = "0px";
  if (options.contour) left = "1px";
  const canvas = select("#" + div)
    .append("canvas")
    .attr("width", options.canvasWidth)
    .attr("height", options.canvasHeight)
    .style("margin-left", options.marginLeft + "px")
    .style("margin-top", options.marginTop + "px")
    .style("pointer-events", "none")
    .style("z-index", 1)
    .style("position", "absolute")
    .style("left", left)
    .style("cursor", "grab")
    .attr("id", "canvas_" + div)
    .attr("class", "canvas-plot");
  return canvas.node().getContext("2d");
};

const addXAxis = (svg, xDomain, x2Domain, options) => {
  var axisObj = {};
  axisObj.x = addBottonAxis(svg, xDomain, options);
  if (options.dualaxis === "x2") {
    axisObj.x2 = addTopAxis(svg, x2Domain, options);
  }
  return axisObj;
};

const addBottonAxis = (svg, xDomain, options) => {
  var ax;
  var xrange = [0, options.canvasWidth];
  var xAxisLabel =
    "" +
    (options.xLabel ? options.xLabel : "") +
    (options.xUnit ? " (" + options.xUnit + ")" : "");
  if (options.xReverse) xrange = [options.canvasWidth, 0];
  if (options.xTime) {
    xAxisLabel = "";
    ax = scaleTime().range(xrange).domain(xDomain);
  } else if (options.xLog) {
    ax = scaleLog().range(xrange).domain(xDomain);
  } else {
    if (options.xPadding) {
      var xd = (xDomain[1] - xDomain[0]) * 0.1;
      xDomain = [xDomain[0] - xd, xDomain[1] + xd];
    }
    ax = scaleLinear().range(xrange).domain(xDomain);
  }
  var ref = ax.copy();
  var base = ax.copy();
  var axis = axisBottom(ax).ticks(5);
  if (options.xTime) {
    axis.tickFormat(multiFormat);
  } else if (scientificNotation(xDomain[0], xDomain[1])) {
    axis.tickFormat(format(".1e"));
  }

  if (options.grid) axis.tickSize(-options.canvasHeight);

  var g = svg
    .append("g")
    .attr("class", "x axis")
    .attr("id", "axis--x")
    .attr("transform", "translate(0," + options.canvasHeight + ")")
    .style("font-size", `${options.fontSize}px`)
    .call(axis);

  if (options.grid) {
    g.selectAll(".tick line")
      .attr("stroke", "grey")
      .attr("stroke-dasharray", "4");
  }

  if (xAxisLabel !== "") {
    svg
      .append("text")
      .attr(
        "transform",
        "translate(" +
          options.canvasWidth / 2 +
          " ," +
          (options.canvasHeight + options.marginBottom / 1.5) +
          ")"
      )
      .attr("x", 6)
      .attr("dx", `${options.fontSize}px`)
      .style("font-size", `${options.fontSize}px`)
      .style("text-anchor", "end")
      .text(xAxisLabel);
  }

  return { ax, ref, base, axis, g };
};

const addTopAxis = (svg, x2Domain, options) => {
  var ax;
  var xrange = [0, options.canvasWidth];
  var xAxisLabel =
    "" +
    (options.x2Label ? options.x2Label : "") +
    (options.x2Unit ? " (" + options.x2Unit + ")" : "");
  if (options.xReverse) xrange = [options.canvasWidth, 0];
  if (options.xTime) {
    xAxisLabel = "";
    ax = scaleTime().range(xrange).domain(x2Domain);
  } else if (options.xLog) {
    ax = scaleLog().range(xrange).domain(x2Domain);
  } else {
    if (options.xPadding) {
      var xd = (x2Domain[1] - x2Domain[0]) * 0.1;
      x2Domain = [x2Domain[0] - xd, x2Domain[1] + xd];
    }
    ax = scaleLinear().range(xrange).domain(x2Domain);
  }
  var ref = ax.copy();
  var base = ax.copy();
  var axis = axisTop(ax).ticks(5);
  if (options.xTime) {
    axis.tickFormat(multiFormat);
  } else if (scientificNotation(x2Domain[0], x2Domain[1])) {
    axis.tickFormat(format(".1e"));
  }

  var g = svg
    .append("g")
    .attr("class", "x axis")
    .attr("id", "axis--x2")
    .attr("transform", "translate(0,0)")
    .style("font-size", `${options.fontSize}px`)
    .call(axis);

  if (xAxisLabel !== "") {
    svg
      .append("text")
      .attr(
        "transform",
        `translate(${options.canvasWidth / 2},${
          options.fontSize * 2 - options.marginTop
        })`
      )
      .attr("x", 6)
      .attr("dx", `${options.fontSize}px`)
      .style("font-size", `${options.fontSize}px`)
      .style("text-anchor", "end")
      .text(xAxisLabel);
  }

  return { ax, ref, base, axis, g };
};

const addYAxis = (svg, yDomain, y2Domain, options) => {
  var axisObj = {};
  axisObj.y = addLeftAxis(svg, yDomain, options);
  if (options.dualaxis === "y2") {
    axisObj.y2 = addRightAxis(svg, y2Domain, options);
  }
  return axisObj;
};

const addLeftAxis = (svg, yDomain, options) => {
  var ax;
  var yrange = [options.canvasHeight, 0];
  var yAxisLabel =
    "" +
    (options.yLabel ? options.yLabel : "") +
    (options.yUnit ? " (" + options.yUnit + ")" : "");
  if (options.yReverse) yrange = [0, options.canvasHeight];
  if (options.yTime) {
    yAxisLabel = "";
    ax = scaleTime().range(yrange).domain(yDomain);
  } else if (options.yLog) {
    ax = scaleLog().range(yrange).domain(yDomain);
  } else {
    if (options.yPadding) {
      var yd = (yDomain[1] - yDomain[0]) * 0.1;
      yDomain = [yDomain[0] - yd, yDomain[1] + yd];
    }
    ax = scaleLinear().range(yrange).domain(yDomain);
  }
  var ref = ax.copy();
  var base = ax.copy();
  var axis = axisLeft(ax).ticks(5);
  if (options.yTime) {
    axis.tickFormat(multiFormat);
  } else if (scientificNotation(yDomain[0], yDomain[1])) {
    axis.tickFormat(format(".1e"));
  }

  if (options.grid) axis.tickSize(-options.canvasWidth);

  var g = svg
    .append("g")
    .attr("class", "y axis")
    .attr("id", "axis--y")
    .style("font-size", `${options.fontSize}px`)
    .call(axis);

  if (options.grid) {
    g.selectAll(".tick line")
      .attr("stroke", "grey")
      .attr("stroke-dasharray", "4");
  }

  if (yAxisLabel !== "") {
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - options.marginLeft)
      .attr("x", 0 - options.canvasHeight / 2)
      .attr("dy", `${options.fontSize}px`)
      .style("font-size", `${options.fontSize}px`)
      .style("text-anchor", "middle")
      .text(yAxisLabel);
  }
  return { ax, ref, base, axis, g };
};

const addRightAxis = (svg, y2Domain, options) => {
  var ax;
  var yrange = [options.canvasHeight, 0];
  var yAxisLabel =
    "" +
    (options.y2Label ? options.y2Label : "") +
    (options.y2Unit ? " (" + options.y2Unit + ")" : "");
  if (options.yReverse) yrange = [0, options.canvasHeight];
  if (options.yTime) {
    yAxisLabel = "";
    ax = scaleTime().range(yrange).domain(y2Domain);
  } else if (options.yLog) {
    ax = scaleLog().range(yrange).domain(y2Domain);
  } else {
    if (options.yPadding) {
      var yd = (y2Domain[1] - y2Domain[0]) * 0.1;
      y2Domain = [y2Domain[0] - yd, y2Domain[1] + yd];
    }
    ax = scaleLinear().range(yrange).domain(y2Domain);
  }
  var ref = ax.copy();
  var base = ax.copy();
  var axis = axisRight(ax).ticks(5);
  if (options.yTime) {
    axis.tickFormat(multiFormat);
  } else if (scientificNotation(y2Domain[0], y2Domain[1])) {
    axis.tickFormat(format(".1e"));
  }

  var g = svg
    .append("g")
    .attr("class", "y axis")
    .attr("id", "axis--y2")
    .attr("transform", `translate(${options.canvasWidth},0)`)
    .style("font-size", `${options.fontSize}px`)
    .call(axis);

  if (yAxisLabel !== "") {
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr(
        "y",
        options.canvasWidth + options.marginRight - options.fontSize - 5
      )
      .attr("x", 0 - options.canvasHeight / 2)
      .attr("dy", `${options.fontSize}px`)
      .style("font-size", `${options.fontSize}px`)
      .style("fill", options.dualaxisColor)
      .style("text-anchor", "middle")
      .text(yAxisLabel);
  }
  return { ax, ref, base, axis, g };
};

const addTitle = (svg, div, options) => {
  svg
    .append("text")
    .attr("x", options.canvasWidth / 2)
    .attr("y", 2 - options.marginTop / 2)
    .attr("id", "title_" + div)
    .attr("text-anchor", "middle")
    .style("z-index", 3)
    .style("font-size", `${options.fontSize + 2}px`)
    .style("text-decoration", "underline")
    .style("opacity", "0")
    .text(options.title);
};

const addLegend = (svg, div, data, options) => {
  if ((data.length > 1 && !options.dualaxis) || data.length > 2) {
    var legendblock = svg
      .append("g")
      .attr("id", "legend_" + div)
      .attr("pointer-events", "none");

    var legendbackground = legendblock
      .append("rect")
      .style("fill", "white")
      .style("opacity", 0.6);

    var x = options.canvasWidth - 10;
    var textAnchor = "end";
    if (options.legendPosition.includes("Left")) {
      x = 10;
      textAnchor = "start";
    }

    var y = (i) => {
      return options.canvasHeight - 20 - i * (options.fontSize + 6);
    };
    if (options.legendPosition.includes("top")) {
      y = (i) => {
        return 5 + i * (options.fontSize + 6);
      };
    }

    legendblock
      .selectAll("legendtext")
      .data(data)
      .enter()
      .append("text")
      .attr("x", x)
      .attr("y", function (d, i) {
        return y(i);
      })
      .style("fill", function (d) {
        return d.lineColor;
      })
      .text(function (d) {
        return d.name;
      })
      .attr("text-anchor", textAnchor)
      .style("font-size", `${options.fontSize}px`)
      .style("alignment-baseline", "middle");

    var legend_size = select("#legend_" + div)
      .node()
      .getBBox();

    legendbackground
      .attr("x", legend_size.x - 5)
      .attr("y", legend_size.y - 5)
      .attr("width", legend_size.width + 10)
      .attr("height", legend_size.height + 10);
  }
};

const addBorder = (svg, options) => {
  svg
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", options.canvasWidth)
    .attr("height", options.canvasHeight)
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("fill", "none");
};

const addTooltip = (data, div, xAxis, yAxis, options) => {
  var zoombox = select(`#interact_${div}`);
  var tooltip = select("#" + div)
    .append("div")
    .style("opacity", 0)
    .style("z-index", 2)
    .style("pointer-events", "none")
    .attr("id", "tooltip_" + div)
    .attr("class", "tooltip");

  var lang = languageOptions(options.language);

  zoombox.on("mousemove", (event) => {
    try {
      var hoverX =
        event.layerX - options.marginLeft || event.offsetX - options.marginLeft;
      var hoverY =
        event.layerY - options.marginTop || event.offsetY - options.marginTop;
      var { idx, idy, distance } = closest(data, hoverX, hoverY, xAxis, yAxis);

      if (distance < 60) {
        var xval, yval;
        var xu = "";
        var yu = "";

        if (options.xTime) {
          xval = formatDate(data[idx].x[idy], lang);
        } else {
          xval = formatNumber(data[idx].x[idy]);
          if (typeof options.xUnit === "string") {
            if (data[idx].xaxis === "x2") {
              xu = options.x2Unit;
            } else {
              xu = options.xUnit;
            }
          }
        }

        if (options.yTime) {
          yval = formatDate(data[idx].y[idy], lang);
        } else {
          yval = formatNumber(data[idx].y[idy]);
          if (typeof options.yUnit === "string") {
            if (data[idx].yaxis === "y2") {
              yu = options.y2Unit;
            } else {
              yu = options.yUnit;
            }
          }
        }

        var html =
          `<table style="color:${data[idx].lineColor};"><tbody>` +
          `<tr><td>x:</td><td>${xval} ${xu}</td></tr>` +
          `<tr><td>y:</td><td>${yval} ${yu}</td></tr>` +
          "</tbody></table>";

        if (hoverX > options.width / 2) {
          tooltip
            .html(html)
            .style(
              "right",
              options.width -
                options.marginLeft -
                xAxis[data[idx].xaxis].ax(data[idx].x[idy]) +
                10 +
                "px"
            )
            .style("left", "auto")
            .style(
              "top",
              yAxis[data[idx].yaxis].ax(data[idx].y[idy]) +
                options.marginTop -
                options.fontSize -
                6 +
                "px"
            )
            .attr("class", "tooltip tooltip-right")
            .style("opacity", 1);
        } else {
          tooltip
            .html(html)
            .style(
              "left",
              xAxis[data[idx].xaxis].ax(data[idx].x[idy]) +
                options.marginLeft +
                10 +
                "px"
            )
            .style("right", "auto")
            .style(
              "top",
              yAxis[data[idx].yaxis].ax(data[idx].y[idy]) +
                options.marginTop -
                options.fontSize -
                6 +
                "px"
            )
            .attr("class", "tooltip tooltip-left")
            .style("opacity", 1);
        }

        if (options.hover) options.hover({ idx, idy });
      } else if (distance > 200) {
        tooltip.style("opacity", 0);
        if (options.hover) options.hover({ mousex: false, mousey: false });
      }
    } catch (e) {
      tooltip.style("opacity", 0);
      if (options.hover) options.hover({ mousex: false, mousey: false });
    }
  });

  zoombox.on("mouseout", () => {
    tooltip.style("opacity", 0);
    if (options.hover) options.hover({ mousex: false, mousey: false });
  });
};

const addBackground = (div, options) => {
  select("#" + div)
    .append("svg")
    .attr("id", "background_" + div)
    .attr("width", options.width)
    .style("z-index", 0)
    .style("position", "absolute")
    .attr("height", options.height)
    .append("g")
    .append("rect")
    .attr("x", 1)
    .attr("width", options.width)
    .attr("height", options.height)
    .attr("fill", options.backgroundColor);
};

const downloadGraph = (div, options) => {
  var title = select("#title_" + div);
  title.style("opacity", "1");
  var s = new XMLSerializer();
  var str = s.serializeToString(document.getElementById("svg_" + div));

  var canvasout = document.createElement("canvas"),
    contextout = canvasout.getContext("2d");

  canvasout.width = options.width;
  canvasout.height = options.height;

  var image = new Image();
  image.onerror = function () {
    alert("Appologies .png download failed. Please download as .svg.");
  };
  image.onload = function () {
    contextout.drawImage(image, 0, 0);
    contextout.drawImage(
      document.getElementById("canvas_" + div),
      options.marginLeft,
      options.marginTop
    );
    var a = document.createElement("a");
    a.download = "linegraph_" + div + ".png";
    a.href = canvasout.toDataURL("image/png");
    a.click();
  };
  image.src = "data:image/svg+xml;charset=utf8," + encodeURIComponent(str);
  title.style("opacity", "0");
};

const plotLines = (div, g, data, xAxis, yAxis) => {
  g.selectAll("path").remove();
  for (let j = 0; j < data.length; j++) {
    plotConfidenceInterval(
      g,
      data[j],
      xAxis[data[j].xaxis],
      yAxis[data[j].yaxis]
    );
  }
  for (let j = 0; j < data.length; j++) {
    g.append("path")
      .datum(data[j].x)
      .attr("id", `line_${j}_${div}`)
      .attr("fill", "none")
      .attr("stroke", data[j].lineColor)
      .attr("stroke-width", data[j].lineWeight)
      .attr(
        "d",
        line()
          .x(function (d) {
            return xAxis[data[j].xaxis].ax(d);
          })
          .y(function (d, i) {
            return yAxis[data[j].yaxis].ax(data[j].y[i]);
          })
          .defined(function (d, i) {
            if (
              isNumeric(xAxis[data[j].xaxis].ax(d)) &&
              isNumeric(yAxis[data[j].yaxis].ax(data[j].y[i]))
            ) {
              return true;
            } else {
              return false;
            }
          })
      );
  }
};

const plotConfidenceInterval = (g, data, xAxis, yAxis) => {
  if ("upper" in data && "lower" in data && "confidenceAxis" in data) {
    if (
      data.upper.length === data.x.length &&
      data.lower.length === data.x.length
    ) {
      if (data.confidenceAxis === "x") {
        g.append("path")
          .datum(data.y)
          .attr("fill", data.lineColor)
          .attr("stroke", "none")
          .attr("opacity", 0.15)
          .attr(
            "d",
            area()
              .y(function (d) {
                return yAxis.ax(d);
              })
              .x0(function (d, i) {
                return xAxis.ax(data.lower[i]);
              })
              .x1(function (d, i) {
                return xAxis.ax(data.upper[i]);
              })
              .defined(function (d, i) {
                if (
                  isNumeric(yAxis.ax(d)) &&
                  isNumeric(xAxis.ax(data.lower[i])) &&
                  isNumeric(xAxis.ax(data.upper[i]))
                ) {
                  return true;
                } else {
                  return false;
                }
              })
          );
      } else if (data.confidenceAxis === "y") {
        g.append("path")
          .datum(data.x)
          .attr("fill", data.lineColor)
          .attr("stroke", "none")
          .attr("opacity", 0.15)
          .attr(
            "d",
            area()
              .x(function (d) {
                return xAxis.ax(d);
              })
              .y0(function (d, i) {
                return yAxis.ax(data.lower[i]);
              })
              .y1(function (d, i) {
                return yAxis.ax(data.upper[i]);
              })
              .defined(function (d, i) {
                if (
                  isNumeric(xAxis.ax(d)) &&
                  isNumeric(yAxis.ax(data.lower[i])) &&
                  isNumeric(yAxis.ax(data.upper[i]))
                ) {
                  return true;
                } else {
                  return false;
                }
              })
          );
      }
    }
  }
};

const plotScatter = (context, data, xAxis, yAxis, options) => {
  context.clearRect(0, 0, options.canvasWidth, options.canvasHeight);
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < data[i].x.length; j++) {
      context.beginPath();
      context.strokeStyle = data[i].lineColor;
      const px = xAxis[data[i].xaxis].ax(data[i].x[j]);
      const py = yAxis[data[i].yaxis].ax(data[i].y[j]);
      context.arc(px, py, 2.5, 0, 2 * Math.PI, true);
      context.stroke();
    }
  }
};

const addInteractionBoxes = (svg, div, options) => {
  svg
    .append("rect")
    .attr("id", "interact_" + div)
    .attr("width", options.canvasWidth)
    .attr("height", options.canvasHeight)
    .style("fill", "none")
    .style("cursor", "pointer")
    .attr("pointer-events", "all");

  svg
    .append("rect")
    .attr("id", "interactx_" + div)
    .attr("width", options.canvasWidth)
    .attr("height", options.marginBottom)
    .style("fill", "none")
    .style("cursor", "col-resize")
    .attr("pointer-events", "all")
    .attr("y", options.canvasHeight);

  if (options.dualaxis === "x2") {
    svg
      .append("rect")
      .attr("id", "interactx2_" + div)
      .attr("width", options.canvasWidth)
      .attr("height", options.marginTop)
      .style("fill", "none")
      .style("cursor", "col-resize")
      .attr("pointer-events", "all")
      .attr("y", -options.marginTop);
  }

  svg
    .append("rect")
    .attr("id", "interacty_" + div)
    .attr("width", options.marginLeft)
    .attr("height", options.canvasHeight)
    .style("fill", "none")
    .style("cursor", "row-resize")
    .attr("pointer-events", "all")
    .attr("x", -options.marginLeft);

  if (options.dualaxis === "y2") {
    svg
      .append("rect")
      .attr("id", "interacty2_" + div)
      .attr("width", options.marginRight)
      .attr("height", options.canvasHeight)
      .style("fill", "none")
      .style("cursor", "row-resize")
      .attr("pointer-events", "all")
      .attr("x", options.canvasWidth);
  }
};

const editTicks = (xAxis, yAxis) => {
  xAxis.x.g
    .selectAll(".tick line")
    .attr("stroke", "grey")
    .attr("stroke-dasharray", "4");
  yAxis.y.g
    .selectAll(".tick line")
    .attr("stroke", "grey")
    .attr("stroke-dasharray", "4");
};

const addZoom = (g, context, data, div, xAxis, yAxis, options) => {
  var zoom = d3zoom()
    .extent([
      [0, 0],
      [options.canvasWidth, options.canvasHeight],
    ])
    .on("zoom", normalzoom);

  var zoomx = d3zoom()
    .extent([
      [0, 0],
      [options.canvasWidth, options.canvasHeight],
    ])
    .on("zoom", normalzoomx);

  var zoomy = d3zoom()
    .extent([
      [0, 0],
      [options.canvasWidth, options.canvasHeight],
    ])
    .on("zoom", normalzoomy);

  if (options.dualaxis === "y2") {
    var zoomy2 = d3zoom()
      .extent([
        [0, 0],
        [options.canvasWidth, options.canvasHeight],
      ])
      .on("zoom", normalzoomy2);
    var zoomboxy2 = select(`#interacty2_${div}`).call(zoomy2);
  }

  if (options.dualaxis === "x2") {
    var zoomx2 = d3zoom()
      .extent([
        [0, 0],
        [options.canvasWidth, options.canvasHeight],
      ])
      .on("zoom", normalzoomx2);
    var zoomboxx2 = select(`#interactx2_${div}`).call(zoomx2);
  }

  var zoombox = select(`#interact_${div}`).call(zoom);
  var zoomboxx = select(`#interactx_${div}`).call(zoomx);
  var zoomboxy = select(`#interacty_${div}`).call(zoomy);

  function normalzoom(event) {
    let t = event.transform;
    if (t !== zoomIdentity) {
      xAxis.x.ax = t.rescaleX(xAxis.x.ref);
      xAxis.x.axis.scale(xAxis.x.ax);
      xAxis.x.g.call(xAxis.x.axis);
      if (options.dualaxis === "x2") {
        xAxis.x2.ax = t.rescaleX(xAxis.x2.ref);
        xAxis.x2.axis.scale(xAxis.x2.ax);
        xAxis.x2.g.call(xAxis.x2.axis);
      }
      yAxis.y.ax = t.rescaleY(yAxis.y.ref);
      yAxis.y.axis.scale(yAxis.y.ax);
      yAxis.y.g.call(yAxis.y.axis);
      if (options.dualaxis === "y2") {
        yAxis.y2.ax = t.rescaleY(yAxis.y2.ref);
        yAxis.y2.axis.scale(yAxis.y2.ax);
        yAxis.y2.g.call(yAxis.y2.axis);
      }
      if (options.lines) plotLines(div, g, data, xAxis, yAxis);
      if (options.scatter) plotScatter(context, data, xAxis, yAxis, options);
      xAxis.x.ref = xAxis.x.ax;
      if (options.dualaxis === "x2") xAxis.x2.ref = xAxis.x2.ax;
      yAxis.y.ref = yAxis.y.ax;
      if (options.dualaxis === "y2") yAxis.y2.ref = yAxis.y2.ax;
      zoombox.call(zoom.transform, zoomIdentity);
      if (options.grid) editTicks(xAxis, yAxis);
    }
  }

  function normalzoomx(event) {
    let t = event.transform;
    if (t !== zoomIdentity) {
      xAxis.x.ax = t.rescaleX(xAxis.x.ref);
      xAxis.x.axis.scale(xAxis.x.ax);
      xAxis.x.g.call(xAxis.x.axis);
      if (options.lines) plotLines(div, g, data, xAxis, yAxis);
      if (options.scatter) plotScatter(context, data, xAxis, yAxis, options);
      xAxis.x.ref = xAxis.x.ax;
      zoomboxx.call(zoom.transform, zoomIdentity);
      if (options.grid) editTicks(xAxis, yAxis);
    }
  }

  function normalzoomx2(event) {
    let t = event.transform;
    if (t !== zoomIdentity) {
      xAxis.x2.ax = t.rescaleX(xAxis.x2.ref);
      xAxis.x2.axis.scale(xAxis.x2.ax);
      xAxis.x2.g.call(xAxis.x2.axis);
      if (options.lines) plotLines(div, g, data, xAxis, yAxis);
      if (options.scatter) plotScatter(context, data, xAxis, yAxis, options);
      xAxis.x2.ref = xAxis.x2.ax;
      zoomboxx2.call(zoom.transform, zoomIdentity);
      if (options.grid) editTicks(xAxis, yAxis);
    }
  }

  function normalzoomy(event) {
    let t = event.transform;
    if (t !== zoomIdentity) {
      yAxis.y.ax = t.rescaleY(yAxis.y.ref);
      yAxis.y.axis.scale(yAxis.y.ax);
      yAxis.y.g.call(yAxis.y.axis);
      if (options.lines) plotLines(div, g, data, xAxis, yAxis);
      if (options.scatter) plotScatter(context, data, xAxis, yAxis, options);
      yAxis.y.ref = yAxis.y.ax;
      zoomboxy.call(zoom.transform, zoomIdentity);
      if (options.grid) editTicks(xAxis, yAxis);
    }
  }

  function normalzoomy2(event) {
    let t = event.transform;
    if (t !== zoomIdentity) {
      yAxis.y2.ax = t.rescaleY(yAxis.y2.ref);
      yAxis.y2.axis.scale(yAxis.y2.ax);
      yAxis.y2.g.call(yAxis.y2.axis);
      if (options.lines) plotLines(div, g, data, xAxis, yAxis);
      if (options.scatter) plotScatter(context, data, xAxis, yAxis, options);
      yAxis.y2.ref = yAxis.y2.ax;
      zoomboxy2.call(zoom.transform, zoomIdentity);
      if (options.grid) editTicks(xAxis, yAxis);
    }
  }

  zoombox.on("dblclick.zoom", null).on("dblclick", () => {
    xAxis.x.ax = xAxis.x.base;
    xAxis.x.ref = xAxis.x.base;
    xAxis.x.axis.scale(xAxis.x.base);
    xAxis.x.g.call(xAxis.x.axis);
    if (options.dualaxis === "x2") {
      xAxis.x2.ax = xAxis.x2.base;
      xAxis.x2.ref = xAxis.x2.base;
      xAxis.x2.axis.scale(xAxis.x2.base);
      xAxis.x2.g.call(xAxis.x2.axis);
    }
    yAxis.y.ref = yAxis.y.base;
    yAxis.y.ax = yAxis.y.base;
    yAxis.y.axis.scale(yAxis.y.base);
    yAxis.y.g.call(yAxis.y.axis);
    if (options.dualaxis === "y2") {
      yAxis.y2.ref = yAxis.y2.base;
      yAxis.y2.ax = yAxis.y2.base;
      yAxis.y2.axis.scale(yAxis.y2.base);
      yAxis.y2.g.call(yAxis.y2.axis);
    }
    if (options.lines) plotLines(div, g, data, xAxis, yAxis);
    if (options.scatter) plotScatter(context, data, xAxis, yAxis, options);
    if (options.grid) editTicks(xAxis, yAxis);
  });
  zoomboxx.on("dblclick.zoom", null);
  zoomboxy.on("dblclick.zoom", null);
  if (options.dualaxis === "x2") zoomboxx2.on("dblclick.zoom", null);
  if (options.dualaxis === "y2") zoomboxy2.on("dblclick.zoom", null);
  return { zoombox };
};

const multiFormat = (date) => {
  var formatMillisecond = timeFormat(".%L"),
    formatSecond = timeFormat(":%S"),
    formatMinute = timeFormat("%H:%M"),
    formatHour = timeFormat("%H:%M"),
    formatDay = timeFormat("%d.%m"),
    formatWeek = timeFormat("%d.%m"),
    formatMonth = timeFormat("%B"),
    formatYear = timeFormat("%Y");
  return (
    timeSecond(date) < date
      ? formatMillisecond
      : timeMinute(date) < date
      ? formatSecond
      : timeHour(date) < date
      ? formatMinute
      : timeDay(date) < date
      ? formatHour
      : timeMonth(date) < date
      ? timeWeek(date) < date
        ? formatDay
        : formatWeek
      : timeYear(date) < date
      ? formatMonth
      : formatYear
  )(date);
};

export default plotlinegraph;
