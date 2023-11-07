import React, { Component } from "react";
import L from "leaflet";
import * as d3 from "d3";
import "leaflet-draw";
import "leaflet-contour";
import "leaflet-streamlines";
import "./leaflet_vectorField";
import "./leaflet_customcontrol";
import "./leaflet_colorpicker";
import "leaflet.markercluster";
import "./css/markercluster.css";
import "./css/markerclusterdefault.css";
import { basemaps } from "../../config.json";
import { getColor } from "../../components/gradients/gradients";
import "./css/leaflet.css";
import measurement from "../../img/measurement.svg";
import model from "../../img/model.svg";
import satellite from "../../img/satellite.svg";

class Basemap extends Component {
  isInt = (value) => {
    if (/^[-+]?(\d+|Infinity)$/.test(value)) {
      return true;
    } else {
      return false;
    }
  };

  zoomIn = () => {
    this.map.setZoom(this.map.getZoom() + 1);
  };

  zoomOut = () => {
    this.map.setZoom(this.map.getZoom() - 1);
  };

  hoverOver = (e) => {
    this.props.hoverFunc(e.target, "over");
  };

  hoverOut = (e) => {
    this.props.hoverFunc(e.target, "out");
  };

  CHtoWGSlatlng = (yx) => {
    var y_aux = (yx[0] - 600000) / 1000000;
    var x_aux = (yx[1] - 200000) / 1000000;
    var lat =
      16.9023892 +
      3.238272 * x_aux -
      0.270978 * Math.pow(y_aux, 2) -
      0.002528 * Math.pow(x_aux, 2) -
      0.0447 * Math.pow(y_aux, 2) * x_aux -
      0.014 * Math.pow(x_aux, 3);
    var lng =
      2.6779094 +
      4.728982 * y_aux +
      0.791484 * y_aux * x_aux +
      0.1306 * y_aux * Math.pow(x_aux, 2) -
      0.0436 * Math.pow(y_aux, 3);
    lat = (lat * 100) / 36;
    lng = (lng * 100) / 36;

    return [lat, lng];
  };

  UTMtoWGSlatlng = (yx, zoneNum = 32) => {
    const easting = yx[0];
    const northing = yx[1];
    var K0 = 0.9996;

    var E = 0.00669438;
    var E2 = Math.pow(E, 2);
    var E3 = Math.pow(E, 3);
    var E_P2 = E / (1 - E);

    var SQRT_E = Math.sqrt(1 - E);
    var _E = (1 - SQRT_E) / (1 + SQRT_E);
    var _E2 = Math.pow(_E, 2);
    var _E3 = Math.pow(_E, 3);
    var _E4 = Math.pow(_E, 4);
    var _E5 = Math.pow(_E, 5);

    var M1 = 1 - E / 4 - (3 * E2) / 64 - (5 * E3) / 256;
    // var M2 = (3 * E) / 8 + (3 * E2) / 32 + (45 * E3) / 1024;
    // var M3 = (15 * E2) / 256 + (45 * E3) / 1024;
    // var M4 = (35 * E3) / 3072;

    var P2 = (3 / 2) * _E - (27 / 32) * _E3 + (269 / 512) * _E5;
    var P3 = (21 / 16) * _E2 - (55 / 32) * _E4;
    var P4 = (151 / 96) * _E3 - (417 / 128) * _E5;
    var P5 = (1097 / 512) * _E4;

    var R = 6378137;
    var x = easting - 500000;
    var y = northing;

    var m = y / K0;
    var mu = m / (R * M1);

    var pRad =
      mu +
      P2 * Math.sin(2 * mu) +
      P3 * Math.sin(4 * mu) +
      P4 * Math.sin(6 * mu) +
      P5 * Math.sin(8 * mu);

    var pSin = Math.sin(pRad);
    var pSin2 = Math.pow(pSin, 2);

    var pCos = Math.cos(pRad);

    var pTan = Math.tan(pRad);
    var pTan2 = Math.pow(pTan, 2);
    var pTan4 = Math.pow(pTan, 4);

    var epSin = 1 - E * pSin2;
    var epSinSqrt = Math.sqrt(epSin);

    var n = R / epSinSqrt;
    var r = (1 - E) / epSin;

    var c = _E * pCos * pCos;
    var c2 = c * c;

    var d = x / (n * K0);
    var d2 = Math.pow(d, 2);
    var d3 = Math.pow(d, 3);
    var d4 = Math.pow(d, 4);
    var d5 = Math.pow(d, 5);
    var d6 = Math.pow(d, 6);

    var latitude =
      pRad -
      (pTan / r) *
        (d2 / 2 - (d4 / 24) * (5 + 3 * pTan2 + 10 * c - 4 * c2 - 9 * E_P2)) +
      (d6 / 720) *
        (61 + 90 * pTan2 + 298 * c + 45 * pTan4 - 252 * E_P2 - 3 * c2);
    var longitude =
      (d -
        (d3 / 6) * (1 + 2 * pTan2 + c) +
        (d5 / 120) *
          (5 - 2 * c + 28 * pTan2 - 3 * c2 + 8 * E_P2 + 24 * pTan4)) /
      pCos;

    return [
      (latitude / Math.PI) * 180,
      (longitude / Math.PI) * 180 + (zoneNum - 1) * 6 - 180 + 3,
    ];
  };

  movingAverage = (data, size) => {
    function pointsInRadius(quadtree, x, y, radius) {
      const result = [];
      var filter;
      const radius2 = radius * radius;
      const accept = filter
        ? (d) => filter(d) && result.push(d)
        : (d) => result.push(d);
      quadtree.visit(function (node, x1, y1, x2, y2) {
        if (node.length) {
          return (
            x1 >= x + radius ||
            y1 >= y + radius ||
            x2 < x - radius ||
            y2 < y - radius
          );
        }
        const dx = +quadtree._x.call(null, node.data) - x,
          dy = +quadtree._y.call(null, node.data) - y;
        if (dx * dx + dy * dy < radius2) {
          do {
            accept(node.data);
          } while ((node = node.next));
        }
      });
      return result;
    }

    function medianofpoints(points) {
      var arr = points.map((p) => p[2]);
      arr.sort(function (a, b) {
        return a - b;
      });
      var half = Math.floor(arr.length / 2);
      if (arr.length % 2) return arr[half];
      return (arr[half - 1] + arr[half]) / 2.0;
    }

    var { lon, lat, lonres, latres, v } = data;
    var radius = Math.max(lonres, latres) * size;
    var outdata = JSON.parse(JSON.stringify(v));

    let quadtreedata = [];
    for (var j = 0; j < v.length; j++) {
      quadtreedata.push([lat[j], lon[j], v[j]]);
    }

    let min_x = Math.min(...lat);
    let min_y = Math.min(...lon);
    let max_x = Math.max(...lat);
    let max_y = Math.max(...lon);

    let quadtree = d3
      .quadtree()
      .extent([
        [min_x, min_y],
        [max_x, max_y],
      ])
      .addAll(quadtreedata);

    for (var i = 0; i < outdata.length; i++) {
      outdata[i] = medianofpoints(
        pointsInRadius(quadtree, lat[i], lon[i], radius)
      );
    }

    return outdata;
  };

