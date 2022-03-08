import React, { Component } from "react";
import GIS from "../../graphs/leaflet/gis";
import "./mapviewer.css";

class MapViewer extends Component {
  parseSearch = (search) => {
    search = search.replace("?", "").split("&");
    var out = {};
    for (var i = 0; i < search.length; i++) {
      try {
        var split = search[i].split("=");
        if (["selected", "hidden", "center"].includes(split[0])) {
          out[split[0]] = JSON.parse(split[1]);
        } else if (split[0] === "datetime") {
          out[split[0]] = new Date(split[1] * 1000);
        } else if (["depth", "zoom"].includes(split[0])) {
          out[split[0]] = parseFloat(split[1]);
        } else if (split[0] === "basemap") {
          out[split[0]] = split[1];
        }
      } catch (e) {
        console.error("Parsing query " + split[0] + " failed.");
      }
    }
    return out;
  };

  fixedEncodeURI = (str) => {
    return str.replace(/%5b/g, "[").replace(/%5d/g, "]");
  };

  searchLocation = (defaults) => {
    var { selected, hidden, datetime, depth, zoom, center, basemap } = defaults;
    return [
      "?",
      "selected=",
      JSON.stringify(selected),
      "&hidden=",
      JSON.stringify(hidden),
      "&datetime=",
      Math.round(datetime.getTime() / 1000),
      "&depth=",
      depth,
      "&zoom=",
      JSON.stringify(zoom),
      "&center=",
      JSON.stringify(center),
      "&basemap=",
      basemap,
    ].join("");
  };

  setDefaults = (defaults) => {
    var new_search = this.searchLocation(defaults);
    let { search, pathname } = this.props.location;
    if (new_search !== search) {
      this.props.history.push({
        pathname: pathname,
        search: new_search,
      });
    }
  };

  render() {
    document.title = "Map Viewer - Datalakes";
    var { search } = this.props.location;
    search = this.fixedEncodeURI(search);
    var defaults = this.parseSearch(search);
    return (
      <div className="mapviewer">
        <GIS defaults={defaults} setDefaults={this.setDefaults} />
      </div>
    );
  }
}

export default MapViewer;
