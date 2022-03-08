import React, { Component } from "react";
import MiniMap from "../../graphs/leaflet/minimap";
import "./basemapselector.css";

class BasemapSelector extends Component {
  shuffle = (arr, basemap) => {
    var list = [];
    var idx = arr.indexOf(basemap);
    for (let i = idx + 1; i < arr.length; i++) list.push(arr[i]);
    for (let i = 0; i < idx; i++) list.push(arr[i]);
    return list;
  };
  render() {
    var { center, zoom, onChangeBasemap, basemaps, basemap } = this.props;
    var list = this.shuffle(Object.keys(basemaps), basemap);
    return (
      <div className="selectbasemap">
        {list.map((b, index) => (
          <div
            key={b}
            title={basemaps[b].title}
            className={index !== 0 ? "minimap hide" : "minimap"}
          >
            <MiniMap
              center={center}
              zoom={zoom}
              basemap={b}
              basemaps={basemaps}
              onChangeBasemap={onChangeBasemap}
            />
            <div className="minimap-text">{basemaps[b].title}</div>
          </div>
        ))}
      </div>
    );
  }
}

export default BasemapSelector;
