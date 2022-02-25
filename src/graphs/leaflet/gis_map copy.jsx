import React, { Component } from "react";
import Loading from "../../components/loading/loading";
import LayerGroups from "../../components/layergroups/layergroups";
import "./css/gis_map.css";
import Basemap from "./basemap";
import MapControl from "../../components/mapcontrol/mapcontrol";
import menuicon from "./img/menuicon.svg";
import groupicon from "./img/groupicon.svg";
import MapMenu from "../../components/mapmenu/mapmenu";

class GISMap extends Component {
  state = {
    help: false,
    fullsize: false,
    loading: false,
    group: false,
    menu: false,
    initial: true,
    zoomIn: () => {},
    zoomOut: () => {},
  };

  setZoomIn = (newFunc) => {
    this.setState({ zoomIn: newFunc });
  };

  setZoomOut = (newFunc) => {
    this.setState({ zoomOut: newFunc });
  };

  toggleFullsize = () => {
    if (!this.state.fullsize) {
      if (document.documentElement.requestFullScreen) {
        document.documentElement.requestFullScreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullScreen) {
        document.documentElement.webkitRequestFullScreen(
          Element.ALLOW_KEYBOARD_INPUT
        );
      }
    } else {
      if (document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
    }
    this.setState({ fullsize: !this.state.fullsize });
  };

  toggleHelp = () => {
    this.setState({ group: false, help: !this.state.help });
  };

  toggleMenu = () => {
    this.setState({ group: false, menu: !this.state.menu });
  };

  toggleGroup = () => {
    this.setState({ help: false, menu: false, group: !this.state.group });
  };

  componentDidUpdate() {
    if (!this.props.loading && this.state.initial) {
      if (this.props.selectedlayers.length > 0) {
        this.setState({ menu: true, initial: false });
      } else {
        this.setState({ group: true, initial: false });
      }
    }
  }

  render() {
    var { help, fullsize, menu, group, zoomIn, zoomOut } = this.state;
    var {
      legend,
      timeselector,
      loading,
      sidebar,
      updateState,
      updateLocation,
      selectedlayers,
      basemap,
      datasets,
      datetime,
      depth,
      templates,
      center,
      zoom,
      lakejson,
    } = this.props;
    var load = loading;
    return (
      <div className="gis">
        <div className="sidebar">
          <div className="boundary" />
          <div className="sidebar-gis">
            <div className="sidebar-content">{sidebar}</div>
          </div>
        </div>
        <div className="map">
          <div className="gis-controls">
            <MapControl
              zoomIn={zoomIn}
              zoomOut={zoomOut}
              fullsize={fullsize}
              toggleFullsize={this.toggleFullsize}
            />
          </div>
          <Basemap
            selectedlayers={selectedlayers}
            basemap={basemap}
            loading={loading}
            datasets={datasets}
            depth={depth}
            datetime={datetime}
            center={center}
            zoom={zoom}
            templates={templates}
            updateLocation={updateLocation}
            lakejson={lakejson}
            setZoomIn={this.setZoomIn}
            setZoomOut={this.setZoomOut}
          />

          {load && (
            <div className="map-loader">
              <Loading />
              Downloading and plotting data
            </div>
          )}

          <div className="timeselector-gis">{timeselector}</div>
          <div className="mapviewerlegend">{legend}</div>
        </div>
      </div>
    );
  }
}

export default GISMap;