  remoteSensing = async (layer, file) => {
    var { mindatetime } = file;
    var { min, max, unit, data, movingAverage, validpixelexpression, colors } =
      layer;
    var url = "https://www.datalakes-eawag.ch/datadetail/" + layer.datasets_id;
    data = JSON.parse(JSON.stringify(data));
    if ("vp" in data && validpixelexpression) {
      for (let i = data.vp.length - 1; i >= 0; i--) {
        if (data.vp[i] === 1) {
          data.v.splice(i, 1);
          data.lon.splice(i, 1);
          data.lat.splice(i, 1);
        }
      }
    }
    var polygons = [];
    var coords;
    var x = data.lonres / 2;
    var y = data.latres / 2;
    var plotdata;
    if (this.isInt(movingAverage)) {
      plotdata = this.movingAverage(data, movingAverage);
    } else {
      plotdata = data.v;
    }
    for (let i = 0; i < data.lon.length; i++) {
      coords = [
        [data.lat[i] - y, data.lon[i] - x],
        [data.lat[i] + y, data.lon[i] - x],
        [data.lat[i] + y, data.lon[i] + x],
        [data.lat[i] - y, data.lon[i] + x],
      ];
      var value = Math.round(plotdata[i] * 1000) / 1000;
      var valuestring = String(value) + String(unit);
      var pixelcolor = getColor(plotdata[i], min, max, colors);
      polygons.push(
        L.polygon(coords, {
          color: pixelcolor,
          fillColor: pixelcolor,
          fillOpacity: 1,
          title: valuestring,
        })
          .bindPopup(
            `<div><div class="popup-title">${
              layer.title
            }</div><div class="popup-desc">${
              layer.description
            }</div><div class="popup-detail"><a href="${url}" target="_blank" rel="noopener noreferrer"><button>View Dataset</button></a></div><div class="popup-date">${this.parseDatetime(
              mindatetime
            )}</div><div class="popup-values"><div class="popup-param">${
              data.lat[i]
            }, ${
              data.lon[i]
            }</div><div class="popup-value">${value} <div class="popup-unit">${unit}</div></div><div class="popup-param">${
              layer.name
            }</div><div></div>`,
            { className: "datasetsPopup" }
          )
          .bindTooltip(valuestring, {
            permanent: false,
            direction: "top",
            className: "basic-tooltip",
            opacity: 1,
          })
      );
    }
    this.raster.push(L.layerGroup(polygons).addTo(this.map));
  };

  swapCoord = (arr) => {
    var newArr = [];
    for (var i = 0; i < arr.length; i++) {
      newArr.push([arr[i][1], arr[i][0]]);
    }
    return newArr;
  };

  findFeature = (features, key) => {
    return features.find((f) => parseInt(f.properties.id) === parseInt(key));
  };

  simstrat = async (layer, file) => {
    var { min, max, data } = layer;
    var layerData, outdate;
    var url = "https://www.datalakes-eawag.ch/datadetail/" + layer.datasets_id;
    if (Object.keys(data).includes("time")) {
      var { lakejson, datetime } = this.props;
      var di = this.indexClosest(datetime.getTime() / 1000, data["time"]);
      outdate = new Date(data["time"][di] * 1000);
      var value, name, latlng;
      layerData = [];
      var type = "surface";
      if (layer.parameters_id === 56) {
        type = "bottom";
      }
      for (var key in data) {
        var lakefeature = this.findFeature(lakejson.features, key);
        if (typeof lakefeature !== "undefined") {
          value = data[key][type][di];
          name = lakefeature.properties.Name;
          latlng = this.swapCoord(lakefeature.geometry.coordinates[0]);
          layerData.push({ value, name, latlng });
        }
      }
    } else {
      layerData = JSON.parse(JSON.stringify(data));
      outdate = file.maxdatetime;
    }
    var polygons = [];
    for (var i = 0; i < layerData.length; i++) {
      var pixelcolor = getColor(layerData[i].value, min, max, layer.colors);
      var valuestring = String(layerData[i].value) + "°C";
      polygons.push(
        L.polygon(layerData[i].latlng, {
          color: pixelcolor,
          fillColor: pixelcolor,
          fillOpacity: 0.8,
          title: layerData[i].value,
        })
          .bindPopup(
            `<div><div class="popup-title">${
              layer.title
            }</div><div class="popup-desc">${
              layer.description
            }</div><div class="popup-detail"><a href="${url}" target="_blank" rel="noopener noreferrer"><button>View Dataset</button></a></div><div class="popup-date">${this.parseDatetime(
              outdate
            )}</div><div class="popup-values"><div class="popup-param">${
              layerData[i].name
            }</div><div class="popup-value">${
              layerData[i].value
            } <div class="popup-unit">°C</div></div><div class="popup-param">${
              layer.name
            }</div><div></div>`,
            { className: "datasetsPopup" }
          )
          .bindTooltip(valuestring, {
            permanent: false,
            direction: "top",
            className: "basic-tooltip",
            opacity: 1,
          })
      );
    }
    this.raster.push(L.layerGroup(polygons).addTo(this.map));
  };

  delft3dToJavascriptDatetime = (date) => {
    const out = new Date(2008, 2, 1, 0, 0, 0);
    out.setTime(out.getTime() + date * 1000);
    return out;
  };

