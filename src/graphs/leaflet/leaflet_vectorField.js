import L from "leaflet";

L.VectorField = (L.Layer ? L.Layer : L.Class).extend({
  initialize: function (inputdata, options) {
    this._inputdata = inputdata;
    L.setOptions(this, options);
  },

  setInputData: function (inputdata) {
    this._inputdata = inputdata;
    return this.redraw();
  },

  addInputData: function (inputdata) {
    this._inputdata.push(inputdata);
    return this.redraw();
  },

  setOptions: function (options) {
    L.setOptions(this, options);
    return this.redraw();
  },

  redraw: function () {
    if (!this._frame && this._map && !this._map._animating) {
      this._frame = L.Util.requestAnimFrame(this._redraw, this);
    }
    return this;
  },

  onAdd: function (map) {
    this._map = map;

    if (!this._canvas) {
      this._initCanvas();
    }

    if (this.options.pane) {
      this.getPane().appendChild(this._canvas);
    } else {
      map._panes.overlayPane.appendChild(this._canvas);
    }
    map.on("click", this._onClick, this);
    map.on("moveend", this._reset, this);
    map.on("mousemove", this._onMousemove, this);

    if (map.options.zoomAnimation && L.Browser.any3d) {
      map.on("zoomanim", this._animateZoom, this);
    }

    this._reset();
  },

  onRemove: function (map) {
    if (this.options.pane) {
      this.getPane().removeChild(this._canvas);
    } else {
      map.getPanes().overlayPane.removeChild(this._canvas);
    }
    map.off("click", this._onClick, this);
    map.off("moveend", this._reset, this);
    map.off("mousemove", this._onMousemove, this);

    if (map.options.zoomAnimation) {
      map.off("zoomanim", this._animateZoom, this);
    }
  },

  addTo: function (map) {
    map.addLayer(this);
    return this;
  },

  _initCanvas: function () {
    var canvas = (this._canvas = L.DomUtil.create(
      "canvas",
      "leaflet-vectorfield-layer leaflet-layer"
    ));

    var originProp = L.DomUtil.testProp([
      "transformOrigin",
      "WebkitTransformOrigin",
      "msTransformOrigin",
    ]);
    canvas.style[originProp] = "50% 50%";

    var size = this._map.getSize();
    canvas.width = size.x;
    canvas.height = size.y;

    var animated = this._map.options.zoomAnimation && L.Browser.any3d;
    L.DomUtil.addClass(
      canvas,
      "leaflet-zoom-" + (animated ? "animated" : "hide")
    );

    this._canvas = canvas;
    this._ctx = canvas.getContext("2d");
    this._width = canvas.width;
    this._height = canvas.height;
  },

  _reset: function () {
    var topLeft = this._map.containerPointToLayerPoint([0, 0]);
    var size = this._map.getSize();
    this._canvas.width = size.x;
    this._canvas.height = size.y;
    this._width = size.x;
    this._height = size.y;
    L.DomUtil.setPosition(this._canvas, topLeft);
    this._redraw();
  },

  _CHtolatlng: function (yx) {
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
  },
  _WGSlatlngtoCH: function (lat, lng) {
    lat = lat * 3600;
    lng = lng * 3600;
    var lat_aux = (lat - 169028.66) / 10000;
    var lng_aux = (lng - 26782.5) / 10000;
    var y =
      2600072.37 +
      211455.93 * lng_aux -
      10938.51 * lng_aux * lat_aux -
      0.36 * lng_aux * lat_aux ** 2 -
      44.54 * lng_aux ** 3 -
      2000000;
    var x =
      1200147.07 +
      308807.95 * lat_aux +
      3745.25 * lng_aux ** 2 +
      76.63 * lat_aux ** 2 -
      194.56 * lng_aux ** 2 * lat_aux +
      119.79 * lat_aux ** 3 -
      1000000;
    return { x, y };
  },
  _pixelSize: function () {
    var d = this._inputdata;
    var nRows = d.length;
    var nCols = d[0].length;
    var i, j;
    var abort = false;

    for (i = 0; i < nRows - 1 && !abort; i++) {
      for (j = 0; j < nCols - 1 && !abort; j++) {
        if (
          d[i][j] !== null &&
          d[i + 1][j] !== null &&
          d[i][j + 1] !== null &&
          d[i + 1][j + 1] !== null
        ) {
          abort = true;
          break;
        }
      }
    }
    var i0j0 = this._map.latLngToContainerPoint(
      this._CHtolatlng([d[i][j][0], d[i][j][1]])
    );
    var i1j0 = this._map.latLngToContainerPoint(
      this._CHtolatlng([d[i + 1][j][0], d[i + 1][j][1]])
    );
    var i0j1 = this._map.latLngToContainerPoint(
      this._CHtolatlng([d[i][j + 1][0], d[i][j + 1][1]])
    );
    var i1j1 = this._map.latLngToContainerPoint(
      this._CHtolatlng([d[i + 1][j + 1][0], d[i + 1][j + 1][1]])
    );
    var apixelx = [i0j0.x, i1j0.x, i0j1.x, i1j1.x];
    var apixely = [i0j0.x, i1j0.x, i0j1.x, i1j1.x];

    var pixelx = Math.max(...apixelx) - Math.min(...apixelx);
    var pixely = Math.max(...apixely) - Math.min(...apixely);

    return Math.max(pixelx, pixely);
  },

  _drawArrow: function (cell, ctx, size) {
    var { min, max, vectorArrowColor, colors } = this.options;
    var { center, value, rotation } = cell;

    // Arrow Center
    ctx.save();
    ctx.translate(center.x, center.y);

    // Arrow Color
    var color = "#000000";
    if (vectorArrowColor) {
      color = this._getColor(value, min, max, colors);
    }
    ctx.strokeStyle = color;

    // Arrow Rotation
    if (value === 0) rotation = Math.PI / 4;
    ctx.rotate(rotation); // Rotation in rads

    // Set other properties
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;

    // Draw Path
    if (value === 0) {
      ctx.beginPath();
      ctx.moveTo(-size / 4, 0);
      ctx.lineTo(+size / 4, 0);
      ctx.moveTo(0, -size / 4);
      ctx.lineTo(0, +size / 4);
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.moveTo(-size / 2, 0);
      ctx.lineTo(+size / 2, 0);
      ctx.moveTo(size * 0.25, -size * 0.25);
      ctx.lineTo(+size / 2, 0);
      ctx.lineTo(size * 0.25, size * 0.25);
      ctx.stroke();
      ctx.restore();
    }
  },

  getBounds: function () {
    var noNan = this._inputdata.flat().filter((i) => isNaN(i));
    var lat = noNan.map((n) => n[0]);
    var lng = noNan.map((n) => n[1]);
    var southWest = L.latLng(
      this._CHtolatlng([Math.min(...lat), Math.min(...lng)])
    );
    var northEast = L.latLng(
      this._CHtolatlng([Math.max(...lat), Math.max(...lng)])
    );
    return L.latLngBounds(southWest, northEast);
  },

  _drawArrows: function () {
    var ctx = this._ctx;
    ctx.clearRect(0, 0, this._width, this._height);

    var i, j, k, l, latlng, p, value, rotation, cell;
    var lat, lng, vx, vy, alat, alng, avx, avy;

    var nRows = this._inputdata.length;
    var nCols = this._inputdata[0].length;
    var size = this.options.size;

    var pixelSize = this._pixelSize();

    var stride = Math.max(1, Math.floor((1.2 * size) / pixelSize));

    if (stride === 1) {
      size = pixelSize * 0.9;
    }

    var maxRow = (Math.floor(nRows / stride) - 1) * stride + 1;
    var maxCol = (Math.floor(nCols / stride) - 1) * stride + 1;

    for (i = 0; i < maxRow; i += stride) {
      for (j = 0; j < maxCol; j += stride) {
        alat = [];
        alng = [];
        avx = [];
        avy = [];
        for (k = 0; k < stride; k++) {
          for (l = 0; l < stride; l++) {
            if (this._inputdata[i + k][j + l] !== null) {
              alat.push(this._inputdata[i + k][j + l][0]);
              alng.push(this._inputdata[i + k][j + l][1]);
              avx.push(this._inputdata[i + k][j + l][3]);
              avy.push(this._inputdata[i + k][j + l][4]);
            }
          }
        }

        if (alat.length > 0) {
          lat = this._getAve(alat);
          lng = this._getAve(alng);
          vx = this._getAve(avx);
          vy = this._getAve(avy);

          latlng = this._CHtolatlng([lat, lng]);
          p = this._map.latLngToContainerPoint(latlng);

          value = Math.abs(Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2)));

          rotation = Math.atan2(vx, vy) - Math.PI / 2;

          cell = { center: p, value: value, rotation: rotation };
          this._drawArrow(cell, ctx, size);
        }
      }
    }
  },

  _getAve: function (arr) {
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length || 0;
  },

  _hex: function (c) {
    var s = "0123456789abcdef";
    var i = parseInt(c, 10);
    if (i === 0 || isNaN(c)) return "00";
    i = Math.round(Math.min(Math.max(0, i), 255));
    return s.charAt((i - (i % 16)) / 16) + s.charAt(i % 16);
  },

  _trim: function (s) {
    return s.charAt(0) === "#" ? s.substring(1, 7) : s;
  },

  _convertToRGB: function (hex) {
    var color = [];
    color[0] = parseInt(this._trim(hex).substring(0, 2), 16);
    color[1] = parseInt(this._trim(hex).substring(2, 4), 16);
    color[2] = parseInt(this._trim(hex).substring(4, 6), 16);
    return color;
  },

  _convertToHex: function (rgb) {
    return this._hex(rgb[0]) + this._hex(rgb[1]) + this._hex(rgb[2]);
  },

  _getColor: function (value, min, max, colors) {
    var loc = (value - min) / (max - min);
    if (loc < 0 || loc > 1) {
      return "#fff";
    } else {
      var index = 0;
      for (var i = 0; i < colors.length - 1; i++) {
        if (loc >= colors[i].point && loc <= colors[i + 1].point) {
          index = i;
        }
      }
      var color1 = this._convertToRGB(colors[index].color);
      var color2 = this._convertToRGB(colors[index + 1].color);

      var f =
        (loc - colors[index].point) /
        (colors[index + 1].point - colors[index].point);
      var rgb = [
        color1[0] + (color2[0] - color1[0]) * f,
        color1[1] + (color2[1] - color1[1]) * f,
        color1[2] + (color2[2] - color1[2]) * f,
      ];

      return `#${this._convertToHex(rgb)}`;
    }
  },

  _redraw: function () {
    if (!this._map) {
      return;
    }
    this._drawArrows();
  },

  _animateZoom: function (e) {
    var scale = this._map.getZoomScale(e.zoom),
      offset = this._map
        ._getCenterOffset(e.center)
        ._multiplyBy(-scale)
        .subtract(this._map._getMapPanePos());

    if (L.DomUtil.setTransform) {
      L.DomUtil.setTransform(this._canvas, offset, scale);
    } else {
      this._canvas.style[L.DomUtil.TRANSFORM] =
        L.DomUtil.getTranslateString(offset) + " scale(" + scale + ")";
    }
  },

  _onMousemove: function (t) {
    var e = this._queryValue(t);
    this.fire("mousemove", e);
  },

  _onClick: function (t) {
    var e = this._queryValue(t);
    this.fire("click", e);
  },
  _queryValue: function (click) {
    let point = this._WGSlatlngtoCH(click.latlng.lat, click.latlng.lng);
    let data = this._inputdata.flat().filter((i) => i !== null);
    data = data.map((d) => {
      return {
        data: d,
        dist: Math.sqrt((d[0] - point.y) ** 2 + (d[1] - point.x) ** 2),
      };
    });
    data.sort((a, b) => (a.dist > b.dist ? 1 : -1));
    let u = null;
    let v = null;
    if (data[0].dist < 100) {
      u = data[0].data[3];
      v = data[0].data[4];
    }
    click["value"] = { u, v };
    return click;
  },
});

L.vectorField = function (inputdata, options) {
  return new L.VectorField(inputdata, options);
};
