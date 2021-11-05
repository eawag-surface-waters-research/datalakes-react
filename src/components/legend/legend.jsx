import React, { Component } from "react";
import "./legend.css";
import MarkerLegendItem from "./markerlegenditem";
import RasterLegendItem from "./rasterlegenditem";

class Legend extends Component {
  state = {
    open: this.props.open,
  };
  toggle = () => {
    this.setState({ open: !this.state.open });
  };
  render() {
    var { open } = this.state;
    var { selectedlayers } = this.props;
    var legendmaplayers = selectedlayers.filter((layer) => layer.legend);
    var inner = [];
    var l;
    for (var i = 0; i < legendmaplayers.length; i++) {
      l = legendmaplayers[i];
      if (l.mapplot === "marker") {
        inner.push(
          <div key={i} className="legend-inner">
            {l.title}
            <div>{l.name}</div>
            <MarkerLegendItem
              min={l.min}
              max={l.max}
              unit={l.unit}
              colors={l.colors}
              markerFixedSize={l.markerFixedSize}
              markerSymbol={l.markerSymbol}
            />
            <div>{l.realdatetime.toString()}</div>
            <div>Depth: {Math.round(l.realdepth * 100) / 100}m</div>
            <a href={l.datasourcelink} title="Data source">
              {l.datasource}
            </a>
          </div>
        );
      }
      if (l.mapplot === "raster") {
        inner.push(
          <div key={i} className="legend-inner">
            {l.title}
            <div>{l.name}</div>
            <RasterLegendItem
              min={l.min}
              max={l.max}
              unit={l.unit}
              colors={l.colors}
            />
            <div>{l.realdatetime.toString()}</div>
            <div>Depth: {Math.round(l.realdepth * 100) / 100}m</div>
            <a href={l.datasourcelink} title="Data source">
              {l.datasource}
            </a>
          </div>
        );
      }
      if (l.mapplot === "field") {
        inner.push(
          <div key={i} className="legend-inner">
            {l.title}
            <div>{l.name}</div>
            <RasterLegendItem
              min={l.min}
              max={l.max}
              unit={l.unit}
              colors={l.colors}
            />
            <div>{l.realdatetime.toString()}</div>
            <div>Depth: {Math.round(l.realdepth * 100) / 100}m</div>
            <a href={l.datasourcelink} title="Data source">
              {l.datasource}
            </a>
          </div>
        );
      }
    }
    return (
      <div className={open ? "legend" : "legend hide"}>
        {inner.length > 0 && (
          <div
            className="legend-title"
            onClick={this.toggle}
            title={open ? "Hide legend" : "Show legend"}
          >
            <div className="legend-title-text">Legend</div>
          </div>
        )}
        <div className={open ? "legend-content" : "legend-content hide"}>
          {inner}
        </div>
      </div>
    );
  }
}

export default Legend;