  getCellCorners = (data, i, j, locationformat) => {
    function cellCorner(center, opposite, left, right) {
      if (
        center[0] !== null &&
        opposite[0] !== null &&
        left[0] !== null &&
        right[0] !== null
      ) {
        let x = (opposite[0] + left[0] + right[0] + center[0]) / 4;
        let y = (opposite[1] + left[1] + right[1] + center[1]) / 4;
        return [x, y];
      } else {
        return false;
      }
    }

    function oppositePoint(center, corner) {
      let x = center[0] + center[0] - corner[0];
      let y = center[1] + center[1] - corner[1];
      return [x, y];
    }
    // TopLeft
    var tl = cellCorner(
      [data["x"]["data"][i][j], data["y"]["data"][i][j]],
      [data["x"]["data"][i - 1][j - 1], data["y"]["data"][i - 1][j - 1]],
      [data["x"]["data"][i][j - 1], data["y"]["data"][i][j - 1]],
      [data["x"]["data"][i - 1][j], data["y"]["data"][i - 1][j]]
    );
    // BottomLeft
    var bl = cellCorner(
      [data["x"]["data"][i][j], data["y"]["data"][i][j]],
      [data["x"]["data"][i + 1][j - 1], data["y"]["data"][i + 1][j - 1]],
      [data["x"]["data"][i + 1][j], data["y"]["data"][i + 1][j]],
      [data["x"]["data"][i][j - 1], data["y"]["data"][i][j - 1]]
    );
    // BottomRight
    var br = cellCorner(
      [data["x"]["data"][i][j], data["y"]["data"][i][j]],
      [data["x"]["data"][i + 1][j + 1], data["y"]["data"][i + 1][j + 1]],
      [data["x"]["data"][i][j + 1], data["y"]["data"][i][j + 1]],
      [data["x"]["data"][i + 1][j], data["y"]["data"][i + 1][j]]
    );
    // TopRight
    var tr = cellCorner(
      [data["x"]["data"][i][j], data["y"]["data"][i][j]],
      [data["x"]["data"][i - 1][j + 1], data["y"]["data"][i - 1][j + 1]],
      [data["x"]["data"][i - 1][j], data["y"]["data"][i - 1][j]],
      [data["x"]["data"][i][j + 1], data["y"]["data"][i][j + 1]]
    );

    let op = [data["x"]["data"][i][j], data["y"]["data"][i][j]];

    if (!tl && br) tl = oppositePoint(op, br);
    if (!bl && tr) bl = oppositePoint(op, tr);
    if (!br && tl) br = oppositePoint(op, tl);
    if (!tr && bl) tr = oppositePoint(op, bl);
    if (tl && bl && br && tr) {
      var project = function (xy) {
        return xy;
      };
      if (locationformat === "CH1903") {
        project = this.CHtoWGSlatlng;
      } else if (locationformat === "UTM") {
        project = this.UTMtoWGSlatlng;
      }
      return [project(tl), project(bl), project(br), project(tr)];
    } else {
      return false;
    }
  };

  prepareContourData = (data, locationformat) => {
    var project = function (xy) {
      return xy;
    };
    if (locationformat === "CH1903") {
      project = this.CHtoWGSlatlng;
    } else if (locationformat === "UTM") {
      project = this.UTMtoWGSlatlng;
    }
    var x = [];
    var y = [];
    for (let i = 0; i < data["t"]["data"].length; i++) {
      var xx = [];
      var yy = [];
      for (let j = 0; j < data["t"]["data"][0].length; j++) {
        if (data["t"]["data"][i][j]) {
          let latlng = project([
            data["x"]["data"][i][j],
            data["y"]["data"][i][j],
          ]);
          xx.push(latlng[1]);
          yy.push(latlng[0]);
        } else {
          xx.push(null);
          yy.push(null);
        }
      }
      x.push(xx);
      y.push(yy);
    }
    return { x, y, z: data["t"]["data"] };
  };

  onEachContour = (info, datetime, depth, url) => {
    var parseDatetime = this.parseDatetime;
    return function onEachFeature(feature, layer) {
      layer.bindPopup(
        `<div><div class="popup-title">${
          info.title
        }</div><div class="popup-desc">${
          info.description
        }</div><div class="popup-detail"><a href="${url}" target="_blank" rel="noopener noreferrer"><button>View Dataset</button></a></div><div class="popup-date">${parseDatetime(
          datetime
        )}</div><div class="popup-values"><div class="popup-value">${String(
          feature.value.toFixed(2)
        )}</div><div class="popup-unit">${String(
          info.unit
        )}</div><div class="popup-param">Water Temperature @ ${depth}m</div><div></div>`,
        { className: "datasetsPopup" }
      );
      //layer.bindTooltip(feature.value + info.unit);
    };
  };

