import React, { Component } from "react";
import "./legend.css";
import MarkerLegendItem from "./markerlegenditem";
import RasterLegendItem from "./rasterlegenditem";

class PrintLegend extends Component {
  render() {
    var { selectedlayers } = this.props;
    var legendmaplayers = selectedlayers.filter((layer) => layer.legend);
    var inner = [];
    var l;
    for (var i = 0; i < legendmaplayers.length; i++) {
      l = legendmaplayers[i];
      if (l.mapplot === "marker") {
        inner.push(
          <div key={i} className="legend-inner">
            {l.name}
            <MarkerLegendItem
              min={l.min}
              max={l.max}
              unit={l.unit}
              colors={l.colors}
              markerFixedSize={l.markerFixedSize}
              markerSymbol={l.markerSymbol}
            />
            <a href={l.datasourcelink} title="Data source">
              {l.datasource}
            </a>
          </div>
        );
      }
      if (l.mapplot === "raster") {
        inner.push(
          <div key={i} className="legend-inner">
            {l.name}
            <RasterLegendItem
              min={l.min}
              max={l.max}
              unit={l.unit}
              colors={l.colors}
            />
            <a href={l.datasourcelink} title="Data source">
              {l.datasource}
            </a>
          </div>
        );
      }
      if (l.mapplot === "field") {
        inner.push(
          <div key={i} className="legend-inner">
            {l.name}
            <RasterLegendItem
              min={l.min}
              max={l.max}
              unit={l.unit}
              colors={l.colors}
            />
            <a href={l.datasourcelink} title="Data source">
              {l.datasource}
            </a>
          </div>
        );
      }
    }
    return (
      <React.Fragment>
        {inner.length > 0 && (
          <div className="printlegend">
            <div className="legend-title-text">Legend</div>
            <div className="legend-content">{inner}</div>
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default PrintLegend;
