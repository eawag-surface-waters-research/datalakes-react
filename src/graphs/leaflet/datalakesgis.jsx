import React, { Component } from "react";
import axios from "axios";
import { apiUrl, basemaps } from "../../config.json";
import Basemap from "./basemap";
import DatetimeDepthSelector from "../../components/datetimedepthselector/datetimedepthselector";
import SidebarDatetime from "../../components/sidebardatetime/sidebardatetime";
import LayerGroups from "../../components/layergroups/layergroups";
import MapLayers from "../../components/maplayers/maplayers";
import AddLayers from "../../components/addlayers/addlayers";
import Legend from "../../components/legend/legend";
import colorlist from "../../components/colorramp/colors";
import "./css/datalakesgis.css";
import Loading from "../../components/loading/loading";
import BasemapSelector from "../../components/basemapselector/basemapselector";
import { Calendar } from "react-calendar";

class Modal extends Component {
  state = {};
  render() {
    var { title, content, visible, hide } = this.props;
    return (
      <div className={visible ? "layers" : "layers hide"}>
        <div className="layers-modal">
          <div className="layers-modal-header">
            {title}
            <div className="close" onClick={hide}>
              &times;
            </div>
          </div>
          <div className="layers-modal-content">{content}</div>
        </div>
      </div>
    );
  }
}

class TimeDepth extends Component {
  state = {
    time: `${this.props.datetime.getHours()}:${this.props.datetime.getMinutes()}`,
    depth: this.props.depth,
  };
  onChangeTime = (event) => {
    this.setState({ time: event.target.value });
  };

  onChangeDepth = (event) => {
    this.setState({ depth: event.target.value });
  };

  update = () => {
    var { time, depth } = this.state;
    this.props.onChangeDepth(depth);
    var datetime = new Date(this.props.datetime.getTime());
    var time_arr = time.split(":");
    datetime.setHours(time_arr[0]);
    datetime.setMinutes(time_arr[1]);
    this.props.onChangeDatetime(datetime);
  };

  componentDidUpdate = (prevProps) => {
    if (prevProps.datetime !== this.props.datetime) {
      this.setState({
        time: `${this.props.datetime.getHours()}:${this.props.datetime.getMinutes()}`,
      });
    }
    if (prevProps.depth !== this.props.depth) {
      this.setState({
        depth: this.props.depth,
      });
    }
  };

  render() {
    return (
      <div className="timedepth">
        <input
          className="input-time"
          type="time"
          value={this.state.time}
          onChange={this.onChangeTime}
        />
        <input
          className="input-depth"
          type="number"
          value={this.state.depth}
          onChange={this.onChangeDepth}
        />
        m<button onClick={this.update}>Update</button>
      </div>
    );
  }
}