  threeDmodel = async (layer, file, timeformat, locationformat) => {
    var { parameters_id, data, id } = layer;
    var datetime = data["time"]["data"];
    var depth = data["depth"]["data"];
    var parseDatetime = this.parseDatetime;
    if (timeformat === "delft3d") {
      datetime = this.delft3dToJavascriptDatetime(datetime);
    } else if (timeformat === "unix") {
      datetime = new Date(datetime * 1000);
    }
    depth = Math.abs(depth).toFixed(2);
    var {
      vectorArrows,
      vectorMagnitude,
      vectorFlow,
      vectorFlowColor,
      vectorArrowColor,
      contour,
      thresholds,
      min,
      max,
      colors,
      unit,
      datasets_id,
      opacity,
    } = layer;
    var url = "https://www.datalakes-eawag.ch/datadetail/" + datasets_id;
    var polygons, i, j, coords, value, valuestring, pixelcolor;
    var map = this.map;
    if (parameters_id === 5) {
      // Temperature plot
      if (contour) {
        var contourData = this.prepareContourData(data, locationformat);
        var contours = L.contour(contourData, {
          thresholds: thresholds,
          style: (feature) => {
            return {
              color: getColor(feature.geometry.value, min, max, colors),
              opacity: 0,
              fillOpacity: 1,
            };
          },
          onEachFeature: this.onEachContour(layer, datetime, depth, url),
        });
        this.raster.push(contours.addTo(this.map));
      } else {
        polygons = [];
        for (i = 1; i < data["x"]["data"].length - 1; i++) {
          for (j = 1; j < data["x"]["data"][0].length - 1; j++) {
            if (data["t"]["data"][i][j] !== null) {
              coords = this.getCellCorners(data, i, j, locationformat);
              if (coords) {
                value = Math.round(data["t"]["data"][i][j] * 1000) / 1000;
                valuestring = String(value) + String(unit);
                pixelcolor = getColor(
                  data["t"]["data"][i][j],
                  min,
                  max,
                  colors
                );
                let lat = Math.round(coords[0][0] * 1000) / 1000;
                let lng = Math.round(coords[0][1] * 1000) / 1000;
                polygons.push(
                  L.polygon(coords, {
                    color: pixelcolor,
                    fillColor: pixelcolor,
                    fillOpacity: 1,
                    title: value,
                  })
                    .bindPopup(
                      `<div><div class="popup-title">${
                        layer.title
                      }</div><div class="popup-desc">${
                        layer.description
                      }</div><div class="popup-detail"><a href="${url}" target="_blank" rel="noopener noreferrer"><button>View Dataset</button></a></div><div class="popup-date">${parseDatetime(
                        datetime
                      )}</div><div class="popup-values"><div class="popup-param">${lat}, ${lng}</div><div class="popup-value">${String(
                        value
                      )}</div><div class="popup-unit">${String(
                        unit
                      )}</div><div class="popup-param">Water Temperature @ ${depth}m</div><div></div>`,
                      { className: "datasetsPopup" }
                    )
                    .bindTooltip(valuestring, {
                      permanent: false,
                      direction: "top",
                      className: "basic-tooltip",
                      opacity: 1,
                    })
                );
              }
            }
          }
        }
        this.raster.push(L.featureGroup(polygons).addTo(this.map));
      }
      if (
        !("center" in this.props) &&
        !("zoom" in this.props) &&
        !this.zoomedtolayer
      ) {
        this.map.fitBounds(this.raster[0].getBounds());
        this.zoomedtolayer = true;
      }
    } else if (parameters_id === 25) {
      // Velocity plot
      if (vectorMagnitude) {
        polygons = [];
        for (i = 1; i < data["x"]["data"].length - 1; i++) {
          for (j = 1; j < data["x"]["data"][0].length - 1; j++) {
            if (data["u"]["data"][i][j] !== null) {
              coords = this.getCellCorners(data, i, j, locationformat);
              if (coords) {
                let u = data["u"]["data"][i][j];
                let v = data["v"]["data"][i][j];
                var magnitude = Math.abs(
                  Math.sqrt(Math.pow(u, 2) + Math.pow(v, 2))
                );
                let deg = Math.round(
                  (Math.atan2(u / magnitude, v / magnitude) * 180) / Math.PI
                );
                if (deg < 0) deg = 360 + deg;
                value = Math.round(magnitude * 1000) / 1000;
                let html = `${value}m/s ${deg}°`;
                valuestring = String(value) + String(unit);
                pixelcolor = getColor(magnitude, min, max, colors);
                let lat = Math.round(coords[0][0] * 1000) / 1000;
                let lng = Math.round(coords[0][1] * 1000) / 1000;
                polygons.push(
                  L.polygon(coords, {
                    color: pixelcolor,
                    fillColor: pixelcolor,
                    fillOpacity: 1,
                    title: magnitude,
                  })
                    .bindPopup(
                      `<div><div class="popup-title">${
                        layer.title
                      }</div><div class="popup-desc">${
                        layer.description
                      }</div><div class="popup-detail"><a href="${url}" target="_blank" rel="noopener noreferrer"><button>View Dataset</button></a></div><div class="popup-date">${parseDatetime(
                        datetime
                      )}</div><div class="popup-values"><div class="popup-param">${lat}, ${lng}</div><div class="popup-value">${String(
                        html
                      )}</div><div class="popup-param">Water Velocity @ ${depth}m</div><div></div>`,
                      { className: "datasetsPopup" }
                    )
                    .bindTooltip(html, {
                      permanent: false,
                      direction: "top",
                      className: "basic-tooltip",
                      opacity: 1,
                    })
                );
              }
            }
          }
        }
        this.raster.push(L.layerGroup(polygons).addTo(this.map));
      }

      if (vectorArrows) {
        var arrows = L.vectorField(data, {
          vectorArrowColor,
          colors,
          min,
          max,
          size: 15,
        }).addTo(this.map);
        var arrowtooltip = arrows.bindTooltip("my tooltip text", {
          permanent: false,
          direction: "top",
          className: "basic-tooltip",
          opacity: 1,
        });
        arrows.on("mousemove", function (e) {
          let { u, v } = e.value;
          if (u && v) {
            let mag = Math.round(Math.sqrt(u ** 2 + v ** 2) * 1000) / 1000;
            let deg = Math.round(
              (Math.atan2(u / mag, v / mag) * 180) / Math.PI
            );
            if (deg < 0) deg = 360 + deg;
            let html = `${mag}m/s ${deg}°`;
            arrowtooltip._tooltip._content = html;
            arrowtooltip.openTooltip(e.latlng);
          } else {
            arrowtooltip.closeTooltip();
          }
        });
        arrows.on("click", function (e) {
          console.log("Firing", e);
          if (e.value !== null && e.value.u !== null) {
            let { u, v } = e.value;
            let { lat, lng } = e.latlng;
            lat = Math.round(lat * 1000) / 1000;
            lng = Math.round(lng * 1000) / 1000;
            let mag = Math.round(Math.sqrt(u ** 2 + v ** 2) * 1000) / 1000;
            let deg = Math.round(
              (Math.atan2(u / mag, v / mag) * 180) / Math.PI
            );
            if (deg < 0) deg = 360 + deg;
            value = Math.round(mag * 1000) / 1000;
            let inner = `${value}m/s ${deg}°`;
            let html = `<div><div class="popup-title">${
              layer.title
            }</div><div class="popup-desc">${
              layer.description
            }</div><div class="popup-detail"><a href="${url}" target="_blank" rel="noopener noreferrer"><button>View Dataset</button></a></div><div class="popup-date">${parseDatetime(
              datetime
            )}</div><div class="popup-values"><div class="popup-param">${lat}, ${lng}</div><div class="popup-value">${String(
              inner
            )}</div><div class="popup-param">Water Veloctiy @ ${depth}m</div><div></div>`;
            console.log(e.latlng);
            L.popup({ className: "datasetsPopup" })
              .setLatLng(e.latlng)
              .setContent(html)
              .openOn(map);
          }
        });
        this.raster.push(arrows);
      }

      if (vectorFlow) {
        var radius = 300;
        if (datasets_id === 14) {
          radius = 300;
        } else if (datasets_id === 17) {
          radius = 1000;
        }
        var vectordata = this.parseVectorData(data, radius, locationformat);

        var vectors;
        if (Object.keys(this.vectorfieldanim).includes(id)) {
          this.vectorfieldanim[id].updateData(vectordata.data);
          this.vectorfieldtime = this.props.datetime;
          vectors = this.vectorfieldanim[id];
        } else {
          function getLineColor(val) {
            return getColor(val, min, max, colors);
          }
          var color = "white";
          if (vectorFlowColor === "true") {
            color = getLineColor;
          } else if (["white", "grey", "black"].includes(vectorFlowColor)) {
            color = vectorFlowColor;
          }
          vectors = L.streamlines(vectordata.data, {
            paths: 5000,
            color,
            opacity,
            xMin: vectordata.xMin,
            xMax: vectordata.xMax,
            yMin: vectordata.yMin,
            yMax: vectordata.yMax,
          }).addTo(this.map);
          this.vectorfieldtime = this.props.datetime;
          this.vectorfieldanim[id] = vectors;
        }

        try {
          this.flowtooltip.closeTooltip();
        } catch (e) {}

        this.flowtooltip = vectors.bindTooltip("", {
          permanent: false,
          direction: "top",
          className: "basic-tooltip",
          opacity: 1,
        });
        var flowtooltip = this.flowtooltip;
        vectors.on("mousemove", function (e) {
          let { u, v } = e.value;
          if (u && v) {
            let mag = Math.round(Math.sqrt(u ** 2 + v ** 2) * 1000) / 1000;
            let deg = Math.round(
              (Math.atan2(u / mag, v / mag) * 180) / Math.PI
            );
            if (deg < 0) deg = 360 + deg;
            let html = `${mag}m/s ${deg}°`;
            flowtooltip._tooltip._content = html;
            flowtooltip.openTooltip(e.latlng);
          } else {
            flowtooltip.closeTooltip();
          }
        });
        vectors.on("click", function (e) {
          if (e.value !== null && e.value.u !== null) {
            let { u, v } = e.value;
            let { lat, lng } = e.latlng;
            lat = Math.round(lat * 1000) / 1000;
            lng = Math.round(lng * 1000) / 1000;
            let mag = Math.round(Math.sqrt(u ** 2 + v ** 2) * 1000) / 1000;
            let deg = Math.round(
              (Math.atan2(u / mag, v / mag) * 180) / Math.PI
            );
            if (deg < 0) deg = 360 + deg;
            value = Math.round(mag * 1000) / 1000;
            let inner = `${value}m/s ${deg}°`;
            let html = `<div><div class="popup-title">${
              layer.title
            }</div><div class="popup-desc">${
              layer.description
            }</div><div class="popup-detail"><a href="${url}" target="_blank" rel="noopener noreferrer"><button>View Dataset</button></a></div><div class="popup-date">${parseDatetime(
              datetime
            )}</div><div class="popup-values"><div class="popup-param">${lat}, ${lng}</div><div class="popup-value">${String(
              inner
            )}</div><div class="popup-param">Water Veloctiy @ ${depth}m</div><div></div>`;
            L.popup({ className: "datasetsPopup" })
              .setLatLng(e.latlng)
              .setContent(html)
              .openOn(map);
          }
        });
      }
    }
  };

