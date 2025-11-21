import React, { Component } from "react";
import axios from "axios";
import { apiUrl, basemaps } from "../../config.json";
import Basemap from "../../graphs/leaflet/basemap";
import Loading from "../../components/loading/loading";
import BasemapSelector from "../../components/basemapselector/basemapselector";
import "./mapviewer.css";

class Modal extends Component {
  state = {};
  preventClose = (event) => {
    event.stopPropagation();
  };
  render() {
    var { title, content, visible, hide } = this.props;
    return (
      <div className={visible ? "layers" : "layers hide"} onClick={hide}>
        <div className="layers-modal">
          <div className="layers-modal-header">
            {title}
            <div className="close" onClick={hide}>
              &times;
            </div>
          </div>
          <div className="layers-modal-content" onClick={this.preventClose}>
            {content}
          </div>
        </div>
      </div>
    );
  }
}

class MapViewer extends Component {
  state = {
    parameters: [],
    datasets: [],
    downloads: [],
    datasetparameters: [],
    loading: true,
    center: [46.85, 7.55],
    zoom: 9,
    basemap: "datalakesmap",
    modal: false,
    modaltext: "",
    modaldetail: "",
  };

  onChangeBasemap = (basemap) => {
    this.setState({ basemap });
  };

  async componentDidMount() {
    try {
      let server = await Promise.all([
        axios.get(apiUrl + "/selectiontables/parameters"),
        axios.get(apiUrl + "/datasets"),
        axios.get(apiUrl + "/datasetparameters"),
        axios.get(apiUrl + "/selectiontables/lakes"),
      ]);
      var parameters = server[0].data;
      var datasets = server[1].data;
      var datasetparameters = server[2].data;

      datasetparameters.map((dp) => {
        let param = parameters.find((p) => p.id === dp.parameters_id);
        dp.name = param.name;
        return dp;
      });

      this.setState({
        parameters,
        datasets,
        datasetparameters,
        loading: false,
        lakes: server[3].data,
      });
    } catch (error) {
      console.error(error);
      let modaltext = `Appologies the Datalakes API is experiencing some connectivity issues. Please wait a few minutes then try refreshing the page.`;
      this.setState({
        loading: false,
        modal: true,
        modaltext,
        modaldetail: error.message,
      });
    }
  }

  render() {
    document.title = "Map Viewer - Datalakes";
    return (
      <div className="mapviewer">
        <div className="gis">
          <div className="map">
            <Basemap
              basemap={this.state.basemap}
              loading={this.state.loading}
              datasets={this.state.datasets}
              datasetparameters={this.state.datasetparameters}
              center={this.state.center}
              zoom={this.state.zoom}
              plotDatasets={true}
            />
            <BasemapSelector
              center={this.state.center}
              zoom={this.state.zoom}
              basemaps={basemaps}
              basemap={this.state.basemap}
              onChangeBasemap={this.onChangeBasemap}
            />
            {this.state.loading && (
              <div className="map-loading">
                <div className="map-loading-inner">
                  <Loading />
                  Loading Layers
                </div>
              </div>
            )}
          </div>
          <Modal
            title={this.state.modaldetail}
            visible={this.state.modal}
            hide={this.closeModal}
            content={<div>{this.state.modaltext}</div>}
          />
        </div>
      </div>
    );
  }
}

export default MapViewer;
