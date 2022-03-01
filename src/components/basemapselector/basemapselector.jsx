import React, { Component } from "react";
import MiniMap from "../../graphs/leaflet/minimap";
import "./basemapselector.css";

class BasemapSelector extends Component {
  shuffle = (arr) => {
    arr.push(arr.shift());
    return arr;
  };
  render() {
    var { center, zoom, onChangeBasemap, basemaps, basemap } = this.props;
    var trim_basemaps = JSON.parse(JSON.stringify(basemaps));
    delete trim_basemaps[basemap];
    var list = this.shuffle(Object.keys(trim_basemaps));
    return (
      <div className="selectbasemap">
        {list.map((b, index) => (
          <div
            key={b}
            title={trim_basemaps[b].title}
            className={index !== 0 ? "minimap hide" : "minimap"}
          >
            <MiniMap
              center={center}
              zoom={zoom}
              basemap={b}
              basemaps={trim_basemaps}
              onChangeBasemap={onChangeBasemap}
            />
          </div>
        ))}
      </div>
    );
  }
}

export default BasemapSelector;