  capitalize = (s) => {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  gitPlot = async (layer, file) => {
    var {
      datasetparameters,
      parameters_id,
      datasets_id,
      markerLabel,
      min,
      max,
      colors,
      markerSymbol,
      markerFixedSize,
      markerSize,
      latitude,
      longitude,
      unit,
      maxdepth,
      data,
      yselectindex,
    } = layer;
    var datasetparameter = datasetparameters.find(
      (dp) => dp.parameters_id === parameters_id
    );
    var { datetime, depth } = this.props;
    var type = datasetparameters.map((dp) => dp.axis + "&" + dp.parameters_id);
    var index, indexx, indexy, size, marker;
    var minSize = 5;
    var maxSize = 30;
    var markerGroup = L.layerGroup().addTo(this.map);
    var dt = datetime;
    var dd = Math.round(depth * 100) / 100;
    var value = "NA";

    if (file.latitude !== "-9999" && file.longitude !== "-9999") {
      latitude = file.latitude;
      longitude = file.longitude;
    }

    if (type.includes("M&1") && type.includes("y&2")) {
      // Profiler vs depth
      let dp2 = datasetparameters.find((dp) => dp.parameters_id === 1);
      let dp3 = datasetparameters.find((dp) => dp.parameters_id === 2);
      index = this.indexClosest(depth, data.y);
      value = this.numberformat(parseFloat(data[datasetparameter.axis][index]));
      dt = new Date(data[dp2.axis][index] * 1000);
      dd = Math.round(data[dp3.axis][index] * 100) / 100 + "m";
    } else if (type.includes("M&1") && type.includes("y&18")) {
      // Profiler vs pressure
      let dp2 = datasetparameters.find((dp) => dp.parameters_id === 1);
      let dp3 = datasetparameters.find((dp) => dp.parameters_id === 18);
      index = this.indexClosest(depth, data.y);
      value = this.numberformat(parseFloat(data[datasetparameter.axis][index]));
      dt = new Date(data[dp2.axis][index] * 1000);
      dd = Math.round(data[dp3.axis][index] * 100) / 100 + "m";
    } else if (
      type.join(",").includes("z&") &&
      type.includes("x&1") &&
      type.includes("y&2")
    ) {
      // 2D Depth Time Dataset
      indexx = this.indexClosest(datetime.getTime() / 1000, data["x"]);
      indexy = this.indexClosest(depth, data["y"]);
      if (Array.isArray(data[datasetparameter.axis][0])) {
        value = this.numberformat(data[datasetparameter.axis][indexy][indexx]);
        dd = Math.round(data["y"][indexy] * 100) / 100 + "m";
      } else {
        value = this.numberformat(data[datasetparameter.axis][indexx]);
        dd = "";
      }
      dt = new Date(data["x"][indexx] * 1000);
    } else if (
      type.includes("x&1") &&
      !type.includes("y&2") &&
      type.join(",").includes("z&")
    ) {
      // 2D Non-Depth Time Dataset
      var param = datasetparameters.find((dp) => dp.axis === "y");
      indexx = this.indexClosest(datetime.getTime() / 1000, data["x"]);
      if (yselectindex) {
        value = this.numberformat(
          data[datasetparameter.axis][yselectindex][indexx]
        );
        dt = new Date(data["x"][indexx] * 1000);
        dd = `<tr><td><strong>${this.capitalize(
          param.parseparameter
        )}</strong></td><td>${
          Math.round(data["y"][yselectindex] * 100) / 100
        } ${param.unit}`;
      } else {
        value = this.numberformat(data[datasetparameter.axis][0][indexx]);
        dt = new Date(data["x"][indexx] * 1000);
        dd = `${Math.round(data["y"][0] * 100) / 100} ${param.unit}`;
      }
    } else if (type.includes("x&1") && type.join(",").includes("y&")) {
      // 1D Parameter Time Dataset
      index = this.indexClosest(datetime.getTime() / 1000, data["x"]);
      value = this.numberformat(data[datasetparameter.axis][index]);
      dt = new Date(data["x"][index] * 1000);
      dd = Math.round(maxdepth * 100) / 100 + "m";
    } else {
      console.error("No plotting function defined");
    }
    var color = getColor(value, min, max, colors);
    var shape = markerSymbol;
    if (markerFixedSize) {
      size = markerSize;
    } else {
      size = ((value - min) / (max - min)) * (maxSize - minSize) + minSize;
    }
    let url = "https://www.datalakes-eawag.ch/datadetail/" + datasets_id;
    marker = new L.marker([latitude, longitude], {
      icon: L.divIcon({
        className: "map-marker",
        popupAnchor: [-(size / 2 + 19), 0],
        tooltipAnchor: [-size / 2, -size],
        html:
          `<div style="padding:10px;transform:translate(-12px, -12px);position: absolute;">` +
          `<div class="${shape}" style="background-color:${color};height:${size}px;width:${size}px">` +
          `</div></div> `,
      }),
    })
      .bindTooltip(
        `<div><div class="tooltip-date">${this.parseDatetime(
          dt
        )}</div><div class="tooltip-values"><div class="tooltip-value">${value}</div><div class="tooltip-unit">${unit}</div><div class="tooltip-param">${
          datasetparameter.name
        } ${dd !== "" ? "@" : ""} ${dd}</div></div></div>`,
        {
          permanent: markerLabel,
          direction: "top",
          className: "gitTooltip",
        }
      )
      .addTo(markerGroup);
    marker.bindPopup(
      `<div><div class="popup-title">${
        layer.title
      }</div><div class="popup-desc">${
        layer.description
      }</div><div class="popup-detail"><a href="${url}" target="_blank" rel="noopener noreferrer"><button>View Dataset</button></a></div><div class="popup-date">${this.parseDatetime(
        dt
      )}</div><div class="popup-values"><div class="popup-param">${latitude}, ${longitude}</div><div class="popup-value">${String(
        value
      )}</div><div class="popup-unit">${String(
        unit
      )}</div><div class="popup-param">${datasetparameter.name} ${
        dd !== "" ? "@" : ""
      } ${dd}</div><div></div>`,
      { className: "datasetsPopup" }
    );

    this.marker.push(markerGroup);
  };

  plotDatasets = () => {
    var { datasets, datasetparameters } = this.props;
    var addSelectedLayer = this.addSelectedLayer;
    var measurementIcon = L.icon({
      iconUrl: measurement,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      popupAnchor: [0, -24],
      className: "leaflet-custom-icon",
    });
    var modelIcon = L.icon({
      iconUrl: model,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      popupAnchor: [0, -24],
      className: "leaflet-custom-icon",
    });
    var satelliteIcon = L.icon({
      iconUrl: satellite,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      popupAnchor: [0, -24],
      className: "leaflet-custom-icon",
    });
    var markerGroup = L.markerClusterGroup().addTo(this.map);
    var marker;
    var id;
    for (var dataset of datasets) {
      if (
        ["gitPlot", "meteolakes", "remoteSensing"].includes(
          dataset.mapplotfunction
        )
      ) {
        var icon = measurementIcon;
        if (dataset.origin === "model") {
          icon = modelIcon;
        } else if (dataset.origin === "satellite") {
          icon = satelliteIcon;
        }
        marker = new L.marker([dataset.latitude, dataset.longitude], {
          icon: icon,
        })
          .bindTooltip(dataset.title, {
            direction: "bottom",
            offset: [0, 25],
            opacity: 1,
            className: "basic-tooltip",
          })
          .addTo(markerGroup);
        let buttons = "";
        let d_id = dataset.id;
        let ids = [];
        for (var dp of datasetparameters.filter(
          (dp) =>
            dp.datasets_id === d_id &&
            ![1, 2, 3, 4, 27, 28, 29, 30].includes(dp.parameters_id)
        )) {
          id = `${dataset.id}_${dp.parameters_id}`;
          ids.push({
            id,
            datasets_id: dataset.id,
            parameters_id: dp.parameters_id,
          });
          buttons = buttons + `<button id="${id}">${dp.name}</button>`;
        }
        let url = "https://www.datalakes-eawag.ch/datadetail/" + dataset.id;
        marker
          .bindPopup(
            `<div><div class="popup-title">${
              dataset.title
            }</div><div class="popup-desc">${
              dataset.description
            }</div><div class="popup-detail"><a href="${url}" target="_blank" rel="noopener noreferrer"><button>View Dataset</button></a></div><div class="popup-date">${this.parseMonth(
              dataset.mindatetime
            )} to ${this.parseMonth(
              dataset.maxdatetime
            )}</div><div class="popup-buttons"><div class="popup-layer">Add parameter to map</div>${buttons}<div></div>`,
            { className: "datasetsPopup" }
          )
          .on("popupopen", function (popup) {
            for (var select_id of ids) {
              document
                .getElementById(select_id.id)
                .addEventListener("click", addSelectedLayer);
            }
          });
      }
    }
    this.datasets.push(markerGroup);
  };

  addSelectedLayer = (event) => {
    var ids = event.target.id.split("_");
    document.getElementById("map").click();
    this.props.addSelected([
      { datasets_id: parseInt(ids[0]), parameters_id: parseInt(ids[1]) },
    ]);
  };

  removeDatasets = () => {
    this.datasets.forEach((layer) => {
      this.map.removeLayer(layer);
    });
    this.datasets = [];
  };

  parseDate = (input) => {
    var date = new Date(input);
    let day = ("0" + date.getDate()).slice(-2);
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let year = date.getFullYear();
    return day + "/" + month + "/" + year;
  };

  parseDatetime = (input) => {
    var months = [
      "Jan ",
      "Feb ",
      "Mar ",
      "Apr ",
      "May ",
      "Jun ",
      "Jul ",
      "Aug ",
      "Sept ",
      "Oct ",
      "Nov ",
      "Dec ",
    ];
    var date = new Date(input);
    return `${("0" + date.getHours()).slice(-2)}:${(
      "0" + date.getSeconds()
    ).slice(-2)} ${date.getDate()} ${
      months[date.getMonth()]
    } ${date.getFullYear()}`;
  };

  parseMonth = (input) => {
    var months = [
      "Jan ",
      "Feb ",
      "Mar ",
      "Apr ",
      "May ",
      "Jun ",
      "Jul ",
      "Aug ",
      "Sept ",
      "Oct ",
      "Nov ",
      "Dec ",
    ];
    var date = new Date(input);
    return months[date.getMonth()] + date.getFullYear();
  };

  parseVectorData = (data, radius, locationformat) => {
    function createAndFillTwoDArray({ rows, columns, defaultValue }) {
      return Array.from({ length: rows }, () =>
        Array.from({ length: columns }, () => defaultValue)
      );
    }
    var nCols = 200;
    var nRows = 200;
    var quadtreedata = [];
    var x_array = [];
    var y_array = [];
    for (let i = 0; i < data["u"]["data"].length; i++) {
      for (let j = 0; j < data["u"]["data"][0].length; j++) {
        if (data["u"]["data"][i][j] !== null) {
          quadtreedata.push([
            data["x"]["data"][i][j],
            data["y"]["data"][i][j],
            data["u"]["data"][i][j],
            data["v"]["data"][i][j],
          ]);
          x_array.push(data["x"]["data"][i][j]);
          y_array.push(data["y"]["data"][i][j]);
        }
      }
    }

    let min_x = Math.min(...x_array);
    let min_y = Math.min(...y_array);
    let max_x = Math.max(...x_array);
    let max_y = Math.max(...y_array);

    let xSize = (max_x - min_x) / nCols;
    let ySize = (max_y - min_y) / nRows;

    let quadtree = d3
      .quadtree()
      .extent([
        [min_x, min_y],
        [max_x, max_y],
      ])
      .addAll(quadtreedata);

    var u = createAndFillTwoDArray({
      rows: nRows + 1,
      columns: nCols + 1,
      defaultValue: null,
    });
    var v = createAndFillTwoDArray({
      rows: nRows + 1,
      columns: nCols + 1,
      defaultValue: null,
    });
    var x, y;
    for (var i = 0; i < nRows + 1; i++) {
      y = max_y - i * ySize;
      for (var j = 0; j < nCols + 1; j++) {
        x = min_x + j * xSize;
        if (quadtree.find(x, y, radius) !== undefined) {
          u[i][j] = parseFloat(JSON.stringify(quadtree.find(x, y, radius)[2]));
          v[i][j] = parseFloat(JSON.stringify(quadtree.find(x, y, radius)[3]));
        }
      }
    }

    var project = function (xy) {
      return xy;
    };
    if (locationformat === "CH1903") {
      project = this.CHtoWGSlatlng;
    } else if (locationformat === "UTM") {
      project = this.UTMtoWGSlatlng;
    }
    var minLatLng = project([min_x, min_y]);
    var maxLatLng = project([max_x, max_y]);

    return {
      nCols,
      nRows,
      xSize,
      ySize,
      xMin: minLatLng[1],
      xMax: maxLatLng[1],
      yMin: minLatLng[0],
      yMax: maxLatLng[0],
      data: { u, v },
    };
  };

  numberformat = (num) => {
    num = parseFloat(num);
    if (num > 9999 || (num < 0.01 && num > -0.01) || num < -9999) {
      num = num.toExponential(3);
    } else {
      num = Math.round(num * 10000) / 10000;
    }
    return num;
  };

  indexClosest = (num, arr) => {
    var index = 0;
    var diff = Infinity;
    for (var val = 0; val < arr.length; val++) {
      if (arr[val] !== null) {
        var newdiff = Math.abs(num - arr[val]);
        if (newdiff < diff) {
          diff = newdiff;
          index = val;
        }
      }
    }
    return index;
  };

  addPoint = (e) => {
    this.map.removeLayer(this.point);
    var lat = Math.round(e.latlng.lat * 100) / 100;
    var lng = Math.round(e.latlng.lng * 100) / 100;
    this.point = new L.marker(e.latlng, {
      icon: L.divIcon({
        className: "map-marker",
        html:
          `<div style="padding:10px;transform:translate(-12px, -12px);position: absolute;">` +
          `<div class="pin2">` +
          `</div></div> `,
      }),
    })
      .bindTooltip(`(${lat},${lng})`, {
        direction: "top",
        className: "basic-tooltip",
        opacity: 1,
      })
      .addTo(this.map);
    this.props.updatePoint(e.latlng);
  };

  addLine = (e) => {
    if (Object.keys(this.line._layers).length > 1) {
      this.line.clearLayers();
      this.props.updateLine([]);
    }
    var lat = Math.round(e.latlng.lat * 100) / 100;
    var lng = Math.round(e.latlng.lng * 100) / 100;
    new L.marker(e.latlng, {
      icon: L.divIcon({
        className: "map-marker",
        html:
          `<div style="padding:10px;transform:translate(-12px, -12px);position: absolute;">` +
          `<div class="pin2">` +
          `</div></div> `,
      }),
    })
      .bindTooltip(`(${lat},${lng})`, {
        direction: "top",
        className: "basic-tooltip",
        opacity: 1,
      })
      .addTo(this.line);
    if (Object.keys(this.line._layers).length === 2) {
      var pointList = [];
      for (var key in this.line._layers) {
        pointList.push(this.line._layers[key]["_latlng"]);
      }
      new L.Polyline(pointList, {
        color: "red",
        weight: 2,
        smoothFactor: 1,
        dashArray: "20, 10",
        dashOffset: "0",
      }).addTo(this.line);
      this.props.updateLine(pointList);
    }
  };

  arraysEqual = (a, b) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };

  findDataset = (fileid, files) => {
    return files.find((x) => x.id === fileid);
  };

  updatePlot = (prevProps) => {
    var { selectedlayers, datetime } = this.props;

    // Remove old layers
    this.marker.forEach((layer) => {
      this.map.removeLayer(layer);
    });
    this.raster.forEach((layer) => {
      this.map.removeLayer(layer);
    });
    this.raster.length = 0;

    if (this.vectorfieldtime === datetime) {
      Object.values(this.vectorfieldanim).forEach((layer) => {
        this.map.removeLayer(layer);
      });
      this.vectorfieldanim = {};
    }

    // Add new layers
    for (var i = selectedlayers.length - 1; i > -1; i--) {
      var layer = selectedlayers[i];
      if (layer.visible) {
        var locationformat = "CH1903";
        if ([7, 8].includes(layer.datasets_id)) locationformat = "UTM";
        var { fileid, files, mapplotfunction } = layer;
        var file = this.findDataset(fileid, files);
        mapplotfunction === "gitPlot" && this.gitPlot(layer, file);
        mapplotfunction === "remoteSensing" && this.remoteSensing(layer, file);
        mapplotfunction === "simstrat" && this.simstrat(layer, file);
        mapplotfunction === "meteolakes" &&
          this.threeDmodel(layer, file, "delft3d", locationformat);
        mapplotfunction === "datalakes" &&
          this.threeDmodel(layer, file, "unix", locationformat);
      }
    }
  };

