import React, { Component } from "react";
import { Link } from 'react-router-dom'
import heat from "./img/heat.svg";
import line from "./img/line.svg";
import preview from "./img/preview.svg";
import download from "./img/download.svg";
import pipe from "./img/pipe.svg";
import info from "./img/info.svg";
import webgis from "./img/webgis.svg";
import td from "./img/3d.svg";
import map from "./img/map.svg";
import "./css/datadetail.css";

class DataSubMenu extends Component {
    hide = (name, allowedStep) => {
        return !allowedStep.includes(name);
    }
    active = (name, step) => {
        return name === step;
    }

    render() {
      const { step, allowedStep, updateSelectedState, link } = this.props;
      return (
        <React.Fragment>
          <div className="data-subnav">
            <div
              title="Interact with 3D model"
              className={this.active("threedmodel",step) ? "subnav-item active" : "subnav-item"}
              style={{display: this.hide("threedmodel",allowedStep) && 'none'}}
              onClick={() => updateSelectedState("threedmodel")}
            >
              <img src={td} className="subnav-img" alt="3D" />
              <div className="subnav-text">3D Model</div>
            </div>
            <div
              title="Interact with ch2018 data"
              className={this.active("ch2018",step) ? "subnav-item active" : "subnav-item"}
              style={{display: this.hide("ch2018",allowedStep) && 'none'}}
              onClick={() => updateSelectedState("ch2018")}
            >
              <img src={line} className="subnav-img" alt="ch2018" />
              <div className="subnav-text">Graph</div>
            </div>
            <div
              title="Download ch2018 data"
              className={this.active("ch2018download",step) ? "subnav-item active" : "subnav-item"}
              style={{display: this.hide("ch2018download",allowedStep) && 'none'}}
              onClick={() => updateSelectedState("ch2018download")}
            >
              <img src={download} className="subnav-img" alt="ch2018download" />
              <div className="subnav-text">Download</div>
            </div>
            <div
              title="Interact with remote sensing data"
              className={this.active("remotesensing",step) ? "subnav-item active" : "subnav-item"}
              style={{display: this.hide("remotesensing",allowedStep) && 'none'}}
              onClick={() => updateSelectedState("remotesensing")}
            >
              <img src={td} className="subnav-img" alt="3D" />
              <div className="subnav-text">Map</div>
            </div>
            <div
              title="Download Three Dimentional Model Data"
              className={this.active("threedmodeldownload",step) ? "subnav-item active" : "subnav-item"}
              style={{display: this.hide("threedmodeldownload",allowedStep) && 'none'}}
              onClick={() => updateSelectedState("threedmodeldownload")}
            >
              <img src={download} className="subnav-img" alt="3D" />
              <div className="subnav-text">Download</div>
            </div>
            <div
              title="Download Remote Sensing Data"
              className={this.active("remotesensingdownload",step) ? "subnav-item active" : "subnav-item"}
              style={{display: this.hide("remotesensingdownload",allowedStep) && 'none'}}
              onClick={() => updateSelectedState("remotesensingdownload")}
            >
              <img src={download} className="subnav-img" alt="download" />
              <div className="subnav-text">Download</div>
            </div> 
            <div
              title="Information on external data source"
              className={this.active("external",step) ? "subnav-item active" : "subnav-item"}
              style={{display: this.hide("external",allowedStep) && 'none'}}
              onClick={() => updateSelectedState("external")}
            >
              <img src={info} className="subnav-img" alt="Info" />
              <div className="subnav-text">Information</div>
            </div>
            <div
              title="Plot data"
              className={this.active("plot",step) ? "subnav-item active" : "subnav-item"}
              style={{display: this.hide("plot",allowedStep) && 'none'}}
              onClick={() => updateSelectedState("plot")}
            >
              <img src={line} className="subnav-img" alt="Plot" />
              <div className="subnav-text">Plot</div>
            </div>
            <div
              title="Preview data as a heat map"
              className={this.active("heatmap",step) ? "subnav-item active" : "subnav-item"}
              style={{display: this.hide("heatmap",allowedStep) && 'none'}}
              onClick={() => updateSelectedState("heatmap")}
            >
              <img src={heat} className="subnav-img" alt="Heatmap" />
              <div className="subnav-text">Heat Map</div>
            </div>
            <div
              title="Preview data as a line graph"
              className={this.active("linegraph",step) ? "subnav-item active" : "subnav-item"}
              style={{display: this.hide("linegraph",allowedStep) && 'none'}}
              onClick={() => updateSelectedState("linegraph")}
            >
              <img src={line} className="subnav-img" alt="Line Graph" />
              <div className="subnav-text">Line Graph</div>
            </div>
            <div
              title="Preview data on the map"
              className={this.active("locationmap",step) ? "subnav-item active" : "subnav-item"}
              style={{display: this.hide("locationmap",allowedStep) && 'none'}}
              onClick={() => updateSelectedState("locationmap")}
            >
              <img src={map} className="subnav-img" alt="Location Map" />
              <div className="subnav-text">Map</div>
            </div>
            <div
              title="Preview data as a table"
              className={this.active("preview",step) ? "subnav-item active" : "subnav-item"}
              style={{display: this.hide("preview",allowedStep) && 'none'}}
              onClick={() => updateSelectedState("preview")}
            >
              <img src={preview} className="subnav-img" alt="Preview" />
              <div className="subnav-text">Preview</div>
            </div>
            <div
              title="Download data"
              className={this.active("download",step) ? "subnav-item active" : "subnav-item"}
              style={{display: this.hide("download",allowedStep) && 'none'}}
              onClick={() => updateSelectedState("download")}
            >
              <img src={download} className="subnav-img" alt="Download" />
              <div className="subnav-text">Download</div>
            </div>
            <div
              title="See the data lineage"
              className={this.active("pipeline",step) ? "subnav-item active" : "subnav-item"}
              style={{display: this.hide("pipeline",allowedStep) && 'none'}}
              onClick={() => updateSelectedState("pipeline")}
            >
              <img src={pipe} className="subnav-img" alt="Data Pipeline" />
              <div className="subnav-text">Reproduce</div>
            </div>
            <div
              title="See meta data for dataset"
              className={this.active("information",step) ? "subnav-item active" : "subnav-item"}
              style={{display: this.hide("information",allowedStep) && 'none'}}
              onClick={() => updateSelectedState("information")}
            >
              <img src={info} className="subnav-img" alt="Information" />
              <div className="subnav-text">Information</div>
            </div>
            <Link
              to ={link}
              title="See dataset in web GIS"
              className={this.active("webgis",step) ? "subnav-item active" : "subnav-item"}
              style={{display: this.hide("webgis",allowedStep) && 'none'}}
            >
              <img src={webgis} className="subnav-img" alt="webgis" />
              <div className="subnav-text">Web GIS</div>
            </Link>
          </div>
        </React.Fragment>
      );
    }
  }

  export default DataSubMenu;