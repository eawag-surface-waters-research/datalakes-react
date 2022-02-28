import React, { Component } from "react";
import axios from "axios";
import { apiUrl } from "../../config.json";
import "./css/datalakesgis.css";
import Basemap from "./basemap";
import DatetimeDepthSelector from "../../components/datetimedepthselector/datetimedepthselector";
import SidebarDatetime from "../../components/sidebardatetime/sidebardatetime";
import LayerGroups from "../../components/layergroups/layergroups";
import MapLayers from "../../components/maplayers/maplayers";

class GIS extends Component {
  state = {
    menu: window.screen.width < 900 ? false : true,
    selectedlayers: [],
    parameters: [],
    datasets: [],
    downloads: [],
    datasetparameters: [],
    loading: true,
    selected: [],
    hidden: [],
    datetime: new Date(),
    depth: 0,
    timestep: 180,
    center: [46.85, 7.55],
    zoom: 9,
    basemap: "datalakesmap",
    modal: false,
    modaltext: "",
    modaldetail: "",
    lakejson: false,
  };

  hideMenu = () => {
    this.setState({ menu: false }, () => {
      window.dispatchEvent(new Event("resize"));
    });
  };
  showMenu = () => {
    this.setState({ menu: true }, () => {
      window.dispatchEvent(new Event("resize"));
    });
  };

  getSliderParameters = (selectedlayers) => {
    var files = [];
    var mindatetime = Infinity;
    var maxdatetime = -Infinity;
    var mindepth = 0;
    var maxdepth = 100;
    for (var i = 0; i < selectedlayers.length; i++) {
      mindatetime = new Date(
        Math.min(mindatetime, new Date(selectedlayers[i].mindatetime))
      );
      maxdatetime = new Date(
        Math.max(maxdatetime, new Date(selectedlayers[i].maxdatetime))
      );
      maxdepth = Math.max(maxdepth, selectedlayers[i].maxdepth);

      files = files.concat(selectedlayers[i].files);
    }
    maxdepth = Math.min(370, maxdepth);
    if (mindatetime === Infinity)
      mindatetime = new Date().getTime() - 1209600000;
    if (maxdatetime === -Infinity) maxdatetime = new Date().getTime();
    maxdatetime = new Date(maxdatetime);
    mindatetime = new Date(mindatetime);
    return { files, mindepth, maxdepth, mindatetime, maxdatetime };
  };

  updateLocation = (zoom, center) => {
    if (zoom !== this.state.zoom || center !== this.state.center) {
      this.setState({ zoom, center });
    }
  };

  siderbarMinDatetime = (datetime) => {
    var months = [
      "January",
      "Feburary",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${datetime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })} ${datetime.getDate()} ${
      months[datetime.getMonth()]
    } ${datetime.getFullYear()}`;
  };

  async componentDidMount() {
    // Defaults
    var { selected, hidden, datetime, depth, zoom, center, basemap, lakejson } =
      this.state;

    // Get data
    let server = await Promise.all([
      axios.get(apiUrl + "/selectiontables/parameters"),
      axios.get(apiUrl + "/datasets"),
      axios.get(apiUrl + "/datasetparameters"),
    ]).catch((error) => {
      console.log(error);
    });

    var parameters = server[0].data;
    var datasets = server[1].data;
    var datasetparameters = server[2].data;

    // Build selected layers object
    var selectedlayers = [];
    /** var fixedSelected = JSON.parse(JSON.stringify(selected));
    for (var i = fixedSelected.length - 1; i > -1; i--) {
      var datasets_id = fixedSelected[i][0];
      var parameters_id = fixedSelected[i][1];
      ({ selectedlayers, datasets, selected, lakejson } =
        await this.addNewLayer(
          selected,
          datasets_id,
          parameters_id,
          datasets,
          selectedlayers,
          datasetparameters,
          parameters,
          datetime,
          depth,
          hidden,
          lakejson
        ));
    } **/

    var { mindatetime, maxdatetime, mindepth, maxdepth } =
      this.getSliderParameters(selectedlayers);

    this.setState({
      selectedlayers,
      parameters,
      datasets,
      datasetparameters,
      loading: false,
      selected,
      hidden,
      datetime,
      depth,
      zoom,
      center,
      basemap,
      mindatetime,
      maxdatetime,
      mindepth,
      maxdepth,
      lakejson,
    });
  }
  render() {
    var { menu } = this.state;
    return (
      <div className="gis">
        <div
          className={menu ? "sidebar" : "sidebar min"}
          onClick={!menu ? this.showMenu : () => {}}
        >
          <div className="boundary" />
          <div
            className={menu ? "siderbar-mini hide" : "siderbar-mini"}
            title="Click to open menu."
          >
            &#9776;
            <div className="rotate">
              {this.siderbarMinDatetime(this.state.datetime)}
            </div>
          </div>
          <div className={menu ? "sidebar-inner" : "sidebar-inner hide"}>
            <SidebarDatetime
              datetime={this.state.datetime}
              depth={this.state.depth}
              onChangeDepth={this.onChangeDepth}
              onChangeDatetime={this.onChangeDatetime}
            />
            {this.state.selectedlayers.length === 0 ? (
              <LayerGroups setLayerGroup={this.setLayerGroup} />
            ) : (
              <MapLayers
                selectedlayers={this.state.selectedlayers}
                setSelected={this.setSelected}
                removeSelected={this.removeSelected}
                toggleLayerView={this.toggleLayerView}
                updateMapLayers={this.updateMapLayers}
              />
            )}
          </div>
          <div className={menu ? "sidebar-buttons" : "sidebar-buttons hide"}>
            <button className="hidemenu" onClick={this.hideMenu}>
              Hide Menu
            </button>
            <button className="addlayers">Add Layers</button>
          </div>
        </div>
        <div className={menu ? "map" : "map min"}>
          <Basemap
            selectedlayers={this.state.selectedlayers}
            basemap={this.state.basemap}
            loading={this.state.loading}
            datasets={this.state.datasets}
            depth={this.state.depth}
            datetime={this.state.datetime}
            center={this.state.center}
            zoom={this.state.zoom}
            updateLocation={this.updateLocation}
            lakejson={this.state.lakejson}
            setZoomIn={this.setZoomIn}
            setZoomOut={this.setZoomOut}
          />
          <DatetimeDepthSelector
            selectedlayers={this.state.selectedlayers}
            mindatetime={this.state.mindatetime}
            maxdatetime={this.state.maxdatetime}
            mindepth={this.state.mindepth}
            maxdepth={this.state.maxdepth}
            datetime={this.state.datetime}
            depth={this.state.depth}
            timestep={this.state.timestep}
            onChangeDatetime={this.onChangeDatetime}
            onChangeDepth={this.onChangeDepth}
            onChangeTimestep={this.onChangeTimestep}
          />
        </div>
      </div>
    );
  }
}

export default GIS;