  onEachFeature = (feature, layer) => {
    if (this.props.geojson_function) {
      layer.on("click", () => {
        this.props.geojson_function(feature);
      });
    }
    if (feature.properties.Name) {
      layer.bindTooltip(feature.properties.Name);
    }
  };

  addGeoJSON = () => {
    var style = {
      color: "red",
      weight: 2,
      opacity: 1,
      fillOpacity: 0,
    };
    if (this.props.geojson_style) {
      style = this.props.geojson_style;
    }
    this.geojson = L.geoJson(this.props.geojson, {
      style: style,
      onEachFeature: this.onEachFeature,
    }).addTo(this.map);
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.loading && !this.props.loading) {
      var updatePlot = this.updatePlot;
      window.setTimeout(() => {
        updatePlot(prevProps);
        if (prevProps.zoom !== this.props.zoom) {
          window.setTimeout(() => {
            this.map.flyTo(this.props.center, this.props.zoom, {
              animate: true,
              duration: 1,
            });
          }, 500);
        }
      }, 0);
    }

    if (
      !this.props.loading &&
      this.props.plotDatasets &&
      this.datasets.length === 0
    ) {
      this.plotDatasets();
    } else if (!this.props.plotDatasets) {
      this.removeDatasets();
    }

    if (prevProps.basemap !== this.props.basemap) {
      this.map.removeLayer(this.layer);
      this.layer = this.baseMaps[this.props.basemap];
      this.map.addLayer(this.layer);
    }
    if (prevProps.point !== this.props.point) {
      var { addPoint } = this;
      if (this.props.point) {
        this.map.on("click", addPoint);
        document.getElementsByClassName("leaflet-popup-pane")[0].style.display =
          "none";
        document.getElementsByClassName("leaflet-popup-pane")[0].innerHTML = "";
        L.DomUtil.addClass(this.map._container, "crosshair-cursor-enabled");
      } else {
        this.map.off("click", addPoint);
        this.map.removeLayer(this.point);
        this.props.updatePoint({});
        if (!this.props.point && !this.props.line) {
          document.getElementsByClassName(
            "leaflet-popup-pane"
          )[0].style.display = "block";
          L.DomUtil.removeClass(
            this.map._container,
            "crosshair-cursor-enabled"
          );
        }
      }
    }
    if (prevProps.line !== this.props.line) {
      var { addLine } = this;
      if (this.props.line) {
        this.map.on("click", addLine);
        document.getElementsByClassName("leaflet-popup-pane")[0].style.display =
          "none";
        document.getElementsByClassName("leaflet-popup-pane")[0].innerHTML = "";
        L.DomUtil.addClass(this.map._container, "crosshair-cursor-enabled");
      } else {
        this.map.off("click", addLine);
        this.line.clearLayers();
        this.props.updateLine([]);
        if (!this.props.point && !this.props.line) {
          document.getElementsByClassName(
            "leaflet-popup-pane"
          )[0].style.display = "block";
          L.DomUtil.removeClass(
            this.map._container,
            "crosshair-cursor-enabled"
          );
        }
      }
    }
    if (prevProps.geojson !== this.props.geojson) {
      if (this.geojson) this.map.removeLayer(this.geojson);
      this.addGeoJSON();
    }
    if (
      this.props.geojson_zoom &&
      prevProps.geojson_zoom !== this.props.geojson_zoom
    ) {
      var bounds = Object.values(this.geojson["_layers"]).find(
        (g) => g.feature.properties.id === this.props.geojson_zoom
      );
      if (bounds) {
        this.map.flyToBounds(bounds["_bounds"]);
      }
    }

