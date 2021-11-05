import React, { Component } from "react";
import GISMap from "../../graphs/leaflet/gis_map";
import axios from "axios";
import { apiUrl } from "../../config.json";
import FilterBox from "../../components/filterbox/filterbox";
import MapLayers from "../../components/maplayers/maplayers";
import AddLayers from "../../components/addlayers/addlayers";
import Legend from "../../components/legend/legend";
import colorlist from "../../components/colorramp/colors";
import DatetimeDepthSelector from "../../components/datetimedepthselector/datetimedepthselector";
import "./gis.css";
import PrintLegend from "../../components/legend/printlegend";
import ErrorModal from "../../components/errormodal/errormodal";

class SidebarGIS extends Component {
  render() {
    var {
      selectedlayers,
      datasets,
      parameters,
      datasetparameters,
      sidebarextratop,
      sidebarextrabottom,
      setSelected,
      removeSelected,
      toggleLayerView,
      updateMapLayers,
      addSelected,
      basemap,
      updateBaseMap,
    } = this.props;
    var add;
    if (selectedlayers.length === 0) add = "true";
    return (
      <React.Fragment>
        {sidebarextratop}
        <FilterBox
          title="Basemap"
          preopen="true"
          content={
            <div className="basemap">
              <select
                className="basemapselector"
                onChange={updateBaseMap}
                value={basemap}
                title="Edit the background map style"
              >
                <option value="datalakesmap">Datalakes Map</option>
                <option value="datalakesmapgrey">
                  Datalakes Map Greyscale
                </option>
                <option value="swisstopo">Swisstopo</option>
                <option value="satellite">Satellite</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          }
        />
        <FilterBox
          title="Map Layers"
          preopen="true"
          content={
            <MapLayers
              selectedlayers={selectedlayers}
              setSelected={setSelected}
              removeSelected={removeSelected}
              toggleLayerView={toggleLayerView}
              updateMapLayers={updateMapLayers}
            />
          }
        />
        <FilterBox
          title="Add Layers"
          preopen={add}
          content={
            <AddLayers
              datasets={datasets}
              parameters={parameters}
              datasetparameters={datasetparameters}
              addSelected={addSelected}
            />
          }
        />
        {sidebarextrabottom}
      </React.Fragment>
    );
  }
}

