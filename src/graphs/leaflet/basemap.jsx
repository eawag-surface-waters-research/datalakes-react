import React, { Component } from "react";
import L from "leaflet";
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

  plotDatasets = () => {
    var { datasets, datasetparameters } = this.props;
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
          buttons = buttons + `<div class="parameter">${dp.name}</div>`;
        }
        let url = "https://www.datalakes-eawag.ch/datadetail/" + dataset.id;
        marker
          .bindPopup(
            `<div><div class="popup-title">${dataset.title
            }</div><div class="popup-desc">${dataset.description
            }</div><div class="popup-detail"><a href="${url}" target="_blank" rel="noopener noreferrer"><button>View Dataset</button></a></div><div class="popup-date">${this.parseMonth(
              dataset.mindatetime
            )} to ${this.parseMonth(
              dataset.maxdatetime
            )}</div><div class="popup-buttons"><div class="popup-layer">Available parameters</div>${buttons}<div></div>`,
            { className: "datasetsPopup" }
          );
      }
    }
    this.datasets.push(markerGroup);
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
