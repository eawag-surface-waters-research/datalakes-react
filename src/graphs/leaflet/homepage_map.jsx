import React, { Component } from "react";
import L from "leaflet";
import * as d3 from "d3";
import axios from "axios";
import "leaflet-draw";
import "leaflet-streamlines";
import "./leaflet_vectorField";
import "./leaflet_customcontrol";
import "./leaflet_colorpicker";
import { getColor } from "../../components/gradients/gradients";
import "./css/leaflet.css";
import "./css/nobackground.css";

class HomepageMap extends Component {
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

  getMax = (arr) => {
    let len = arr.length;
    let max = -Infinity;

    while (len--) {
      max = arr[len] > max ? arr[len] : max;
    }
    return max;
  };

  getMin = (arr) => {
    let len = arr.length;
    let min = Infinity;

    while (len--) {
      min = arr[len] < min ? arr[len] : min;
    }
    return min;
  };

  meteolakesScalarMinMax = (inarray) => {
    var min = Infinity;
    var max = -Infinity;
    var flat = inarray.flat();
    flat = flat.filter((item) => item !== null);
    flat = flat.map((item) => item[2]);
    min = Math.min(min, this.getMin(flat));
    max = Math.max(max, this.getMax(flat));
    return { min, max, array: flat };
  };

  optimisePoints = (array, colors) => {
    var min = Math.min(...array);
    var max = Math.max(...array);
    var q, val, point;
    for (var i = 0; i < colors.length; i++) {
      if (i === 0) colors[i].point = 0;
      else if (i === colors.length - 1) colors[i].point = 1;
      else {
        q = (1 / (colors.length - 1)) * i;
        val = this.quantile(array, q);
        point = (val - min) / (max - min);
        colors[i].point = point;
      }
    }
    return colors;
  };

