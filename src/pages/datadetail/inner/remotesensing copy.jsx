import React, { Component } from "react";
import axios from "axios";
import Basemap from "../../../graphs/leaflet/basemap";
import Loading from "../../../components/loading/loading";
import MapControl from "../../../components/mapcontrol/mapcontrol";
import menuicon from "../../../img/menuicon.svg";
import sliceicon from "../../../img/sliceicon.svg";
import colorlist from "../../../components/colorramp/colors";
import D3LineGraph from "../../../graphs/d3/linegraph/linegraph";
import FilterBox from "../../../components/filterbox/filterbox";
import MapMenu from "../../../components/mapmenu/mapmenu";
import MapLayers from "../../../components/maplayers/maplayers";
import Legend from "../../../components/legend/legend";
import DatetimeDepthSelector from "../../../components/datetimedepthselector/datetimedepthselector";
import PrintLegend from "../../../components/legend/printlegend";
import ErrorModal from "../../../components/errormodal/errormodal";
import "../css/datadetail.css";
import "../css/threed.css";

class RemoteSensingMenu extends Component {
  render() {
    var {
      basemap,
      updateBaseMap,
      selectedlayers,
      toggleLayerView,
      updateMapLayers,
    } = this.props;
    return (
      <React.Fragment>
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
              toggleLayerView={toggleLayerView}
              updateMapLayers={updateMapLayers}
            />
          }
        />
      </React.Fragment>
    );
  }
}

