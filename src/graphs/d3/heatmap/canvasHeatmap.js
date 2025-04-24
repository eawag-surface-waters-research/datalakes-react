import {
  select,
  extent,
  scaleTime,
  scaleLog,
  scaleLinear,
  axisBottom,
  axisLeft,
  symbol,
  symbolTriangle,
  zoomIdentity,
  format,
  zoom as d3zoom,
  timeFormatDefaultLocale,
} from "d3";
import {
  verifyString,
  verifyBool,
  verifyNumber,
  verifyColors,
  verifyData,
  verifyFunction,
} from "./verify";
import {
  convertToRGB,
  convertToHex,
  getFileIndex,
  closest,
  formatDate,
  formatNumber,
  languageOptions,
  scientificNotation,
  getDomain,
  multiFormat,
  replaceNull,
  autoDownSample,
  prepareContours,
} from "./functions";
import { canvasGrid, canvasContour } from "./fillcanvas";

class CanvasHeatmap {
  options = {
    language: "en",
    xLabel: false,
    yLabel: false,
    zLabel: false,
    xUnit: false,
    yUnit: false,
    zUnit: false,
    xLog: false,
    yLog: false,
    decimalPlaces: 3,
    tooltip: true,
    levels: false,
    title: false,
    zMin: false,
    zMax: false,
    fontSize: 12,
    contour: false,
    yReverse: false,
    xReverse: false,
    marginTop: 10,
    marginLeft: 46,
    marginBottom: 46,
    marginRight: 70,
    legendRight: true,
    thresholdStep: 20,
    backgroundColor: false,
    autoDownsample: false,
    setDownloadGraph: false,
    setDownloadGraphDiv: false,
    hover: false,
    click: false,
    colors: [
      { color: "#0000ff", rgba: [0, 0, 255, 255], point: 0 },
      { color: "#ff0000", rgba: [255, 0, 0, 255], point: 1 },
    ],
  };
  constructor(div, data, options = {}) {
    this._div = div;
    this._setData(data);
    this._setOptions(options);
    this._processContour();
    this._onAdd();
  }
  update(data, options) {
    this._setData(data);
    this._setOptions(options);
    this._processContour();
    this._onAdd();
  }
  updateOptions(options) {
    this._setOptions(options);
    this._processContour();
    this._onAdd();
  }
  updateData(data) {
    this._setData(data);
    this._processContour();
    this._plot();
  }
  resize() {
    this._onAdd();
  }
  remove() {
    try {
      select("#svg_" + this._div).remove();
    } catch (e) {}
    try {
      select("#canvas_" + this._div).remove();
    } catch (e) {}
    try {
      select("#tooltip_" + this._div).remove();
    } catch (e) {}
  }
  _onAdd() {
    if (select("#" + this._div)._groups[0][0] === null) return;
    this.remove();
    this._setViewport();
    this._addCanvas();
    this._addSVG();
    this._addXAxis();
    this._addYAxis();
    this._addTitle();
    this._addBackground();
    this._addLegendRight();
    this._addZoom();
    this._addTooltip();
    this._plot();
  }
  _setData(data) {
    if (!Array.isArray(data)) data = [data];
    verifyData(data);
    this._xTime = data[0].x[0] instanceof Date;
    this._yTime = data[0].y[0] instanceof Date;
    this._data = data;
    this._dataExtents();
  }
  _processContour() {
    if (this.options.contour) {
      var data = this.options.autoDownsample
        ? this._data.map((d) => autoDownSample(d, this.options.autoDownsample))
        : this._data;
      var { zMin, zMax } = this._zBounds();
      var nullData = replaceNull(data, zMax);
      this._prepContours = prepareContours(
        zMin,
        zMax,
        data,
        nullData,
        this.options.thresholdStep
      );
      this._contour = data;
    }
  }
  _plot() {
    try {
      this._vpi.style("opacity", 0);
      this._tooltip.style("opacity", 0);
      select("#zpointer_" + this._div).style("opacity", 0);
      if (this.options.hover)
        this.options.hover({ mousex: false, mousey: false });
    } catch (e) {}
    try {
      setTimeout(() => {
        this._context.clearRect(0, 0, this._canvasWidth, this._canvasHeight);
        if (this.options.contour) {
          this._canvasContour();
        } else {
          this._canvasGrid();
        }
      }, 0);
    } catch (e) {
      console.error(e);
    }
  }
  _setOptions(options) {
    var verifyOptions = {
      language: verifyString,
      xLabel: verifyString,
      yLabel: verifyString,
      zLabel: verifyString,
      xUnit: verifyString,
      yUnit: verifyString,
      zUnit: verifyString,
      xLog: verifyBool,
      yLog: verifyBool,
      decimalPlaces: verifyNumber,
      tooltip: verifyBool,
      levels: verifyBool,
      title: verifyString,
      zMin: verifyNumber,
      zMax: verifyNumber,
      fontSize: verifyNumber,
      contour: verifyBool,
      yReverse: verifyBool,
      xReverse: verifyBool,
      marginTop: verifyNumber,
      marginLeft: verifyNumber,
      marginBottom: verifyNumber,
      marginRight: verifyNumber,
      legendRight: verifyBool,
      thresholdStep: verifyNumber,
      backgroundColor: verifyString,
      autoDownsample: verifyNumber,
      setDownloadGraph: verifyFunction,
      setDownloadGraphDiv: verifyString,
      hover: verifyFunction,
      click: verifyFunction,
      colors: verifyColors,
    };

    for (let key in options) {
      if (
        key in this.options &&
        verifyOptions[key](options[key]) &&
        options[key] !== undefined
      ) {
        if (key === "colors") {
          let colors = JSON.parse(JSON.stringify(options.colors));
          this.options[key] = colors.map((c) => {
            if (Array.isArray(c.color)) {
              c.rgba = JSON.parse(JSON.stringify(c.color));
              c.color = convertToHex(c.color);
            } else {
              c.rgba = convertToRGB(c.color);
            }
            return c;
          });
        } else {
          this.options[key] = options[key];
        }
      }
    }

    if (!("marginLeft" in options))
      this.options.marginLeft = this.options.fontSize * 4 + 10;
    if (!("marginRight" in options)) {
      if (this.options.legendRight) {
        this.options.marginRight = this.options.fontSize * 5 + 12;
      } else {
        this.options.marginRight = 10;
      }
    }
    if (!("marginBottom" in options))
      this.options.marginBottom = this.options.fontSize * 3 + 10;
    if (!("marginTop" in options)) {
      if (this.options.title) {
        this.options.marginTop = this.options.fontSize + 2;
      } else {
        this.options.marginTop = 10;
      }
    }

    if (this.options.setDownloadGraph) {
      this.options.setDownloadGraph(() => this._downloadGraph());
    }

    if (this.options.setDownloadGraphDiv) {
      select("#" + this.options.setDownloadGraphDiv).on("click", () =>
        this._downloadGraph()
      );
    }

    timeFormatDefaultLocale(languageOptions(this.options.language));

    this._colorCache = new Map();
  }
  _dataExtents() {
    var xFileDomain = [];
    var yFileDomain = [];
    var zFileDomain = [];
    for (var h = 0; h < this._data.length; h++) {
      let xext = extent(this._data[h].x);
      let yext = extent(this._data[h].y);
      if (
        !xFileDomain.map((x) => x[0]).includes(xext[0]) ||
        !xFileDomain.map((x) => x[1]).includes(xext[1])
      ) {
        xFileDomain.push(xext);
      }
      if (
        !yFileDomain.map((y) => y[0]).includes(yext[0]) ||
        !yFileDomain.map((y) => y[1]).includes(yext[1])
      ) {
        yFileDomain.push(yext);
      }

      zFileDomain.push(
        extent(
          [].concat.apply([], this._data[h].z).filter((f) => {
            return !isNaN(parseFloat(f)) && isFinite(f);
          })
        )
      );
    }
    this._xDomain = getDomain(xFileDomain);
    this._yDomain = getDomain(yFileDomain);
    this._zDomain = getDomain(zFileDomain);
    this._xFileDomain = xFileDomain;
    this._yFileDomain = yFileDomain;
    this._zFileDomain = zFileDomain;
  }
  _setViewport() {
    this._width = select("#" + this._div)
      .node()
      .getBoundingClientRect().width;
    this._height =
      select("#" + this._div)
        .node()
        .getBoundingClientRect().height - 5;
    this._canvasWidth = Math.floor(
      this._width - this.options.marginLeft - this.options.marginRight
    );
    this._canvasHeight = Math.floor(
      this._height - this.options.marginTop - this.options.marginBottom
    );
  }
  _addCanvas() {
    var left = "0px";
    if (this.options.contour) left = "1px";
    this._canvas = select("#" + this._div)
      .append("canvas")
      .attr("width", this._canvasWidth)
      .attr("height", this._canvasHeight)
      .style("margin-left", this.options.marginLeft + "px")
      .style("margin-top", this.options.marginTop + "px")
      .style("pointer-events", "none")
      .style("z-index", 1)
      .style("position", "absolute")
      .style("left", left)
      .style("cursor", "grab")
      .attr("id", "canvas_" + this._div)
      .attr("class", "canvas-plot");
    this._context = this._canvas.node().getContext("2d");
  }
  _addSVG() {
    this._svg = select("#" + this._div)
      .append("svg")
      .attr("id", "svg_" + this._div)
      .attr("width", this._width)
      .style("z-index", 2)
      .style("position", "absolute")
      .attr("height", this._height)
      .append("g")
      .attr(
        "transform",
        "translate(" +
          this.options.marginLeft +
          "," +
          this.options.marginTop +
          ")"
      );
  }
  _addXAxis() {
    var ax;
    var xrange = [0, this._canvasWidth];
    var xAxisLabel =
      "" +
      (this.options.xLabel ? this.options.xLabel : "") +
      (this.options.xUnit ? " (" + this.options.xUnit + ")" : "");
    if (this.options.xReverse) xrange = [this._canvasWidth, 0];
    if (this._xTime) {
      xAxisLabel = "";
      ax = scaleTime().range(xrange).domain(this._xDomain);
    } else if (this.options.xLog) {
      ax = scaleLog().range(xrange).domain(this._xDomain);
    } else {
      ax = scaleLinear().range(xrange).domain(this._xDomain);
    }
    var ref = ax.copy();
    var base = ax.copy();
    var axis = axisBottom(ax).ticks(3);
    if (this._xTime) {
      axis.tickFormat(multiFormat);
    } else if (scientificNotation(this._xDomain[0], this._xDomain[1])) {
      axis.tickFormat(format(".1e"));
    }

    var g = this._svg
      .append("g")
      .attr("class", "x axis")
      .attr("id", "axis--x")
      .attr("transform", "translate(0," + this._canvasHeight + ")")
      .style("font-size", `${this.options.fontSize}px`)
      .call(axis);

    if (xAxisLabel !== "") {
      this._svg
        .append("text")
        .attr(
          "transform",
          "translate(" +
            this._canvasWidth / 2 +
            " ," +
            (this._canvasHeight + this.options.marginBottom / 1.5) +
            ")"
        )
        .attr("x", 6)
        .attr("dx", `${this.options.fontSize}px`)
        .style("font-size", `${this.options.fontSize}px`)
        .style("text-anchor", "end")
        .text(xAxisLabel);
    }
    this._xAxis = { ax, ref, base, axis, g };
  }
  _addYAxis() {
    var ax;
    var yrange = [this._canvasHeight, 0];
    var yAxisLabel =
      "" +
      (this.options.yLabel ? this.options.yLabel : "") +
      (this.options.yUnit ? " (" + this.options.yUnit + ")" : "");
    if (this.options.yReverse) yrange = [0, this._canvasHeight];
    if (this._yTime) {
      yAxisLabel = "";
      ax = scaleTime().range(yrange).domain(this._yDomain);
    } else if (this.options.yLog) {
      ax = scaleLog().range(yrange).domain(this._yDomain);
    } else {
      ax = scaleLinear().range(yrange).domain(this._yDomain);
    }
    var ref = ax.copy();
    var base = ax.copy();
    var axis = axisLeft(ax).ticks(3);
    if (this._yTime) {
      axis.tickFormat(multiFormat);
    } else if (scientificNotation(this._yDomain[0], this._yDomain[1])) {
      axis.tickFormat(format(".1e"));
    }

    var g = this._svg
      .append("g")
      .attr("class", "y axis")
      .attr("id", "axis--y")
      .style("font-size", `${this.options.fontSize}px`)
      .call(axis);

    if (yAxisLabel !== "") {
      this._svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - this.options.marginLeft)
        .attr("x", 0 - this._canvasHeight / 2)
        .attr("dy", `${this.options.fontSize}px`)
        .style("font-size", `${this.options.fontSize}px`)
        .style("text-anchor", "middle")
        .text(yAxisLabel);
    }
    this._yAxis = { ax, ref, base, axis, g };
  }
  _addTitle() {
    if (this.options.title === false) return;
    this._svg
      .append("text")
      .attr("x", this._canvasWidth / 2)
      .attr("y", 2 - this.options.marginTop / 2)
      .attr("id", "title_" + this._div)
      .attr("text-anchor", "middle")
      .style("font-size", `${this.options.fontSize}px`)
      .style("text-decoration", "underline")
      .style("opacity", "0")
      .text(this.options.title);
  }
  _addBackground() {
    if (this.options.backgroundColor === false) return;
    select("#" + this._div)
      .append("svg")
      .attr("id", "background_" + this._div)
      .attr("width", this._width)
      .style("z-index", 0)
      .style("position", "absolute")
      .attr("height", this._height)
      .append("g")
      .append("rect")
      .attr("x", 1)
      .attr("width", this._width)
      .attr("height", this._height)
      .attr("fill", this.options.backgroundColor);
  }
  _addLegendRight() {
    if (this.options.legendRight === false) return;
    var defs = this._svg.append("defs");
    var decimal_places = 100;
    var { zMin, zMax } = this._zBounds();
    if (zMax - zMin < 0.1) decimal_places = 1000;
    if (zMax - zMin < 0.01) decimal_places = 10000;
    var t1 = Math.round(zMax * decimal_places) / decimal_places,
      t5 = Math.round(zMin * decimal_places) / decimal_places,
      t3 = Math.round(((t1 + t5) / 2) * decimal_places) / decimal_places,
      t2 = Math.round(((t1 + t3) / 2) * decimal_places) / decimal_places,
      t4 = Math.round(((t3 + t5) / 2) * decimal_places) / decimal_places;

    if (scientificNotation(zMin, zMax)) {
      t1 = t1.toExponential();
      t2 = t2.toExponential();
      t3 = t3.toExponential();
      t4 = t4.toExponential();
      t5 = t5.toExponential();
    }

    var svgGradient = defs
      .append("linearGradient")
      .attr("id", "svgGradient_" + this._div)
      .attr("x1", "0")
      .attr("x2", "0")
      .attr("y1", "0")
      .attr("y2", "1");

    for (var g = this.options.colors.length - 1; g > -1; g--) {
      svgGradient
        .append("stop")
        .attr("class", "end")
        .attr("offset", 1 - this.options.colors[g].point)
        .attr("stop-color", this.options.colors[g].color)
        .attr("stop-opacity", 1);
    }

    this._svg
      .append("g")
      .append("rect")
      .attr("width", this.options.marginRight / 6)
      .attr("height", this._canvasHeight)
      .attr("x", this._canvasWidth + this.options.marginRight / 6)
      .attr("y", 0)
      .attr("fill", `url(#svgGradient_${this._div})`);

    this._svg
      .append("text")
      .attr("x", this._canvasWidth + 2 + this.options.marginRight / 3)
      .attr("y", 10)
      .style("font-size", `${this.options.fontSize}px`)
      .text(t1);

    this._svg
      .append("text")
      .attr("x", this._canvasWidth + 2 + this.options.marginRight / 3)
      .attr("y", this._canvasHeight * 0.25 + 3)
      .style("font-size", `${this.options.fontSize}px`)
      .text(t2);

    this._svg
      .append("text")
      .attr("x", this._canvasWidth + 2 + this.options.marginRight / 3)
      .attr("y", this._canvasHeight * 0.75 + 3)
      .style("font-size", `${this.options.fontSize}px`)
      .text(t4);

    this._svg
      .append("text")
      .attr("x", this._canvasWidth + 2 + this.options.marginRight / 3)
      .attr("y", this._canvasHeight)
      .style("font-size", `${this.options.fontSize}px`)
      .text(t5);

    if (this.options.zLabel) {
      var zAxisLabel =
        this.options.zLabel +
        (this.options.zUnit ? " (" + this.options.zUnit + ")" : "");
      this._svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", this._canvasWidth + this.options.marginRight - 5)
        .attr("x", 0 - this._canvasHeight / 2)
        .attr("dz", "1em")
        .style("text-anchor", "middle")
        .style("font-size", `${this.options.fontSize}px`)
        .text(zAxisLabel);
    }
  }
  _downloadGraph = () => {
    var title = select("#title_" + this._div);
    title.style("opacity", "1");
    var s = new XMLSerializer();
    var str = s.serializeToString(document.getElementById("svg_" + this._div));

    var canvasout = document.createElement("canvas"),
      contextout = canvasout.getContext("2d");

    canvasout.width = this._width;
    canvasout.height = this._height;
    var { marginLeft, marginTop } = this.options;
    var div = this._div;

    var image = new Image();
    image.onerror = function () {
      alert("Appologies .png download failed. Please download as .svg.");
    };
    image.onload = function () {
      contextout.drawImage(image, 0, 0);
      contextout.drawImage(
        document.getElementById("canvas_" + div),
        marginLeft,
        marginTop
      );
      var a = document.createElement("a");
      a.download = "heatmap_" + div + ".png";
      a.href = canvasout.toDataURL("image/png");
      a.click();
    };
    image.src = "data:image/svg+xml;charset=utf8," + encodeURIComponent(str);
    title.style("opacity", "0");
  };
  _addTooltip() {
    if (this.options.tooltip === false) return;
    var { zMin, zMax } = this._zBounds();
    var tooltip = select("#" + this._div)
      .append("div")
      .style("opacity", 0)
      .style("z-index", 2)
      .style("pointer-events", "none")
      .attr("id", "tooltip_" + this._div)
      .attr("class", "tooltip");

    // Add axis locators
    var symbolGenerator = symbol().type(symbolTriangle).size(25);
    this._svg
      .append("g")
      .attr("transform", "rotate(90)")
      .append("g")
      .style("opacity", 0)
      .attr("id", "zpointer_" + this._div)
      .attr(
        "transform",
        "translate(" +
          this._canvasHeight +
          ",-" +
          (this._canvasWidth - 16 + this.options.marginRight / 3) +
          ")"
      )
      .append("path")
      .attr("d", symbolGenerator());

    // Add vertical point identifier
    var vpi = this._svg
      .append("g")
      .style("opacity", 0)
      .style("pointer-events", "none")
      .attr("id", "xline_" + this._div);
    if (this.options.levels)
      vpi
        .append("line")
        .attr("y1", 0)
        .attr("y2", this._canvasHeight)
        .style("stroke-width", 1)
        .style("stroke", "white")
        .style("fill", "none");

    var lang = languageOptions(this.options.language);

    this._zoombox.on("mousemove", (event) => {
      try {
        var rect = event.currentTarget.getBoundingClientRect();
        var hoverX = event.clientX - rect.left;
        var hoverY = event.clientY - rect.top;

        var xValue = this._xAxis.ax.invert(hoverX);
        var yValue = this._yAxis.ax.invert(hoverY);

        var idx = Math.max(
          getFileIndex(this._xFileDomain, xValue),
          getFileIndex(this._yFileDomain, yValue)
        );
        var process = this._data[idx];

        var xi = closest(xValue, process.x);
        var yi = closest(yValue, process.y);

        var xval, yval;
        var xu = "";
        var yu = "";
        var zu = "";
        var zval = process.z[yi][xi];

        if (this._xTime) {
          xval = formatDate(process.x[xi], lang);
        } else {
          xval = formatNumber(process.x[xi]);
          if (typeof this.options.xUnit === "string") xu = this.options.xUnit;
        }

        if (this._yTime) {
          yval = formatDate(process.y[yi], lang);
        } else {
          yval = formatNumber(process.y[yi]);
          if (typeof this.options.yUnit === "string") yu = this.options.yUnit;
        }

        if (typeof this.options.zUnit === "string") zu = this.options.zUnit;

        var html =
          "<table><tbody>" +
          `<tr><td>x:</td><td>${xval} ${xu}</td></tr>` +
          `<tr><td>y:</td><td>${yval} ${yu}</td></tr>` +
          `<tr><td>z:</td><td>${formatNumber(
            zval,
            this.options.decimalPlaces
          )} ${zu}</td></tr>` +
          "</tbody></table>";

        if (hoverX > this._width / 2) {
          tooltip
            .html(html)
            .style(
              "right",
              this._width -
                this._xAxis.ax(process.x[xi]) -
                this.options.marginLeft +
                10 +
                "px"
            )
            .style("left", "auto")
            .style(
              "top",
              this._yAxis.ax(process.y[yi]) + this.options.marginTop - 20 + "px"
            )
            .attr("class", "tooltip tooltip-right")
            .style("opacity", 1);
        } else {
          tooltip
            .html(html)
            .style(
              "left",
              this._xAxis.ax(process.x[xi]) +
                this.options.marginLeft +
                10 +
                "px"
            )
            .style("right", "auto")
            .style(
              "top",
              this._yAxis.ax(process.y[yi]) + this.options.marginTop - 20 + "px"
            )
            .attr("class", "tooltip tooltip-left")
            .style("opacity", 1);
        }

        select("#zpointer_" + this._div)
          .attr(
            "transform",
            "translate(" +
              ((zval - zMax) / (zMin - zMax)) * this._canvasHeight +
              ",-" +
              (this._canvasWidth - 16 + this.options.marginRight / 3) +
              ")"
          )
          .style("opacity", 1);
        if (this.options.hover)
          this.options.hover({ mousex: xi, mousey: yi, idx });

        // Add vertical point identifier
        if (this.options.levels) {
          vpi.selectAll("circle").remove();
          for (var yp of process.y) {
            if (
              this._yAxis.ax(yp) >= 0 &&
              this._yAxis.ax(yp) <= this._canvasHeight
            ) {
              vpi
                .append("circle")
                .attr("cy", this._yAxis.ax(yp))
                .attr("r", 2)
                .style("fill", "white");
            }
          }
          vpi
            .attr(
              "transform",
              "translate(" +
                this._xAxis.ax(process.x[xi]) +
                this.options.marginLeft +
                10 +
                ",0)"
            )
            .style("opacity", 0.7);
        }
      } catch (e) {
        vpi.style("opacity", 0);
        tooltip.style("opacity", 0);
        select("#zpointer_" + this._div).style("opacity", 0);
        if (this.options.hover)
          this.options.hover({ mousex: false, mousey: false });
      }
    });

    this._zoombox.on("click", (event) => {
      try {
        var hoverX = this._xAxis.ax.invert(
          event.layerX - this.options.marginLeft ||
            event.offsetX - this.options.marginLeft
        );
        var hoverY = this._yAxis.ax.invert(
          event.layerY - this.options.marginTop ||
            event.offsetY - this.options.marginTop
        );
        var idx = Math.max(
          getFileIndex(this._xFileDomain, hoverX),
          getFileIndex(this._yFileDomain, hoverY)
        );
        var process = this._data[idx];
        var yi = closest(hoverY, process.y);
        var xi = closest(hoverX, process.x);
        if (this.options.click)
          this.options.click({ mousex: xi, mousey: yi, idx });
      } catch (e) {
        if (this.options.click)
          this.options.click({ mousex: false, mousey: false });
      }
    });

    this._zoombox.on("mouseout", () => {
      vpi.style("opacity", 0);
      tooltip.style("opacity", 0);
      select("#zpointer_" + this._div).style("opacity", 0);
      if (this.options.hover)
        this.options.hover({ mousex: false, mousey: false });
    });
    this._tooltip = tooltip;
    this._vpi = vpi;
  }
  _addZoom() {
    this._zoom = d3zoom()
      .extent([
        [0, 0],
        [this._canvasWidth, this._canvasHeight],
      ])
      .on("zoom", (event) => this._normalzoom(event));

    var zoomx = d3zoom()
      .extent([
        [0, 0],
        [this._canvasWidth, this._canvasHeight],
      ])
      .on("zoom", (event) => this._normalzoomx(event));

    var zoomy = d3zoom()
      .extent([
        [0, 0],
        [this._canvasWidth, this._canvasHeight],
      ])
      .on("zoom", (event) => this._normalzoomy(event));

    this._zoombox = this._svg
      .append("rect")
      .attr("id", "zoombox_" + this._div)
      .attr("width", this._canvasWidth)
      .attr("height", this._canvasHeight)
      .style("fill", "none")
      .style("cursor", "pointer")
      .attr("pointer-events", "all")
      .call(this._zoom);

    this._zoomboxx = this._svg
      .append("rect")
      .attr("id", "zoomboxx_" + this._div)
      .attr("width", this._canvasWidth)
      .attr("height", this.options.marginBottom)
      .style("fill", "none")
      .style("cursor", "col-resize")
      .attr("pointer-events", "all")
      .attr("y", this._canvasHeight)
      .call(zoomx);

    this._zoomboxy = this._svg
      .append("rect")
      .attr("id", "zoomboxy_" + this._div)
      .attr("width", this.options.marginLeft)
      .attr("height", this._canvasHeight)
      .style("fill", "none")
      .style("cursor", "row-resize")
      .attr("pointer-events", "all")
      .attr("x", -this.options.marginLeft)
      .call(zoomy);

    this._zoombox.on("dblclick.zoom", null).on("dblclick", () => {
      this._xAxis.ax = this._xAxis.base;
      this._yAxis.ax = this._yAxis.base;
      this._xAxis.ref = this._xAxis.base;
      this._yAxis.ref = this._yAxis.base;
      this._yAxis.axis.scale(this._yAxis.base);
      this._yAxis.g.call(this._yAxis.axis);
      this._xAxis.axis.scale(this._xAxis.base);
      this._xAxis.g.call(this._xAxis.axis);
      this._plot();
    });
    this._zoomboxx.on("dblclick.zoom", null);
    this._zoomboxy.on("dblclick.zoom", null);
  }
  _normalzoom(event) {
    let t = event.transform;
    if (t !== zoomIdentity) {
      this._xAxis.ax = t.rescaleX(this._xAxis.ref);
      this._xAxis.axis.scale(this._xAxis.ax);
      this._xAxis.g.call(this._xAxis.axis);
      this._yAxis.ax = t.rescaleY(this._yAxis.ref);
      this._yAxis.axis.scale(this._yAxis.ax);
      this._yAxis.g.call(this._yAxis.axis);
      this._plot();
      this._xAxis.ref = this._xAxis.ax;
      this._yAxis.ref = this._yAxis.ax;
      this._zoombox.call(this._zoom.transform, zoomIdentity);
    }
  }
  _normalzoomx(event) {
    let t = event.transform;
    if (t !== zoomIdentity) {
      this._xAxis.ax = t.rescaleX(this._xAxis.ref);
      this._xAxis.axis.scale(this._xAxis.ax);
      this._xAxis.g.call(this._xAxis.axis);
      this._plot();
      this._xAxis.ref = this._xAxis.ax;
      this._zoomboxx.call(this._zoom.transform, zoomIdentity);
    }
  }
  _normalzoomy(event) {
    let t = event.transform;
    if (t !== zoomIdentity) {
      this._yAxis.ax = t.rescaleY(this._yAxis.ref);
      this._yAxis.axis.scale(this._yAxis.ax);
      this._yAxis.g.call(this._yAxis.axis);
      this._plot();
      this._yAxis.ref = this._yAxis.ax;
      this._zoomboxy.call(this._zoom.transform, zoomIdentity);
    }
  }
  _zBounds() {
    var zMin = this._zDomain[0];
    var zMax = this._zDomain[1];
    if (this.options.zMin) zMin = this.options.zMin;
    if (this.options.zMax) zMax = this.options.zMax;
    return { zMin, zMax };
  }
  _canvasContour() {
    var { zMin, zMax } = this._zBounds();
    canvasContour(
      this._contour,
      this._xAxis.ax,
      this._yAxis.ax,
      this._context,
      {
        zMin,
        zMax,
        xTime: this._xTime,
        yTime: this._yTime,
        colorCache: this._colorCache,
        canvasHeight: this._canvasHeight,
        canvasWidth: this._canvasWidth,
        colors: this.options.colors,
        yReverse: this.options.yReverse,
        xReverse: this.options.xReverse,
      },
      this._prepContours
    );
  }
  _canvasGrid() {
    var { zMin, zMax } = this._zBounds();
    canvasGrid(
      this._data,
      this._xAxis.ax,
      this._yAxis.ax,
      this._xDomain,
      this._yDomain,
      this._context,
      {
        zMin,
        zMax,
        xTime: this._xTime,
        yTime: this._yTime,
        colorCache: this._colorCache,
        canvasHeight: this._canvasHeight,
        canvasWidth: this._canvasWidth,
        colors: this.options.colors,
        yReverse: this.options.yReverse,
        xReverse: this.options.xReverse,
      }
    );
  }
}

export default CanvasHeatmap;