    this.map.invalidateSize();
  }

  componentDidMount() {
    var center = [46.85, 7.55];
    if ("center" in this.props) {
      center = this.props.center;
    }
    var zoom = 8;
    if ("zoom" in this.props) {
      zoom = this.props.zoom;
    }

    this.baseMaps = {};
    for (var layer of Object.keys(basemaps)) {
      this.baseMaps[layer] = L.tileLayer(basemaps[layer]["url"], {
        attribution: basemaps[layer]["attribution"],
      });
    }

    var topolink =
      "https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=pk.eyJ1IjoiamFtZXNydW5uYWxscyIsImEiOiJjazk0ZG9zd2kwM3M5M2hvYmk3YW0wdW9yIn0.uIJUZoDgaC2LfdGtgMz0cQ";

    this.layer = this.baseMaps["datalakesmap"];
    if ("basemap" in this.props) {
      this.layer = this.baseMaps[this.props.basemap];
    }

    var zoomControl = true;
    var { setZoomIn, setZoomOut } = this.props;
    if (setZoomIn && setZoomOut) {
      setZoomIn(this.zoomIn);
      setZoomOut(this.zoomOut);
      zoomControl = false;
    }

    this.map = L.map("map", {
      preferCanvas: true,
      zoomControl,
      center: center,
      zoom: zoom,
      minZoom: 7,
      maxZoom: 15,
    });

    var colorpicker = L.tileLayer
      .colorPicker(topolink, {
        opacity: 0,
      })
      .addTo(this.map);

    this.layer.addTo(this.map);

    // Draw
    this.point = {};
    this.line = L.layerGroup().addTo(this.map);

    var map = this.map;
    var passLocation = this.props.passLocation;
    this.map.on("mousemove", function (e) {
      var lat = Math.round(1000 * e.latlng.lat) / 1000;
      var lng = Math.round(1000 * e.latlng.lng) / 1000;
      var a = colorpicker.getColor(e.latlng);
      var alt = NaN;
      if (a !== null) {
        alt =
          Math.round(
            10 * (-10000 + (a[0] * 256 * 256 + a[1] * 256 + a[2]) * 0.1)
          ) / 10;
      }
      map.attributionControl.setPrefix(
        "(" + lat + "," + lng + ") " + alt + "m"
      );
      if (passLocation) {
        passLocation({ lat, lng, alt });
      }
    });

    // GeoJSON
    if ("geojson" in this.props && this.props.geojson) {
      this.addGeoJSON();
    }

    if ("updateLocation" in this.props) {
      var { updateLocation } = this.props;
      this.map.on("zoomend", function (e) {
        let zoom = e.target._zoom;
        let latlng = e.target._lastCenter;
        let lat = Math.round(latlng.lat * 1000) / 1000;
        let lng = Math.round(latlng.lng * 1000) / 1000;
        updateLocation(zoom, [lat, lng]);
      });
      this.map.on("dragend", function (e) {
        let zoom = e.target._zoom;
        let latlng = map.getCenter();
        let lat = Math.round(latlng.lat * 1000) / 1000;
        let lng = Math.round(latlng.lng * 1000) / 1000;
        updateLocation(zoom, [lat, lng]);
      });
    }

    this.marker = [];
    this.raster = [];
    this.datasets = [];
    this.vectorfieldanim = {};
    this.vectorfieldtime = this.props.datetime;
    this.zoomedtolayer = false;
  }

  render() {
    return (
      <React.Fragment>
        <div id="map"></div>
      </React.Fragment>
    );
  }
}

export default Basemap;