class RemoteSensing extends Component {
  state = {
    datetime: new Date(),
    depth: 0,
    timestep: 1440,
    selectedlayers: [],
    downloads: [],
    datasets: [],
    profile: false,
    timeline: false,
    slice: false,
    calc: false,
    menu: false,
    fullsize: false,
    help: false,
    point: false,
    pointValue: {},
    line: false,
    lineValue: [],
    loading: true,
    basemap: "datalakesmap",
    graph: "none",
    colors: [
      { color: "#0000ff", point: 0 },
      { color: "#ff0000", point: 1 },
    ],
    plotdata: { x: [], y: [], z: [] },
    zoomIn: () => {},
    zoomOut: () => {},
    modal: false,
    modaltext: "",
    modaldetail: "",
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

  remoteSensingMinMax = (array) => {
    array = array.v;
    var max = this.getMax(array);
    var min = this.getMin(array);
    return { filemin: min, filemax: max, filearray: array };
  };

  updateVariable = async (datetime, depth) => {
    function findFileId(files, fileid) {
      return files.find((f) => f.id === fileid);
    }
    this.setState({ loading: true, datetime, depth }, async () => {
      var { selectedlayers, downloads } = this.state;

      for (var i = 0; i < selectedlayers.length; i++) {
        // Find closest file to datetime and depth
        var fileid = this.closestFile(datetime, depth, selectedlayers[i].files);
        var datafile = findFileId(selectedlayers[i].files, fileid);

        // Add data from file closes to datetime and depth
        var data, realdatetime, realdepth;
        ({ data, realdatetime, realdepth, downloads } = await this.downloadFile(
          selectedlayers[i].datasets_id,
          fileid,
          datafile.filelink,
          selectedlayers[i].datasource,
          datetime,
          depth,
          downloads
        ));

        var { filemin, filemax, filearray } = this.remoteSensingMinMax(data);

        // Retain selected min and max values
        var newmin = filemin;
        var newmax = filemax;
        if (selectedlayers[i].min !== selectedlayers[i].datamin)
          newmin = selectedlayers[i].min;
        if (selectedlayers[i].max !== selectedlayers[i].datamax)
          newmax = selectedlayers[i].max;

        // Update the min and max value
        selectedlayers[i].realdatetime = realdatetime;
        selectedlayers[i].realdepth = realdepth;
        selectedlayers[i].data = data;
        selectedlayers[i].min = newmin;
        selectedlayers[i].max = newmax;
        selectedlayers[i].datamin = filemin;
        selectedlayers[i].datamax = filemax;
        selectedlayers[i].array = filearray;
        selectedlayers[i].fileid = fileid;
      }

      this.setState({
        selectedlayers,
        downloads,
        loading: false,
      });
    });
  };

  changePlotParameter = (event) => {
    this.setState({ parameter: event.target.value });
  };

  setZoomIn = (newFunc) => {
    this.setState({ zoomIn: newFunc });
  };

  setZoomOut = (newFunc) => {
    this.setState({ zoomOut: newFunc });
  };

  closeSelect = () => {
    this.setState({
      plotdata: { x: [], y: [], z: [] },
    });
  };

  toggleHelp = () => {
    this.setState({
      help: !this.state.help,
      menu: false,
    });
  };

  toggleFullsize = () => {
    this.setState({
      fullsize: !this.state.fullsize,
    });
  };

  toggleMenu = () => {
    this.setState({
      menu: !this.state.menu,
      help: false,
    });
  };

  toggleSlice = () => {
    var { slice, graph, plotdata } = this.state;
    if (slice && graph === "slicegraph") {
      graph = "none";
    } else {
      graph = "slicegraph";
    }
    plotdata = { x: [], y: [], z: [] };
    this.setState({
      slice: !this.state.slice,
      timeline: false,
      menu: false,
      help: false,
      profile: false,
      point: false,
      graph,
      plotdata,
      line: !this.state.slice,
    });
  };

  toggleCalc = () => {
    var plotdata = { x: [], y: [], z: [] };
    this.setState({
      plotdata,
      calc: !this.state.calc,
      timeline: false,
      menu: false,
      help: false,
      profile: false,
      point: false,
      slice: false,
      line: false,
    });
  };

  removeNaN = (data) => {
    var keys = Object.keys(data);
    var var1 = [];
    var var2 = [];
    var var3 = [];
    for (var i = 0; i < data[keys[0]].length; i++) {
      if (
        !isNaN(parseInt(data[keys[0]][i])) &&
        !isNaN(parseInt(data[keys[1]][i])) &&
        !isNaN(parseInt(data[keys[2]][i]))
      ) {
        var1.push(data[keys[0]][i]);
        var2.push(data[keys[1]][i]);
        var3.push(data[keys[2]][i]);
      }
    }
    var out = { [keys[0]]: var1, [keys[1]]: var2, [keys[2]]: var3 };
    return out;
  };

  fillNaN2D = (data) => {
    for (var i = 0; i < data.y.length; i++) {
      if (data.z[i].every((e) => e === null)) {
        data.y[i] = null;
      }
    }
    return data;
  };

  matlabToJavascriptDatetime = (date) => {
    return new Date((date - 719529) * 24 * 60 * 60 * 1000);
  };

  javascriptDatetimeToMatlab = (date) => {
    return 719529 + date.getTime() / (24 * 60 * 60 * 1000);
  };

  CHtoWGSlatlng = (yx) => {
    var y_aux = (yx[0] - 600000) / 1000000;
    var x_aux = (yx[1] - 200000) / 1000000;
    var lat =
      16.9023892 +
      3.238272 * x_aux -
      0.270978 * Math.pow(y_aux, 2) -
      0.002528 * Math.pow(x_aux, 2) -
      0.0447 * Math.pow(y_aux, 2) * x_aux -
      0.014 * Math.pow(x_aux, 3);
    var lng =
      2.6779094 +
      4.728982 * y_aux +
      0.791484 * y_aux * x_aux +
      0.1306 * y_aux * Math.pow(x_aux, 2) -
      0.0436 * Math.pow(y_aux, 3);
    lat = (lat * 100) / 36;
    lng = (lng * 100) / 36;

    return [lat, lng];
  };

  WGSlatlngtoCH = (lat, lng) => {
    lat = lat * 3600;
    lng = lng * 3600;
    var lat_aux = (lat - 169028.66) / 10000;
    var lng_aux = (lng - 26782.5) / 10000;
    var y =
      2600072.37 +
      211455.93 * lng_aux -
      10938.51 * lng_aux * lat_aux -
      0.36 * lng_aux * lat_aux ** 2 -
      44.54 * lng_aux ** 3 -
      2000000;
    var x =
      1200147.07 +
      308807.95 * lat_aux +
      3745.25 * lng_aux ** 2 +
      76.63 * lat_aux ** 2 -
      194.56 * lng_aux ** 2 * lat_aux +
      119.79 * lat_aux ** 3 -
      1000000;
    return { x, y };
  };

  getLake = (id) => {
    var lakes = { 4: "zurich", 2: "biel", 1: "geneva", 3: "greifensee" };
    return lakes[id];
  };

  updatePoint = async (pointValue) => {
    var { graph, datetime } = this.state;
    var { lakes_id } = this.props.dataset;
    var apistem = this.props.files[0].filelink.split("/layer")[0];
    var lake = this.getLake(lakes_id);
    var t = datetime.getTime();
    var { x, y } = this.WGSlatlngtoCH(pointValue.lat, pointValue.lng);
    var oldStyle = document.getElementById("map").style.cursor;
    if (graph === "depthgraph") {
      document.getElementById("map").style.cursor = "wait";
      await axios
        .get(`${apistem}/depthprofile/${lake}/${t}/${y}/${x}`)
        .then((response) => {
          var plotdata = this.removeNaN(response.data);
          this.setState({ pointValue, plotdata });
          document.getElementById("map").style.cursor = oldStyle;
        })
        .catch((error) => {
          this.setState({ pointValue, plotdata: { x: [], y: [], z: [] } });
          document.getElementById("map").style.cursor = oldStyle;
          alert("Failed to collect data please try another location.");
        });
    } else if (graph === "timegraph") {
      document.getElementById("map").style.cursor = "wait";
      await axios
        .get(`${apistem}/timeline/${lake}/${t}/${y}/${x}`)
        .then((response) => {
          var { x, y, z, z1 } = this.fillNaN2D(response.data);
          x = x.map((i) => new Date(i * 1000));
          var plotdata = { x, y, z, z1 };
          this.setState({ pointValue, plotdata });
          document.getElementById("map").style.cursor = oldStyle;
        })
        .catch((error) => {
          this.setState({ pointValue, plotdata: { x: [], y: [], z: [] } });
          document.getElementById("map").style.cursor = oldStyle;
          alert("Failed to collect data please try another location.");
        });
    }
  };

  updateLine = async (lineValue) => {
    var { graph, selectedlayers } = this.state;
    var { data } = selectedlayers[0];
    if (graph === "slicegraph" && lineValue.length > 0) {
      var oldStyle = document.getElementById("map").style.cursor;
      document.getElementById("map").style.cursor = "wait";
      var x1 = lineValue[0].lat;
      var y1 = lineValue[0].lng;
      var x2 = lineValue[1].lat;
      var y2 = lineValue[1].lng;
      var n = 100;
      var len = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
      var arr = [...Array(n + 1).keys()];
      var x = arr.map((x) => x * (len / n));
      var y = [];
      var index, xin, yin;
      var vpe = false;
      if ("vp" in data && selectedlayers[0].validpixelexpression) vpe = true;
      for (var i = 0; i < x.length; i++) {
        ({ x: xin, y: yin } = this.coordsAlongLine(x[i], len, x1, y1, x2, y2));
        index = this.findClosest(
          data.lat,
          data.lon,
          xin,
          yin,
          data.latres,
          data.lonres
        );
        let vp = true;
        if (vpe && data.vp[index]) vp = false;
        if (index && vp) {
          y.push(data.v[index]);
        } else {
          y.push(null);
        }
      }
      var plotdata = { x, y };
      this.setState({ lineValue, plotdata });
      document.getElementById("map").style.cursor = oldStyle;
    } else {
      document.getElementById("map").style.cursor = oldStyle;
      this.setState({ lineValue, plotdata: { x: [], y: [], z: [] } });
    }
  };

  coordsAlongLine = (seg, len, x1, y1, x2, y2) => {
    var perc = seg / len;
    var x = x1 + (x2 - x1) * perc;
    var y = y1 + (y2 - y1) * perc;
    return { x, y };
  };

  findClosest = (x, y, xin, yin, latres, lonres) => {
    var diff = Infinity;
    var index = 0;
    for (var k = 0; k < x.length; k++) {
      var newdiff = Math.sqrt(
        Math.abs(xin - x[k]) ** 2 + Math.abs(yin - y[k]) ** 2
      );
      if (newdiff < diff) {
        diff = newdiff;
        index = k;
      }
    }
    if (diff < Math.max(latres, lonres)) {
      return index;
    } else {
      return false;
    }
  };

  toggleLayerView = (id) => {
    this.setState({ loading: true }, () => {
      var { selectedlayers } = this.state;
      var index = selectedlayers.findIndex((x) => x.id === id);
      selectedlayers[index].visible = !selectedlayers[index].visible;
      this.setState({ selectedlayers, loading: false });
    });
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

  updateBaseMap = (event) => {
    this.setState({ basemap: event.target.value });
  };

  updateMapLayers = (selectedlayers) => {
    this.setState({ loading: true }, () => {
      this.setState({ selectedlayers, loading: false });
    });
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

  getSliderParameters = (selectedlayers) => {
    var files = [];
    var mindatetime = Infinity;
    var maxdatetime = -Infinity;
    var mindepth = 0;
    var maxdepth = 1;
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

  getColor = (selectedlayers) => {
    var usedColors = selectedlayers.map((s) => s.color);
    var colors = [
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

  lastFile = (files) => {
    files.sort((a, b) =>
      new Date(a.maxdatetime).getTime() > new Date(b.maxdatetime).getTime()
        ? -1
        : 1
    );
    return files[0];
  };

  roundDate = (date) => {
    let hours =
      Math.round((date.getHours() - 2 + date.getMinutes() / 60) / 3) * 3 + 2;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours);
  };

  closeModal = () => {
    this.setState({ modal: false, modaltext: "" });
  };

  downloadFile = async (
    datasets_id,
    fileid,
    filelink,
    source,
    datetime,
    depth,
    downloads
  ) => {
    var downloaded = downloads.find(
      (d) =>
        d.datasets_id === datasets_id &&
        d.fileid === fileid &&
        d.datetime.getTime() === datetime.getTime() &&
        parseFloat(d.depth) === parseFloat(depth)
    );
    var data, realdatetime, realdepth;

    if (downloaded) {
      return {
        data: downloaded.data,
        realdatetime: downloaded.realdatetime,
        realdepth: downloaded.realdepth,
        downloads,
      };
    } else {
      var datetimejs = Math.round(datetime.getTime());
      filelink = filelink.replace(":datetime", datetimejs);
      filelink = filelink.replace(":depth", depth);
      ({ data } = await axios
        .get(filelink, { timeout: 5000 })
        .catch((error) => {
          console.error(error);
          let modaltext = `Failed to retrieve data from API. Datalakes has no control over the availability of data from external API's, please try again later to see if the API is back online.`;
          this.setState({
            loading: false,
            modal: true,
            modaltext,
            modaldetail: error.message,
          });
        }));
      realdatetime = datetime;
      realdepth = depth;
      downloads.push({
        data,
        datetime,
        depth,
        datasets_id,
        fileid,
        realdatetime,
        realdepth,
      });

      return { data, realdatetime, realdepth, downloads };
    }
  };

  async componentDidMount() {
    var { files, dataset, datasetparameters } = this.props;
    var { downloads } = this.state;

    // Build Selected Layers object
    var selectedlayers = [];
    var plotparameters = datasetparameters.filter(
      (p) => ![1, 2, 3, 4].includes(p.parameters_id)
    );
    plotparameters.sort((a, b) => (a.parameters_id > b.parameters_id ? -1 : 1));
    for (var i = 0; i < plotparameters.length; i++) {
      var parameters_id = plotparameters[i].parameters_id;
      var datasets_id = dataset.id;

      // Find file with most recent data
      var file = this.lastFile(files);
      var datetime = this.roundDate(new Date());
      if (new Date(file.maxdatetime).getTime() < datetime.getTime()) {
        datetime = new Date(file.maxdatetime);
      }

      var depth = Math.round(file.mindepth * 10) / 10;

      // Download data
      var data, realdatetime, realdepth;
      ({ data, realdatetime, realdepth, downloads } = await this.downloadFile(
        datasets_id,
        file.id,
        file.filelink,
        dataset.datasource,
        datetime,
        depth,
        downloads
      ));

      let layer = {
        ...JSON.parse(JSON.stringify(dataset.plotproperties)),
        ...JSON.parse(JSON.stringify(dataset)),
      };

      // Get data min and max
      var mapplot = "raster";
      var unit = plotparameters[i].unit;
      var name = plotparameters[i].parseparameter;
      var { filemin, filemax, filearray } = this.remoteSensingMinMax(data);

      // Add Additional Parameters
      layer["contour"] = false;
      layer["thresholds"] = 200;
      layer["realdatetime"] = realdatetime;
      layer["realdepth"] = realdepth;
      layer["mapplot"] = mapplot;
      layer["files"] = files;
      layer["name"] = name;
      layer["data"] = data;
      layer["min"] = filemin;
      layer["max"] = filemax;
      layer["opacity"] = 1;
      layer["datamin"] = filemin;
      layer["datamax"] = filemax;
      layer["validpixelexpression"] = true;
      layer["unit"] = unit;
      layer["array"] = filearray;
      layer["fileid"] = file.id;
      layer["datasets_id"] = datasets_id;
      layer["datasetparameters"] = plotparameters;
      layer["color"] = this.getColor(selectedlayers);
      layer["parameters_id"] = parameters_id;
      layer["colors"] = this.parseColor(layer.colors);
      layer["id"] = datasets_id.toString() + "&" + parameters_id.toString();
      layer["visible"] = true;

      selectedlayers.push(layer);
    }

    var {
      mindatetime,
      maxdatetime,
      mindepth,
      maxdepth,
    } = this.getSliderParameters(selectedlayers);

    var datasets = [dataset];
    this.setState({
      loading: false,
      depth,
      datetime,
      datasets,
      selectedlayers,
      downloads,
      mindatetime,
      maxdatetime,
      mindepth,
      maxdepth,
    });
  }

  render() {
    var {
      selectedlayers,
      datasets,
      timestep,
      menu,
      fullsize,
      help,
      point,
      line,
      slice,
      loading,
      graph,
      plotdata,
      basemap,
      depth,
      datetime,
      zoomIn,
      zoomOut,
      mindatetime,
      maxdatetime,
      mindepth,
      maxdepth,
      modal,
      modaltext,
      modaldetail,
    } = this.state;
    var { dataset } = this.props;
    var controls = [
      { title: "Menu", active: menu, onClick: this.toggleMenu, img: menuicon },
      {
        title: "Transect",
        active: slice,
        onClick: this.toggleSlice,
        img: sliceicon,
      },
    ];

    var graphclass = "graphwrapper hide";
    if (graph !== "none" && plotdata.x.length > 0) graphclass = "graphwrapper";
    var punit = "";
    var pname = "";
    if (selectedlayers.length > 0) punit = selectedlayers[0].unit;
    if (selectedlayers.length > 0) pname = selectedlayers[0].name;
    var load = loading && false;
    return (
      <div className={fullsize ? "threed full" : "threed"}>
        <ErrorModal
          visible={modal}
          text={modaltext}
          details={modaldetail}
          closeModal={this.closeModal}
        />
        <div className="basemapwrapper">
          <div className="controls">
            <MapControl
              zoomIn={zoomIn}
              zoomOut={zoomOut}
              fullsize={fullsize}
              controls={controls}
              help={help}
              toggleHelp={this.toggleHelp}
              toggleFullsize={this.toggleFullsize}
            />
          </div>
          <Basemap
            selectedlayers={selectedlayers}
            datasets={datasets}
            setZoomIn={this.setZoomIn}
            setZoomOut={this.setZoomOut}
            point={point}
            line={line}
            updatePoint={this.updatePoint}
            updateLine={this.updateLine}
            basemap={basemap}
            loading={loading}
            depth={depth}
            datetime={datetime}
          />

          <MapMenu
            menu={menu}
            help={help}
            toggleMenu={this.toggleMenu}
            toggleHelp={this.toggleHelp}
            menucontent={
              <RemoteSensingMenu
                basemap={basemap}
                updateBaseMap={this.updateBaseMap}
                selectedlayers={selectedlayers}
                toggleLayerView={this.toggleLayerView}
                updateMapLayers={this.updateMapLayers}
              />
            }
          />
          <div className="timeselector-gis">
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
          </div>
          <div className="threedlegend">
            <Legend selectedlayers={selectedlayers} open={true} />
          </div>

          {load && (
            <div className="map-loader">
              <Loading />
              Downloading and plotting data
            </div>
          )}
        </div>
        {graph === "slicegraph" && plotdata.x.length > 0 && (
          <div className={graphclass}>
            <div className="close" onClick={this.closeSelect}>
              ×
            </div>
            <D3LineGraph
              data={plotdata}
              title={`${dataset.title} Transect`}
              xlabel={"Distance"}
              ylabel={pname}
              xunits={"km"}
              yunits={punit}
              lcolor={"#000000"}
              lweight={"1"}
              bcolor={"white"}
              xscale={"Linear"}
              yscale={"Linear"}
            />
          </div>
        )}
        <div className="printheader">
          <div>Datalakes Print</div>
          <div>
            {datetime.toString()} @ {depth}m
          </div>
        </div>
        <div className="printlegend">
          <PrintLegend selectedlayers={selectedlayers} />
        </div>
      </div>
    );
  }
}

export default RemoteSensing;