class GIS extends Component {
  state = {
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
          layer["movingAverage"] = 4;
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

  searchLocation = (
    selected,
    hidden,
    datetime,
    depth,
    zoom,
    center,
    basemap
  ) => {
    return [
      "?",
      "selected=",
      JSON.stringify(selected),
      "&hidden=",
      JSON.stringify(hidden),
      "&datetime=",
      datetime.getTime() / 1000,
      "&depth=",
      depth,
      "&zoom=",
      JSON.stringify(zoom),
      "&center=",
      JSON.stringify(center),
      "&basemap=",
      basemap,
    ].join("");
  };

  parseSearch = (search) => {
    search = search.replace("?", "").split("&");
    var out = {};
    for (var i = 0; i < search.length; i++) {
      try {
        var split = search[i].split("=");
        if (["selected", "hidden", "center"].includes(split[0])) {
          out[split[0]] = JSON.parse(split[1]);
        } else if (split[0] === "datetime") {
          out[split[0]] = new Date(split[1] * 1000);
        } else if (["depth", "zoom"].includes(split[0])) {
          out[split[0]] = parseFloat(split[1]);
        } else if (split[0] === "basemap") {
          out[split[0]] = split[1];
        }
      } catch (e) {
        console.error("Parsing query " + split[0] + " failed.");
      }
    }
    return out;
  };

  updateSearch = (query, value, search) => {
    if (query in search) {
      var newValue = search[query];
      if (["selected", "hidden"].includes(query)) {
        if (Array.isArray(newValue)) {
          value = newValue;
        }
      } else if (["depth"].includes(query)) {
        let depth = newValue;
        if (depth > -2 && depth < 400) {
          value = depth;
        }
      } else if (["datetime"].includes(query)) {
        let dt = newValue.getTime() / 1000;
        let dt_max = new Date().getTime() / 1000 + 30 * 24 * 60 * 60;
        if (dt > 0 && dt < dt_max) {
          value = newValue;
        }
      } else if (["zoom"].includes(query)) {
        let zoom = parseInt(newValue);
        if (zoom > 0 && zoom < 18) {
          value = zoom;
        }
      } else if (["center"].includes(query)) {
        let lat = parseFloat(newValue[0]);
        let lng = parseFloat(newValue[1]);
        if (lat > -85 && lat < 85 && lng > -180 && lng < 180) {
          value = [lat, lng];
        }
      } else if (["basemap"].includes(query)) {
        if (
          ["datalakesmap", "swisstopo", "satellite", "dark"].includes(newValue)
        ) {
          value = newValue;
        }
      }
    }
    return value;
  };

  fixedEncodeURI = (str) => {
    return str.replace(/%5b/g, "[").replace(/%5d/g, "]");
  };

  componentDidUpdate(prevState) {
    var { selected, hidden, datetime, depth, zoom, center, basemap } =
      this.state;
    var newSearch = this.searchLocation(
      selected,
      hidden,
      datetime,
      depth,
      zoom,
      center,
      basemap
    );
    let { search, pathname } = this.props.location;
    if (newSearch !== search) {
      this.props.history.push({
        pathname: pathname,
        search: newSearch,
      });
    }
  }

  async componentDidMount() {
    // Defaults
    var { selected, hidden, datetime, depth, zoom, center, basemap, lakejson } =
      this.state;

    var defaultSearchLocation = this.searchLocation(
      selected,
      hidden,
      datetime,
      depth,
      zoom,
      center,
      basemap
    );

    // Parse location search
    const pathname = this.props.location.pathname;
    try {
      var { search } = this.props.location;
      search = this.fixedEncodeURI(search);
      if (search) {
        search = this.parseSearch(search);
        selected = this.updateSearch("selected", selected, search);
        hidden = this.updateSearch("hidden", hidden, search);
        datetime = this.updateSearch("datetime", datetime, search);
        depth = this.updateSearch("depth", depth, search);
        zoom = this.updateSearch("zoom", zoom, search);
        center = this.updateSearch("center", center, search);
        basemap = this.updateSearch("basemap", basemap, search);
        this.props.history.push({
          pathname: pathname,
          search: search,
        });
      } else {
        this.props.history.push({
          pathname: pathname,
          search: defaultSearchLocation,
        });
      }
    } catch (e) {
      console.error("Error processing search parameters.");
      this.props.history.push({
        pathname: pathname,
        search: defaultSearchLocation,
      });
    }

    // Get data
    let server = await Promise.all([
      axios.get(apiUrl + "/selectiontables/parameters"),
      axios.get(apiUrl + "/datasets"),
      axios.get(apiUrl + "/datasetparameters"),
    ]).catch((error) => {
      this.setState({ step: "error" });
    });

    var parameters = server[0].data;
    var datasets = server[1].data;
    var datasetparameters = server[2].data;

    // Build selected layers object
    var selectedlayers = [];
    var fixedSelected = JSON.parse(JSON.stringify(selected));
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
    var {
      selectedlayers,
      datasets,
      parameters,
      datasetparameters,
      loading,
      datetime,
      depth,
      basemap,
      zoom,
      center,
      timestep,
      mindatetime,
      maxdatetime,
      mindepth,
      maxdepth,
      modal,
      modaltext,
      modaldetail,
      lakejson,
    } = this.state;
    document.title = "Map Viewer - Datalakes";
    return (
      <React.Fragment>
        <h1>Map Viewer</h1>
        <ErrorModal
          visible={modal}
          text={modaltext}
          details={modaldetail}
          closeModal={this.closeModal}
        />
        <GISMap
          datetime={datetime}
          depth={depth}
          zoom={zoom}
          center={center}
          selectedlayers={selectedlayers}
          datasets={datasets}
          legend={<Legend selectedlayers={selectedlayers} open={true} />}
          basemap={basemap}
          lakejson={lakejson}
          updateLocation={this.updateLocation}
          updateState={this.updateState}
          timeselector={
            <DatetimeDepthSelector
              selectedlayers={selectedlayers}
              mindatetime={mindatetime}
              maxdatetime={maxdatetime}
              mindepth={mindepth}
              maxdepth={maxdepth}
              datetime={datetime}
              depth={depth}
              timestep={timestep}
              onChangeDatetime={this.onChangeDatetime}
              onChangeDepth={this.onChangeDepth}
              onChangeTimestep={this.onChangeTimestep}
            />
          }
          loading={loading}
          sidebar={
            <SidebarGIS
              selectedlayers={selectedlayers}
              datasets={datasets}
              parameters={parameters}
              datasetparameters={datasetparameters}
              basemap={basemap}
              updateBaseMap={this.updateBaseMap}
              setSelected={this.setSelected}
              removeSelected={this.removeSelected}
              toggleLayerView={this.toggleLayerView}
              updateMapLayers={this.updateMapLayers}
              addSelected={this.addSelected}
            />
          }
        />
        <div className="printheader">
          <div>Map Viewer Print</div>
          <div>
            {datetime.toString()} @ {depth}m
          </div>
        </div>
        <div className="printlegend">
          <PrintLegend selectedlayers={selectedlayers} />
        </div>
      </React.Fragment>
    );
  }
}

export default GIS;
