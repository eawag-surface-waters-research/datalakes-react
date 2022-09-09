import React, { Component } from "react";
import editlayers from "./img/editlayers.svg";
import config from "../../config.json";
import drawing from "./img/drawing.svg";
import "./layergroups.css";

class Group extends Component {
  clickOnGroup = () => {
    var { setLayerGroup, properties, onClick } = this.props;
    if (onClick) {
      onClick();
    } else {
      var { data } = properties;
      setLayerGroup(data);
    }
  };
  render() {
    var { name, img } = this.props.properties;
    return (
      <div className="layergroups-item" onClick={this.clickOnGroup} title={`Add to map`}>
        <img src={img} alt={name} />
        <div>{name}</div>
      </div>
    );
  }
}

class LayerGroups extends Component {
  render() {
    var { setLayerGroup } = this.props;
    var lgroups = JSON.parse(JSON.stringify(config.groups));
    lgroups = lgroups.map((g) => {
      if ("datetime" in g.data) {
        g.data.datetime = new Date(g.data.datetime * 1000);
      }
      g.img = editlayers;
      return g;
    });
    return (
      <div className="layergroups">
        <div className="layergroups-header">
          Select an example package or add a layer to start building your own
          custom map.
        </div>
        <div className="layergroups-content">
          <Group
            key={"Add Layers"}
            properties={{
              name: "Add Layers",
              description: "Click here to add a new layers.",
              img: drawing,
              data: { selected: [] },
            }}
            setLayerGroup={setLayerGroup}
            onClick={this.props.showLayers}
          />
          {lgroups.map((g) => (
            <Group key={g.name} properties={g} setLayerGroup={setLayerGroup} />
          ))}
        </div>
      </div>
    );
  }
}

export default LayerGroups;
