import React, { Component } from "react";
import "./maplayers.css";
import {
  SortableContainer,
  SortableElement,
  arrayMove
} from "react-sortable-hoc";
import RasterLegendItem from "../legend/rasterlegenditem";
import MarkerLegendItem from "../legend/markerlegenditem";
import LayerObject from "./layerobject";

class GroupDisplay extends Component {
  state = {};
  render() {
    var { display } = this.props;
    var {
      mapplot,
      min,
      max,
      datasetparameters,
      datasourcelink,
      datasource,
      description,
      colors,
      markerFixedSize,
      markerSymbol,
      parameters_id
    } = display;
    var datasetparameter = datasetparameters.find(dp => dp.parameters_id === parameters_id);
    var { unit } = datasetparameter;
    var inner = <div></div>;
    if (mapplot === "marker")
      inner = (
        <MarkerLegendItem
          min={min}
          max={max}
          unit={unit}
          colors={colors}
          markerFixedSize={markerFixedSize}
          markerSymbol={markerSymbol}
        />
      );
    if (mapplot === "raster")
      inner = (
        <RasterLegendItem min={min} max={max} unit={unit} colors={colors} />
      );
    if (mapplot === "field")
      inner = (
        <RasterLegendItem min={min} max={max} unit={unit} colors={colors} />
      );
    return (
      <div>
        <div>{description}</div>
        {inner}
        Source:{" "}
        <a href={datasourcelink} target="_blank" rel="noopener noreferrer">
          {datasource}
        </a>
      </div>
    );
  }
}

const SortableItem = SortableElement(({ layer, props }) => {
  var { id, title, name, color } = layer;
  var {
    selectedlayers,
    removeSelected,
    updateMapLayers,
    toggleLayerView
  } = props;
  return (
    <li tabIndex={0}>
      <LayerObject
        id={id}
        key={id}
        title={title}
        parameter_name={name}
        color={color}
        allowSettings={true}
        display={layer}
        displayGroup={selectedlayers}
        removeSelected={removeSelected}
        onUpdate={updateMapLayers}
        toggleLayerView={toggleLayerView}
        content={<GroupDisplay key={id} display={layer} />}
      />
    </li>
  );
});

const SortableList = SortableContainer(({ props }) => {
  var { selectedlayers } = props;
  return (
    <ul className="maplayers-list">
      {selectedlayers.map((layer, index) => (
        <SortableItem
          key={`item-${index}`}
          index={index}
          layer={layer}
          props={props}
        />
      ))}
    </ul>
  );
});

class MapLayers extends Component {
  onSortEnd = ({ oldIndex, newIndex }) => {
    var { selectedlayers, setSelected } = this.props;
    selectedlayers = arrayMove(selectedlayers, oldIndex, newIndex);
    setSelected(selectedlayers);
  };
  
  render() {
    if (this.props.selectedlayers.length > 0){
      return (
        <SortableList
          props={this.props}
          onSortEnd={this.onSortEnd}
          distance={10}
          useDragHandle
          lockAxis="y"
        />
      );
    } else {
      return (<div className="maplayers-label">
        Customise your map by adding layers from the dropdown below. <div className="maplayers-arrow">&darr;</div>
      </div>)
    }
    
  }
}

export default MapLayers;
