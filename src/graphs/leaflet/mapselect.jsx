import React, { Component } from "react";
import L from "leaflet";
import "./leaflet_customcontrol";
import "leaflet.markercluster";
import "leaflet-draw";
import "./css/leaflet.css";
import "./css/markercluster.css";
import "./css/markerclusterdefault.css";
import "./css/marker.css";
import "./css/mapselect.css";

class MapSelect extends Component {
  rectEnable = (e) => {
    if (e.ctrlKey) {
      this.rectangle.enable();
    }
  };

  componentDidMount() {
    const { datasets, selectPoints, mapToggle } = this.props;
    var center = [46.85, 7.55];
    var zoom = 8;

    this.map = L.map("mapselect", {
      center: center,
      zoom: zoom,
      minZoom: 2,
      maxZoom: 30,
      layers: [
        //L.tileLayer('https://wmts20.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg', {attribution: '<a title="Swiss Federal Office of Topography" href="https://www.swisstopo.admin.ch/">swisstopo</a>'})
        L.tileLayer(
          "https://api.mapbox.com/styles/v1/jamesrunnalls/ckfs3ngtw0fx519o5oinhc5mh/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamFtZXNydW5uYWxscyIsImEiOiJjazk0ZG9zd2kwM3M5M2hvYmk3YW0wdW9yIn0.uIJUZoDgaC2LfdGtgMz0cQ",
          {
            attribution:
              'swisstopo DV 5704 000 000 | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | &copy; <a href="https://www.mapbox.com/">mapbox</a>',
          }
        ),
      ],
    });

    if (selectPoints) {
      var drawnItems = new L.FeatureGroup();
      this.map.addLayer(drawnItems);
      var drawControl = new L.Control.Draw({
        edit: {
          draw: true,
          featureGroup: drawnItems,
        },
      });
      this.map.addControl(drawControl);

      this.rectangle = new L.Draw.Rectangle(
        this.map,
        drawControl.options.Rectangle
      );

      this.map.on("draw:created", function (e) {
        var layer = e.layer;
        selectPoints(layer._latlngs[0]);
        drawnItems.clearLayers();
        drawnItems.addLayer(layer);
      });
      this.drawnItems = drawnItems;
      window.addEventListener("keydown", this.rectEnable);
    }

    // Close button
    if (mapToggle) {
      L.control
        .custom({
          position: "topright",
          content: '<div class="closemap" title="Close map">&#10008</div>',
          classes: "closemap",
          style: {
            margin: "10px",
            padding: "0px 0 0 0",
            cursor: "pointer",
          },
          events: {
            click: function (data) {
              mapToggle();
            },
          },
        })
        .addTo(this.map);
    }

    // Plot markers
    var bounds = this.plotMarkers(datasets);
    try {
      this.map.fitBounds(bounds, {maxZoom: 12});
    } catch (e) {}
  }

  componentDidUpdate() {
    this.map.invalidateSize();
    const { datasets, filters } = this.props;
    if (filters && !("Location" in filters)) {
      this.drawnItems.clearLayers();
      var bounds = this.plotMarkers(datasets);
      try {
        this.map.fitBounds(bounds, {maxZoom: 8});
      } catch (e) {}
    } else {
      this.plotMarkers(datasets);
    }
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.rectEnable);
  }

  plotMarkers = (datasets) => {
    try {
      this.map.removeLayer(this.markers);
    } catch (e) {}

    try {
      const { clickPoint, files } = this.props;
      var shape = "circle";
      var color = "blue";
      var Icon = L.divIcon({
        className: "map-marker",
        html: `<div class="${shape}" style="background-color:${color};box-shadow: 0px 0px 15px ${color};"></div> `,
      });
      var IconSelect = L.divIcon({
        className: "map-marker",
        html: `<div class="${shape}" style="background-color:red;box-shadow: 0px 0px 15px red;"></div> `,
      });

      this.markers = L.markerClusterGroup();
      var bounds = L.latLngBounds();
      for (let i = 0; i < datasets.length; i++) {
        let dataset = datasets[i];
        var { latitude, longitude, title, id, ave, fileid } = dataset;
        latitude = parseFloat(latitude);
        longitude = parseFloat(longitude);
        if (latitude !== -9999 && longitude !== -9999) {
          bounds.extend([latitude, longitude]);
          if (title && id) {
            this.markers.addLayer(
              new L.marker([latitude, longitude], {
                icon: Icon,
              }).bindPopup(`<a href="datadetail/${id}">${title}</a>`)
            );
          } else if (ave && clickPoint) {
            let inIcon = Icon;
            let text = "Select file:";
            if (files.includes(fileid)) {
              inIcon = IconSelect;
              text = "Selected file:";
            }
            let value = new Date(ave);
            this.markers.addLayer(
              new L.marker([latitude, longitude], {
                icon: inIcon,
                id: fileid,
              })
                .bindTooltip(
                  `<div style="text-align:center;"><b>${text}</b></div><div>${
                    value.toDateString() + " " + value.toLocaleTimeString()
                  }</div>`
                )
                .on("click", (e) => {
                  clickPoint(e);
                })
            );
          } else {
            this.markers.addLayer(
              new L.marker([latitude, longitude], {
                icon: Icon,
              })
            );
          }
        }
      }
      this.map.addLayer(this.markers);
      return bounds;
    } catch (e) {
      console.error(e);
    }
  };
  render() {
    return (
      <React.Fragment>
        <div className="mapselect">
          <div id="mapselect"></div>
        </div>
      </React.Fragment>
    );
  }
}

export default MapSelect;
