import React, { Component } from "react";
import editlayers from "./img/editlayers.svg";
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
      <div className="layergroups-item" onClick={this.clickOnGroup}>
        <img src={img} alt={name} />
        <div>{name}</div>
      </div>
    );
  }
}

class LayerGroups extends Component {
  render() {
    var { setLayerGroup } = this.props;
    var groups = [
      {
        name: "Lake Geneva Algal Bloom 06.09.21",
        description: "Some description",
        img: editlayers,
        data: {
          selected: [
            [20, 15],
            [14, 25],
          ],
          center: [46.405, 6.578],
          zoom: 11,
          datetime: new Date(1630937100000),
        },
      },
      {
        name: "Lake Zurich 3D Model",
        description: "Some description",
        img: editlayers,
        data: {
          selected: [
            [11, 5],
            [11, 25],
          ],
          center: [47.282, 8.729],
          zoom: 12,
        },
      },
      {
        name: "Lake Geneva 3D Model",
        description: "Some description",
        img: editlayers,
        data: {
          selected: [
            [14, 5],
            [14, 25],
          ],
          center: [46.405, 6.578],
          zoom: 11,
        },
      },
      {
        name: "Lake Greifen 3D Model",
        description: "Some description",
        img: editlayers,
        data: {
          selected: [
            [15, 5],
            [15, 25],
          ],
          center: [47.347, 8.683],
          zoom: 13,
        },
      },
      {
        name: "Lake Geneva Chlorophyll",
        description: "Some description",
        img: editlayers,
        data: {
          selected: [
            [20, 15],
            [14, 25],
          ],
          center: [46.405, 6.578],
          zoom: 11,
        },
      },
    ];
    return (
      <div className="layergroups">
        <div className="layergroups-header">
          Select an example package or add a layer to start building your own
          custom map.
        </div>
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
        {groups.map((g) => (
          <Group key={g.name} properties={g} setLayerGroup={setLayerGroup} />
        ))}
      </div>
    );
  }
}

export default LayerGroups;