  quantile = (arr, q) => {
    const sorted = arr.slice(0).sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
      return sorted[base];
    }
  };

  meteolakes = async (data) => {
    var { min, max, array } = this.meteolakesScalarMinMax(data);
    var colors = [
      { color: "#053061", point: 0 },
      { color: "#053061", point: 0.10000000000000038 },
      { color: "#09386d", point: 0.14285714285714296 },
      { color: "#09386d", point: 0.17857142857142852 },
      { color: "#134c87", point: 0.20714285714285713 },
      { color: "#134c87", point: 0.2285714285714287 },
      { color: "#1d5fa2", point: 0.25000000000000033 },
      { color: "#1d5fa2", point: 0.2714285714285713 },
      { color: "#276eb0", point: 0.2857142857142859 },
      { color: "#276eb0", point: 0.2999999999999999 },
      { color: "#337eb8", point: 0.3142857142857145 },
      { color: "#337eb8", point: 0.32857142857142846 },
      { color: "#3f8ec0", point: 0.3357142857142861 },
      { color: "#3f8ec0", point: 0.3500000000000001 },
      { color: "#569fc9", point: 0.36428571428571405 },
      { color: "#569fc9", point: 0.37857142857142867 },
      { color: "#71b0d3", point: 0.39650455927051687 },
      { color: "#71b0d3", point: 0.4214285714285712 },
      { color: "#8dc2dc", point: 0.43571428571428583 },
      { color: "#8dc2dc", point: 0.4499999999999998 },
      { color: "#a2cde3", point: 0.4714285714285714 },
      { color: "#a2cde3", point: 0.48571428571428604 },
      { color: "#b8d8e9", point: 0.5 },
      { color: "#b8d8e9", point: 0.5214285714285716 },
      { color: "#cfe4ef", point: 0.5500000000000002 },
      { color: "#f9c6ac", point: 0.5714285714285712 },
      { color: "#f6b394", point: 0.5928571428571427 },
      { color: "#f6b394", point: 0.6142857142857143 },
      { color: "#f2a17f", point: 0.635714285714286 },
      { color: "#f2a17f", point: 0.6571428571428569 },
      { color: "#e8896c", point: 0.6785714285714285 },
      { color: "#e8896c", point: 0.6928571428571432 },
      { color: "#dd7059", point: 0.7000000000000002 },
      { color: "#dd7059", point: 0.7039513677811553 },
      { color: "#d25849", point: 0.7077507598784191 },
      { color: "#d25849", point: 0.7214285714285711 },
      { color: "#c53e3d", point: 0.7357142857142857 },
      { color: "#c53e3d", point: 0.7428571428571427 },
      { color: "#b82531", point: 0.7571428571428573 },
      { color: "#b82531", point: 0.7714285714285712 },
      { color: "#a81529", point: 0.7785714285714282 },
      { color: "#a81529", point: 0.7999999999999998 },
      { color: "#8d0c25", point: 0.8214285714285715 },
      { color: "#8d0c25", point: 0.8428571428571431 },
      { color: "#730421", point: 0.8714285714285717 },
      { color: "#730421", point: 0.9071428571428566 },
      { color: "#67001f", point: 0.9285714285714288 },
      { color: "#67001f", point: 1 },
    ];
    colors = this.optimisePoints(array, colors);

    var polygons, matrix, i, j, row, nextRow, coords, pixelcolor;
    polygons = [];
    matrix = data;
    for (i = 0; i < matrix.length - 1; i++) {
      row = matrix[i];
      nextRow = matrix[i + 1];
      for (j = 0; j < row.length - 1; j++) {
        if (
          row[j] === null ||
          nextRow[j] === null ||
          row[j + 1] === null ||
          nextRow[j + 1] === null
        ) {
        } else {
          coords = [
            this.CHtoWGSlatlng([row[j][0], [row[j][1]]]),
            this.CHtoWGSlatlng([nextRow[j][0], [nextRow[j][1]]]),
            this.CHtoWGSlatlng([nextRow[j + 1][0], [nextRow[j + 1][1]]]),
            this.CHtoWGSlatlng([row[j + 1][0], [row[j + 1][1]]]),
          ];
          pixelcolor = getColor(row[j][2], min, max, colors);
          polygons.push(
            L.polygon(coords, {
              color: pixelcolor,
              fillColor: pixelcolor,
              fillOpacity: 1,
              title: row[j][2],
            })
          );
        }
      }
    }
    L.featureGroup(polygons).addTo(this.map);
  };

  meteolakesParseVectorData = (data, radius) => {
    function createAndFillTwoDArray({ rows, columns, defaultValue }) {
      return Array.from({ length: rows }, () =>
        Array.from({ length: columns }, () => defaultValue)
      );
    }
    var nCols = 200;
    var nRows = 200;
    let flatdata = data.flat().filter((d) => d !== null);
    let quadtreedata = flatdata.map((f) => [f[0], f[1], f[3], f[4]]);

    let x_array = flatdata.map((df) => df[0]);
    let y_array = flatdata.map((df) => df[1]);

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
    var minLatLng = this.CHtoWGSlatlng([min_x, min_y]);
    var maxLatLng = this.CHtoWGSlatlng([max_x, max_y]);

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

  loadMap = async () => {
    var zoom = 12;
    if (window.innerWidth < 800) zoom = 11;
    try {
      this.map = L.map("map", {
        preferCanvas: true,
        zoomControl: false,
        scrollWheelZoom: false,
        center: [47.28, 8.7],
        zoom,
      });

      var { data } = await axios.get(
        `https://api.meteolakes.ch/api/datalakes/layer/zurich/${new Date().getTime()}/0.5`
      );

      this.meteolakes(data.data);

      // Flow paths
      var vectordata = this.meteolakesParseVectorData(data.data, 150);
      L.streamlines(vectordata.data, {
        paths: 5000,
        xMin: vectordata.xMin,
        xMax: vectordata.xMax,
        yMin: vectordata.yMin,
        yMax: vectordata.yMax,
      }).addTo(this.map);

      document.getElementById("lakesim").style.background = "none";
    } catch (e) {
      console.error(e);
    }
  };

  async componentDidMount() {
    setTimeout(this.loadMap, 1000);
  }

  render() {
    return (
      <React.Fragment>
        <div id="map"></div>
      </React.Fragment>
    );
  }
}

export default HomepageMap;