class GIS extends Component {
  state = {
    menu: window.screen.width < 900 ? false : true,
    layersModal: false,
    dateModal: false,
    timeDepthModal: false,
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

  hideTimeDepthModal = () => {
    this.setState({ timeDepthModal: false });
  };

  showTimeDepthModal = () => {
    this.setState({ timeDepthModal: true });
  };

  hideDateModal = () => {
    this.setState({ dateModal: false });
  };

  showDateModal = () => {
    this.setState({ dateModal: true });
  };

  hideLayersModal = () => {
    this.setState({ layersModal: false });
  };

  showLayersModal = () => {
    this.setState({ layersModal: true });
  };

  closeModal = () => {
    this.setState({ modal: false, modaltext: "" });
  };

  updateLocation = (zoom, center) => {
    if (zoom !== this.state.zoom || center !== this.state.center) {
      this.setState({ zoom, center });
    }
  };

  updateState = async (newState) => {
    this.setState({ loading: true }, async () => {
      if ("selected" in newState) {
        var {
          datasets,
          datasetparameters,
          parameters,
          datetime,
          depth,
          hidden,
          lakejson,
        } = this.state;
        var { selected } = newState;
        if ("datetime" in newState) datetime = newState.datetime;
        var selectedlayers = [];
        var fixedSelected = JSON.parse(JSON.stringify(selected));
        for (var i = 0; i < fixedSelected.length; i++) {
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
        }
        var { mindatetime, maxdatetime, mindepth, maxdepth } =
          this.getSliderParameters(selectedlayers);
        newState["selectedlayers"] = selectedlayers;
        newState["datasets"] = datasets;
      }
      newState["loading"] = false;
      this.setState({ mindatetime, maxdatetime, mindepth, maxdepth, lakejson });
      this.setState(newState);
    });
  };

  onChangeTimestep = (timestep) => {
    if (timestep !== this.state.timestep) {
      this.setState({ timestep });
    }
  };

  onChangeDatetime = async (datetime) => {
    if (datetime.getTime() !== this.state.datetime.getTime()) {
      var { depth } = this.state;
      await this.updateVariable(datetime, depth);
    }
  };

  onChangeDepth = async (depth) => {
    if (depth !== this.state.depth) {
      var { datetime } = this.state;
      this.setState({ depth }, async () => {
        this.updateVariable(datetime, depth);
      });
    }
  };

  onChangeBasemap = (basemap) => {
    this.setState({ basemap });
  };

  setSelected = (selectedlayers) => {
    this.setState({ loading: true }, () => {
      var selected = [];
      for (var i = 0; i < selectedlayers.length; i++) {
        selected.push([
          selectedlayers[i].datasets_id,
          selectedlayers[i].parameters_id,
        ]);
      }
      this.setState({ selectedlayers, selected, loading: false });
    });
  };

  addSelected = async (ids) => {
    this.setState({ loading: true }, async () => {
      var {
        datasets,
        selected,
        selectedlayers,
        datasetparameters,
        parameters,
        datetime,
        depth,
        hidden,
        lakejson,
      } = this.state;
      for (var i = 0; i < ids.length; i++) {
        var { datasets_id, parameters_id } = ids[i];
        selected.unshift([datasets_id, parameters_id]);
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
      }
      var { mindatetime, maxdatetime, mindepth, maxdepth } =
        this.getSliderParameters(selectedlayers);
      this.setState({
        selectedlayers,
        selected,
        datasets,
        loading: false,
        mindatetime,
        maxdatetime,
        mindepth,
        maxdepth,
        lakejson,
      });
    });
  };

  removeSelected = (id) => {
    var dp = id.split("&");
    this.setState({ loading: true }, () => {
      var { selectedlayers, selected, hidden } = this.state;
      selectedlayers = selectedlayers.filter((x) => x.id !== id);
      selected = selected.filter(
        (x) =>
          parseInt(x[0]) !== parseInt(dp[0]) ||
          parseInt(x[1]) !== parseInt(dp[1])
      );
      hidden = hidden.filter(
        (x) =>
          parseInt(x[0]) !== parseInt(dp[0]) ||
          parseInt(x[1]) !== parseInt(dp[1])
      );
      this.setState({ selectedlayers, selected, hidden, loading: false });
    });
  };

  toggleLayerView = (id) => {
    this.setState({ loading: true }, () => {
      var { selectedlayers, hidden } = this.state;
      var index = selectedlayers.findIndex((x) => x.id === id);
      selectedlayers[index].visible = !selectedlayers[index].visible;
      var idArr = id.split("&");
      var idParse = [parseInt(idArr[0]), parseInt(idArr[1])];
      var h_fil = hidden.filter(
        (h) => h[0] !== idParse[0] && h[1] !== idParse[1]
      );
      if (h_fil.length !== hidden.length) {
        hidden = h_fil;
      } else {
        hidden.push(idParse);
      }
      this.setState({ selectedlayers, hidden, loading: false });
    });
  };

  updateMapLayers = (selectedlayers) => {
    this.setState({ loading: true }, () => {
      this.setState({ selectedlayers, loading: false });
    });
  };

  updateBaseMap = (event) => {
    this.setState({ basemap: event.target.value });
  };

  meteoSwissMarkersMinMax = (layer) => {
    var array = layer.map((x) => x.v);
    array = array.filter((x) => x !== 9999);
    var max = this.getMax(array);
    var min = this.getMin(array);
    return { filemin: min, filemax: max, filearray: array };
  };

  foenMarkersMinMax = (layer) => {
    var array = layer.map((x) => x.v);
    array = array.filter((x) => x !== 9999);
    var max = this.getMax(array);
    var min = this.getMin(array);
    return { filemin: min, filemax: max, filearray: array };
  };

  simstratMinMax = (array) => {
    var filearray;
    if (Object.keys(array).includes("time")) {
      filearray = [];
      for (var key in array) {
        if (key !== "time") {
          filearray = filearray.concat(array[key]);
        }
      }
    } else {
      filearray = array.map((x) => x.value);
    }
    var filemax = this.getMax(filearray);
    var filemin = this.getMin(filearray);
    return { filemin, filemax, filearray };
  };

  remoteSensingMinMax = (array) => {
    array = array.v;
    var max = this.getMax(array);
    var min = this.getMin(array);
    return { filemin: min, filemax: max, filearray: array };
  };

  threeDmodelScalarMinMax = (inarray) => {
    var min = Infinity;
    var max = -Infinity;
    var flat = inarray.flat();
    flat = flat.filter((item) => item !== null);
    flat = flat.map((item) => item[2]);
    min = Math.min(min, this.getMin(flat));
    max = Math.max(max, this.getMax(flat));
    return { filemin: min, filemax: max, filearray: flat };
  };

  threeDmodelVectorMinMax = (inarray) => {
    var min = Infinity;
    var max = -Infinity;
    var flat = inarray.flat();
    flat = flat.filter((item) => item !== null);
    flat = flat.map((item) =>
      Math.abs(Math.sqrt(Math.pow(item[3], 2) + Math.pow(item[4], 2)))
    );
    min = Math.min(min, this.getMin(flat));
    max = Math.max(max, this.getMax(flat));
    return { filemin: min, filemax: max, filearray: flat };
  };

  gitPlotMinMax = (data, parameters_id, datasetparameters) => {
    var datasetparameter = datasetparameters.find(
      (dp) => dp.parameters_id === parameters_id
    );
    var array = data[datasetparameter.axis].flat();
    var min = this.getMin(array);
    var max = this.getMax(array);
    return { filemin: min, filemax: max, filearray: array };
  };

  getMinMax = (data, parameters_id, datasetparameters, mapplotfunction) => {
    var min = Infinity;
    var max = -Infinity;
    var array = [];

    var filemin, filemax;
    var filearray = [];

    if (mapplotfunction === "gitPlot") {
      ({ filemin, filemax, filearray } = this.gitPlotMinMax(
        data,
        parameters_id,
        datasetparameters
      ));
    }
    if (mapplotfunction === "meteoSwissMarkers") {
      ({ filemin, filemax, filearray } = this.meteoSwissMarkersMinMax(data));
    }
    if (mapplotfunction === "simstrat") {
      ({ filemin, filemax, filearray } = this.simstratMinMax(data));
    }
    if (mapplotfunction === "remoteSensing") {
      ({ filemin, filemax, filearray } = this.remoteSensingMinMax(data));
    }
    if (mapplotfunction === "meteolakes" || mapplotfunction === "datalakes") {
      if (parameters_id === 25) {
        ({ filemin, filemax, filearray } = this.threeDmodelVectorMinMax(
          data.data
        ));
      } else {
        ({ filemin, filemax, filearray } = this.threeDmodelScalarMinMax(
          data.data
        ));
      }
    }

    if (mapplotfunction === "foenMarkers") {
      ({ filemin, filemax, filearray } = this.foenMarkersMinMax(data));
    }

    if (filemin < min) min = filemin;
    if (filemax > max) max = filemax;
    array = array.concat(filearray);

    return { min, max, array };
  };

  getMax = (arr) => {
    let len = arr.length;
    let max = -Infinity;

    while (len--) {
      max = arr[len] > max ? arr[len] : max;
    }
    return max;
  };

  getMin = (arr) => {
    let len = arr.length;
    let min = Infinity;

    while (len--) {
      min = arr[len] < min ? arr[len] : min;
    }
    return min;
  };

  parseColor = (colorname) => {
    var defaultColors = [
      { color: "#0000ff", point: 0 },
      { color: "#ff0000", point: 1 },
    ];
    var colorparse = colorlist.find((c) => c.name === colorname);
    if (colorparse) {
      return colorparse.data;
    } else {
      return defaultColors;
    }
  };

  parseBoolean = (bool) => {
    if (bool === "true") {
      return true;
    } else {
      return false;
    }
  };

  closestFile = (datetime, depth, files) => {
    var time = new Date(datetime).getTime() / 1000;
    var array = [];
    for (var i = 0; i < files.length; i++) {
      var fileid = files[i].id;
      var mintime = new Date(files[i].mindatetime).getTime() / 1000;
      var maxtime = new Date(files[i].maxdatetime).getTime() / 1000;
      var mindepth = files[i].mindepth;
      var maxdepth = files[i].maxdepth;
      var timedistance;
      if (time > mintime && time < maxtime) {
        timedistance = 0;
      } else {
        timedistance = Math.min(
          Math.abs(mintime - time),
          Math.abs(maxtime - time)
        );
      }
      var depthdistance;
      if (depth > mindepth && depth < maxdepth) {
        depthdistance = 0;
      } else {
        depthdistance = Math.min(
          Math.abs(mindepth - depth),
          Math.abs(maxdepth - depth)
        );
      }
      array.push({ fileid, timedistance, depthdistance });
    }
    array.sort((a, b) => {
      if (a.timedistance > b.timedistance) {
        return 1;
      } else if (a.timedistance === b.timedistance) {
        if (a.depthdistance > b.depthdistance) {
          return 1;
        } else {
          return -1;
        }
      } else {
        return -1;
      }
    });
    return array[0].fileid;
  };

  layervisible = (datasets_id, parameters_id, hidden) => {
    var visible = true;
    for (var i = 0; i < hidden.length; i++) {
      if (datasets_id === hidden[i][0] && parameters_id === hidden[i][1]) {
        visible = false;
      }
    }
    return visible;
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

  indexClosest = (num, arr) => {
    var index = 0;
    var diff = Math.abs(num - arr[0]);
    for (var val = 0; val < arr.length; val++) {
      var newdiff = Math.abs(num - arr[val]);
      if (newdiff < diff) {
        diff = newdiff;
        index = val;
      }
    }
    return index;
  };

  matlabToJavascriptDatetime = (date) => {
    return new Date((date - 719529) * 24 * 60 * 60 * 1000);
  };

  getInternalDatetimeAndDepth = (
    data,
    datasetparameters,
    datetime,
    depth,
    maxdepth
  ) => {
    var type = datasetparameters
      .map((dp) => dp.axis + "&" + dp.parameters_id)
      .join(",");
    var realdatetime = datetime;
    var realdepth = depth;
    var index;
    if (type.includes("M&1") && type.includes("y&2")) {
      // Profiler
      var dp2 = datasetparameters.find((dp) => dp.parameters_id === 1);
      var dp3 = datasetparameters.find((dp) => dp.parameters_id === 2);
      index = this.indexClosest(depth, data.y);
      realdatetime = new Date(data[dp2.axis][index] * 1000);
      realdepth = data[dp3.axis][index];
    } else if (
      type.includes("z&") &&
      type.includes("x&1") &&
      type.includes("y&2")
    ) {
      // 2D Depth Time Dataset
      var indexx = this.indexClosest(datetime.getTime() / 1000, data["x"]);
      var indexy = this.indexClosest(depth, data["y"]);
      realdatetime = new Date(data["x"][indexx] * 1000);
      realdepth = data["y"][indexy];
    } else if (
      type.includes("x&1") &&
      type.includes("y&") &&
      !type.includes("z&")
    ) {
      // 1D Parameter Time Dataset
      index = this.indexClosest(datetime.getTime() / 1000, data["x"]);
      realdatetime = new Date(data["x"][index] * 1000);
      realdepth = parseFloat(maxdepth);
    }
    return { realdatetime, realdepth };
  };

  getExternalDatetimeAndDepth = (data, datetime, depth, datasource, file) => {
    var realdatetime = datetime;
    var realdepth = depth;
    if (datasource === "Meteolakes") {
      ({ datetime: realdatetime, depth: realdepth } = data);
      realdepth = Math.abs(realdepth);
      realdatetime = this.matlabToJavascriptDatetime(realdatetime);
    } else if (datasource === "Eawag RS") {
      realdepth = 0;
      realdatetime = new Date(file.mindatetime);
    } else if (["MeteoSwiss", "FOEN"].includes(datasource)) {
      var coeff = 1000 * 60 * 10;
      realdepth = 0;
      realdatetime = new Date(Math.round(datetime.getTime() / coeff) * coeff);
    }
    return { realdatetime, realdepth };
  };

  downloadFile = async (
    datasets_id,
    fileid,
    file,
    source,
    datetime,
    depth,
    datasetparameters,
    dataset
  ) => {
    var { filelink } = file;
    var { downloads } = this.state;
    var downloaded = downloads.find(
      (d) =>
        d.datasets_id === datasets_id &&
        d.fileid === fileid &&
        d.datetime === datetime &&
        d.depth === depth
    );

    if (downloaded) {
      return {
        data: downloaded.data,
        realdatetime: downloaded.realdatetime,
        realdepth: downloaded.realdepth,
      };
    } else {
      var data, realdatetime, realdepth;
      if (source === "internal") {
        ({ data } = await axios.get(apiUrl + "/files/" + fileid + "?get=raw"));
        ({ realdatetime, realdepth } = this.getInternalDatetimeAndDepth(
          data,
          datasetparameters,
          datetime,
          depth,
          dataset.maxdepth
        ));
      } else {
        filelink = filelink.replace(":datetime", datetime.getTime());
        filelink = filelink.replace(":depth", depth);
        ({ data } = await axios
          .get(filelink, { timeout: 5000 })
          .catch((error) => {
            console.error(error);
            let modaltext = `Failed to retrieve data from the ${dataset.datasource} API. Datalakes has no control over the availability of data from external API's, please try again later to see if the API is back online.`;
            this.setState({
              loading: false,
              modal: true,
              modaltext,
              modaldetail: error.message,
            });
          }));
        ({ realdatetime, realdepth } = this.getExternalDatetimeAndDepth(
          data,
          datetime,
          depth,
          dataset.datasource,
          file
        ));
      }
      downloads.push({
        data,
        datetime,
        depth,
        datasets_id,
        fileid,
        realdatetime,
        realdepth,
      });
      this.setState({ downloads });
      return { data, realdatetime, realdepth };
    }
  };

  optimisePoints = (array, colors) => {
    var min = Math.min(...array);
    var max = Math.max(...array);
    var q, val, point;
    for (var i = 0; i < colors.length; i++) {
      if (i === 0) colors[i].point = 0;
      else if (i === colors.length - 1) colors[i].point = 1;
      else {
        q = (1 / (colors.length - 1)) * i;
        val = this.quantile(array, q);
        point = (val - min) / (max - min);
        colors[i].point = point;
      }
    }
    return colors;
  };

  quantile = (arr, q) => {
    const sorted = arr.slice(0).sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
      return sorted[base];
    }
  };

  getColor = (selectedlayers) => {
    var usedColors = selectedlayers.map((s) => s.color);
    var colors = [
      "#28B5F5",
      "#FB0000",
      "#0B3954",
      "#8F0000",
      "#8AD6F9",
      "#FF4747",
      "#f0a3ff",
      "#0075dc",
      "#993f00",
      "#4c005c",
      "#191919",
      "#005c31",
      "#2bce48",
      "#ffcc99",
      "#808080",
      "#94ffb5",
      "#8f7c00",
      "#9dcc00",
      "#c20088",
      "#003380",
      "#ffa405",
      "#ffa8bb",
      "#426600",
      "#ff0010",
      "#5ef1f2",
      "#00998f",
      "#e0ff66",
      "#740aff",
      "#990000",
      "#ffff80",
      "#ffff00",
      "#ff5005",
    ];
    var unusedColors = colors.filter((c) => !usedColors.includes(c));
    return unusedColors[0];
  };

  addNewLayer = async (
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
  ) => {
    // Check layer not already loaded
    if (
      selectedlayers.filter(
        (sl) =>
          sl.datasets_id === datasets_id && sl.parameters_id === parameters_id
      ).length === 0
    ) {
      // Find index of datasets and parameters
      var dataset = datasets.find((d) => d.id === datasets_id);
      var parameter = parameters.find((p) => p.id === parameters_id);

      if (dataset && parameter) {
        // Get file list for dataset
        var { data: files } = await axios.get(
          apiUrl + "/files?datasets_id=" + datasets_id + "&type=json"
        );

        // Find closest file to datetime and depth
        var fileid = this.closestFile(datetime, depth, files);
        var datafile = files.find((f) => f.id === fileid);

        // Get the dataset parameter
        var dp = datasetparameters.filter((d) => d.datasets_id === datasets_id);

        var { data, realdatetime, realdepth } = await this.downloadFile(
          datasets_id,
          fileid,
          datafile,
          dataset.datasource,
          datetime,
          depth,
          dp,
          dataset
        );

        // Special case download lakejson
        if ([23].includes(datasets_id)) {
          ({ data: lakejson } = await axios.get(
            apiUrl + "/externaldata/lakejson"
          ));
        }

        // Update the parameter min and max value
        var { min, max, array } = this.getMinMax(
          data,
          parameters_id,
          dp,
          dataset.mapplotfunction
        );

        // Get unit
        var unit = dp.find((d) => d.parameters_id === parameters_id).unit;

        // Merge Plot properties, dataset and parameter
        let layer = {
          ...JSON.parse(JSON.stringify(dataset.plotproperties)),
          ...JSON.parse(JSON.stringify(parameter)),
          ...JSON.parse(JSON.stringify(dataset)),
        };

        // Meteolakes hack
        if (parameters_id === 25) {
          layer["mapplot"] = "field";
        }

        // Moving Average for Remote Sensing
        if (dataset.mapplotfunction === "remoteSensing") {
          layer["validpixelexpression"] = true;
        } else {
          layer["validpixelexpression"] = "NA";
        }

        // Optimise colors
        var unoptimisedcolors = this.parseColor(layer.colors);
        //var optimisedcolors = this.optimisePoints(array, unoptimisedcolors);

        // Add Additional Parameters
        layer["contour"] = false;
        layer["thresholds"] = 200;
        layer["files"] = files;
        layer["data"] = data;
        layer["min"] = min;
        layer["max"] = max;
        layer["datamin"] = min;
        layer["datamax"] = max;
        layer["unit"] = unit;
        layer["opacity"] = 1;
        layer["array"] = array;
        layer["fileid"] = fileid;
        layer["datasetparameters"] = dp;
        layer["datasets_id"] = datasets_id;
        layer["parameters_id"] = parameters_id;
        layer["realdatetime"] = realdatetime;
        layer["realdepth"] = realdepth;
        layer["colors"] = unoptimisedcolors;
        layer["color"] = this.getColor(selectedlayers);
        layer["id"] = datasets_id.toString() + "&" + parameters_id.toString();
        layer["visible"] = this.layervisible(
          datasets_id,
          parameters_id,
          hidden
        );

        selectedlayers.unshift(layer);
      } else {
        alert("Failed to add layer, not found in database.");
        selected = selected.filter(
          (x) =>
            parseInt(x[0]) !== parseInt(datasets_id) ||
            parseInt(x[1]) !== parseInt(parameters_id)
        );
      }
    }
    return { selectedlayers, datasets, selected, lakejson };
  };

  updateVariable = async (datetime, depth) => {
    function findFileId(files, fileid) {
      return files.find((f) => f.id === fileid);
    }
    this.setState({ loading: true, datetime, depth }, async () => {
      var { selectedlayers, datasets } = this.state;

      for (var i = 0; i < selectedlayers.length; i++) {
        // Find closest file to datetime and depth
        var fileid = this.closestFile(datetime, depth, selectedlayers[i].files);
        var datafile = findFileId(selectedlayers[i].files, fileid);

        // Add data from file closes to datetime and depth
        var { data, realdatetime, realdepth } = await this.downloadFile(
          selectedlayers[i].datasets_id,
          fileid,
          datafile,
          selectedlayers[i].datasource,
          datetime,
          depth,
          selectedlayers[i].datasetparameters,
          selectedlayers[i]
        );

        // Update the min and max value
        var { min, max, array } = this.getMinMax(
          data,
          selectedlayers[i].parameters_id,
          selectedlayers[i].datasetparameters,
          selectedlayers[i].mapplotfunction
        );

        var newMax = Math.max(max, selectedlayers[i].datamax);
        var newMin = Math.min(min, selectedlayers[i].datamin);
        selectedlayers[i].data = data;
        selectedlayers[i].datamin = newMin;
        selectedlayers[i].datamax = newMax;
        selectedlayers[i].array = selectedlayers[i].array.concat(array);
        selectedlayers[i].fileid = fileid;
        selectedlayers[i]["realdatetime"] = realdatetime;
        selectedlayers[i]["realdepth"] = realdepth;
      }

      this.setState({
        datasets,
        selectedlayers,
        loading: false,
      });
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

  setDefaults = () => {
    var { selected, hidden, datetime, depth, zoom, center, basemap } =
      this.state;
    var { defaults } = this.props;
    if ("selected" in defaults) selected = defaults.selected;
    if ("hidden" in defaults) hidden = defaults.hidden;
    if ("datetime" in defaults) datetime = defaults.datetime;
    if ("depth" in defaults) depth = defaults.depth;
    if ("zoom" in defaults) zoom = defaults.zoom;
    if ("center" in defaults) center = defaults.center;
    if ("basemap" in defaults) basemap = defaults.basemap;
    return { selected, hidden, datetime, depth, zoom, center, basemap };
  };

  componentDidUpdate() {
    var { setDefaults } = this.props;
    if (setDefaults) {
      var { selected, hidden, datetime, depth, zoom, center, basemap } =
        this.state;
      var defaults = {
        selected,
        hidden,
        datetime,
        depth,
        zoom,
        center,
        basemap,
      };
      setDefaults(defaults);
    }
  }

  async componentDidMount() {
    // Defaults
    var { lakejson } = this.state;
    var { selected, hidden, datetime, depth, zoom, center, basemap } =
      this.setDefaults();

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

    var selectedlayers = [];
    for (var i = selected.length - 1; i > -1; i--) {
      var datasets_id = selected[i][0];
      var parameters_id = selected[i][1];
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
    }

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
              showDateModal={this.showDateModal}
              showTimeDepthModal={this.showTimeDepthModal}
            />
            {this.state.selectedlayers.length === 0 ? (
              <LayerGroups
                setLayerGroup={this.updateState}
                showLayers={this.showLayersModal}
              />
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
            <button className="addlayers" onClick={this.showLayersModal}>
              Add Layers
            </button>
          </div>
        </div>
        <div className={menu ? "map" : "map min"}>
          <Legend selectedlayers={this.state.selectedlayers} open={true} />
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
          title="Select layers"
          visible={this.state.layersModal}
          hide={this.hideLayersModal}
          content={
            <AddLayers
              datasets={this.state.datasets}
              parameters={this.state.parameters}
              datasetparameters={this.state.datasetparameters}
              addSelected={this.addSelected}
            />
          }
        />
        <Modal
          title="Edit date"
          visible={this.state.dateModal}
          hide={this.hideDateModal}
          content={
            <Calendar
              onChange={this.onChangeDatetime}
              value={this.state.datetime}
            />
          }
        />
        <Modal
          title="Edit time and depth"
          visible={this.state.timeDepthModal}
          hide={this.hideTimeDepthModal}
          content={
            <TimeDepth
              datetime={this.state.datetime}
              depth={this.state.depth}
              onChangeDatetime={this.onChangeDatetime}
              onChangeDepth={this.onChangeDepth}
            />
          }
        />
      </div>
    );
  }
}

export default GIS;
