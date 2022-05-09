import React, { Component } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "../../../src/config.json";
import axios from "axios";
import * as d3 from "d3";
import Download from "./inner/download";
import Information from "./inner/information";
import Pipeline from "./inner/pipeline";
import External from "./inner/external";
import Preview from "./inner/preview";
import DataSubMenu from "./datasubmenu";
import Loading from "../../components/loading/loading";
import ThreeDModelDownload from "./inner/threedmodeldownload";
import Ch2018Graph from "./inner/ch2018graph";
import Ch2018Download from "./inner/ch2018download";
import RemoteSensingDownload from "./inner/remotesensingdownload";
import LocationMap from "./inner/locationmap";
import Plot from "./inner/plot";
import isArray from "lodash/isArray";
import MapComponent from "./inner/mapcomponent";
import "./css/datadetail.css";

class DataDetail extends Component {
  state = {
    selection: "",
    dataset: [],
    datasetparameters: [],
    error: false,
    mindatetime: "",
    maxdatetime: "",
    mindepth: "",
    maxdepth: "",
    lower: "",
    upper: "",
    files: [],
    data: "",
    step: "",
    lang: "en",
    allowedStep: ["plot", "download", "pipeline", "information", "webgis"],
    file: [0],
    innerLoading: false,
    addnewfiles: true,
    iframe: false,
    search: false,
  };

  // Download data

  downloadData = async () => {
    this.downloadData = () => {}; // Only possible to fire once.
    var { data: dataArray, files } = this.state;
    for (var j = 0; j < files.length; j++) {
      if (dataArray[j] === 0) {
        var { data } = await axios
          .get(apiUrl + "/files/" + files[j].id + "?get=raw")
          .catch((error) => {
            this.setState({ error: true });
          });
        dataArray[j] = data;
        if (this._isMounted) {
          this.setState({
            data: dataArray,
          });
        } else {
          return false;
        }
      }
    }
  };

  downloadFile = async (index) => {
    var { data: dataArray, files } = this.state;
    var { data } = await axios
      .get(apiUrl + "/files/" + files[index].id + "?get=raw")
      .catch((error) => {
        this.setState({ error: true });
      });
    dataArray[index] = data;
    if (this._isMounted) {
      this.setState({
        data: dataArray,
        innerLoading: false,
      });
    } else {
      return false;
    }
  };

  cleanData = (data) => {
    if (Object.keys(data).includes("undefined")) {
      delete data.undefined;
    }
    return data;
  };

  downloadMultipleFiles = async (arr, newfile = false) => {
    var { data: dataArray, files, file } = this.state;
    for (var j = 0; j < arr.length; j++) {
      if (dataArray[arr[j]] === 0) {
        var { data } = await axios
          .get(apiUrl + "/files/" + files[arr[j]].id + "?get=raw")
          .catch((error) => {
            this.setState({ error: true });
          });
        dataArray[arr[j]] = this.cleanData(data);
      }
    }
    if (newfile) {
      file = newfile;
    }
    if (this._isMounted) {
      this.setState({
        data: dataArray,
        file,
        innerLoading: false,
      });
    } else {
      return false;
    }
  };
  // Update state based on actions

  updateSelectedState = (step) => {
    this.setState({ step });
  };

  onChangeFileInt = (value) => {
    var { file, data, addnewfiles } = this.state;
    if (!file.includes(value) && this.isInt(value) && file.length < 20) {
      if (value >= 0 && value <= data.length) {
        if (!addnewfiles) file = [];
        file.push(value);
        if (data[value] === 0) {
          this.setState({ file, innerLoading: true });
          this.downloadFile(value);
        } else {
          this.setState({ file });
        }
      }
    }
  };

  onChangeFile = (values) => {
    var { files, file, data, addnewfiles } = this.state;
    let filedict = files.map((a) => a.ave.getTime());
    var newfile = this.closest(values[0], filedict);
    if (!file.includes(newfile) && this.isInt(values[0]) && file.length < 20) {
      if (!addnewfiles) file = [];
      file.push(newfile);
      if (data[newfile] === 0) {
        this.setState({ file, innerLoading: true });
        this.downloadFile(newfile);
      } else {
        this.setState({ file });
      }
    }
  };

  selectFilesDatetime = (newfiles) => {
    if (newfiles.length < 1 || newfiles.length > 20) {
      window.alert(
        "A maximum of 20 profiles can be plotted simultaneously, please select a sorted time period."
      );
    } else if (
      window.confirm(
        "You sure you want to select " + newfiles.length + " files?"
      )
    ) {
      var file = newfiles.map((f) => f.fileid);
      var { data } = this.state;
      this.setState({ innerLoading: true });
      for (var i = 0; i < newfiles.length; i++) {
        if (data[newfiles[i].fileid] === 0) {
          this.downloadFile(newfiles[i].fileid);
        }
      }
      this.setState({ file, innerLoading: false });
    }
  };

  removeFile = (event) => {
    var { file } = this.state;
    if (file.length > 1) {
      var index = parseInt(event.target.id);
      file.splice(index, 1);
      this.setState({ file });
    }
  };

  toggleAddNewFile = () => {
    this.setState({ addnewfiles: !this.state.addnewfiles });
  };

  selectedFiles = (upper, lower, files, data) => {
    if (data === "download") {
      data = new Array(files.length).fill(0);
    }
    var fileList = [];
    for (var i = 0; i < files.length; i++) {
      if (
        new Date(files[i].mindatetime).getTime() / 1000 < upper &&
        new Date(files[i].maxdatetime).getTime() / 1000 > lower &&
        data[i] === 0
      ) {
        fileList.push(i);
      }
    }
    return fileList;
  };

  onChangeTime = (values) => {
    var { files, data } = this.state;
    const lower = values[0] / 1000;
    const upper = values[1] / 1000;
    if (
      Math.round(lower) !== Math.round(this.state.lower) ||
      Math.round(upper) !== Math.round(this.state.upper)
    ) {
      var toDownload = this.selectedFiles(upper, lower, files, data);
      if (toDownload.length > 0) {
        this.setState({ innerLoading: true });
        this.downloadMultipleFiles(toDownload);
      }
      this.setState({ lower, upper });
    }
  };

  onChangeUpper = (value) => {
    var { files, data, lower } = this.state;
    var upper = value.getTime() / 1000;
    var toDownload = this.selectedFiles(upper, lower, files, data);
    if (toDownload.length > 0) {
      this.setState({ innerLoading: true });
      this.downloadMultipleFiles(toDownload);
    }
    this.setState({ upper });
  };

  onChangeLower = (value) => {
    var { files, data, upper } = this.state;
    var lower = value.getTime() / 1000;
    var toDownload = this.selectedFiles(upper, lower, files, data);
    if (toDownload.length > 0) {
      this.setState({ innerLoading: true, lower });
      this.downloadMultipleFiles(toDownload);
    }
  };

  // Get data from API

  getDropdowns = async () => {
    const { data: dropdown } = await axios.get(apiUrl + "/selectiontables");
    this.setState({
      dropdown,
    });
  };

  getLabel = (input, id, prop) => {
    const { dropdown } = this.state;
    try {
      return dropdown[input].find((x) => x.id === id)[prop];
    } catch (e) {
      console.error(input, id, e);
      return "NA";
    }
  };

  parameterDetails = (dropdown, parameters, x) => {
    return dropdown.parameters.find(
      (item) => item.id === parameters[x].parameters_id
    );
  };

  // Number functions

  closest = (num, arr) => {
    var diff = Infinity;
    var index = 0;
    for (var i = 0; i < arr.length; i++) {
      var newdiff = Math.abs(num - arr[i]);
      if (newdiff < diff) {
        diff = newdiff;
        index = i;
      }
    }
    return index;
  };

  isInt = (value) => {
    if (/^[-+]?(\d+|Infinity)$/.test(value)) {
      return true;
    } else {
      return false;
    }
  };

  numDescending = (a, b) => {
    var numA = a.ave.getTime();
    var numB = b.ave.getTime();
    var compare = 0;
    if (numA > numB) {
      compare = -1;
    } else if (numA < numB) {
      compare = 1;
    }
    return compare;
  };

  dataBounds = (dataArray) => {
    var xe = d3.extent(dataArray[0].x);
    var lower = xe[0],
      upper = xe[1];
    return { upper: upper, lower: lower };
  };

  addAverageTime = (array) => {
    for (var i = 0; i < array.length; i++) {
      let mindt = parseFloat(new Date(array[i].mindatetime).getTime());
      let maxdt = parseFloat(new Date(array[i].maxdatetime).getTime());
      array[i].ave = new Date((mindt + maxdt) / 2);
      array[i].mindt = mindt / 1000;
      array[i].maxdt = maxdt / 1000;
    }
    return array;
  };

  addFileLocation = (arr, dataset) => {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].latitude === "-9999" || arr[i].longitude === "-9999") {
        arr[i].latitude = dataset.latitude;
        arr[i].longitude = dataset.longitude;
      }
    }
    return arr;
  };

  fileBounds = (array) => {
    var min = Math.min.apply(
      Math,
      array.map(function (o) {
        return o.min;
      })
    );
    var max = Math.max.apply(
      Math,
      array.map(function (o) {
        return o.max;
      })
    );
    return { min: min, max: max };
  };

  getAve = (arr) => {
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length || 0;
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

  merge2DArray = (arr) => {
    let merged = [];
    for (var i = 0; i < arr[0].length; i++) {
      merged.push(innerMerge(i, arr));
    }
    return merged;
    function innerMerge(i, arr) {
      return arr.map((a) => a[i]).flat();
    }
  };

  customizer = (objValue, srcValue) => {
    return objValue.concat(srcValue);
  };

  getShape = (arr) => {
    if (isArray(arr[0])) {
      return [arr.length, arr[0].length];
    } else {
      return [arr.length];
    }
  };

  async componentDidMount() {
    this._isMounted = true;
    var { step, allowedStep } = this.state;
    var dataset_id;
    if ("id" in this.props) {
      dataset_id = this.props.id;
    } else {
      dataset_id = this.props.location.pathname.split("/").slice(-1)[0];
    }

    var search = this.props.location.search;
    var iframe = this.props.location.search.includes("iframe");
    var lang = "en";
    var searchArr = search.split("&");
    if (searchArr.includes("de") || searchArr.includes("DE")) lang = "de";
    if (searchArr.includes("fr") || searchArr.includes("FR")) lang = "fr";
    if (searchArr.includes("it") || searchArr.includes("IT")) lang = "es";

    let server = await Promise.all([
      axios.get(apiUrl + "/datasets/" + dataset_id),
      axios.get(apiUrl + "/files?datasets_id=" + dataset_id),
      axios.get(apiUrl + "/datasetparameters?datasets_id=" + dataset_id),
      axios.get(apiUrl + "/selectiontables"),
    ]).catch((error) => {
      this.setState({ step: "error" });
    });

    var dataset = server[0].data;
    var { mapplotfunction } = dataset;
    var files = server[1].data;
    files = files.filter(
      (v, i, a) => a.findIndex((t) => t.filelink === v.filelink) === i
    ); // Remove duplicates
    var datasetparameters = server[2].data;
    var dropdown = server[3].data;

    // Internal vs External Data source
    if (mapplotfunction === "gitPlot") {
      // Add parameter details
      var details;
      for (var p in datasetparameters) {
        try {
          details = this.parameterDetails(dropdown, datasetparameters, p);
          datasetparameters[p]["name"] = details.name;
          datasetparameters[p]["characteristic"] = details.characteristic;
        } catch (err) {
          datasetparameters[p]["name"] = null;
          datasetparameters[p]["characteristic"] = null;
        }
      }

      // Logic for graphs
      var x =
        datasetparameters.filter((param) => param.axis === "x").length > 0;
      var y =
        datasetparameters.filter((param) => param.axis === "y").length > 0;
      var z =
        datasetparameters.filter((param) => param.axis === "z").length > 0;

      if (x && y && z) {
      } else if (x && y) {
        allowedStep.push("preview");
      } else {
        allowedStep.push("preview");
        step = "preview";
      }

      step = "plot";

      // Logic for showing map
      if (dataset.longitude !== "-9999" && dataset.latitude !== "-9999") {
        allowedStep.push("locationmap");
      }

      // Filter for only json files
      files = files.filter((file) => file.filetype === "json");

      // Get add average time
      files = this.addAverageTime(files);

      // Add location of file
      files = this.addFileLocation(files, dataset);

      // Sort by value (descending)
      files.sort(this.numDescending);

      // Get min and max
      var { mindatetime, maxdatetime, mindepth, maxdepth } = dataset;
      mindatetime = new Date(mindatetime).getTime() / 1000;
      maxdatetime = new Date(maxdatetime).getTime() / 1000;

      for (let i = 0; i < files.length; i++) {
        mindatetime = Math.min(mindatetime, files[i].ave / 1000);
        maxdatetime = Math.max(maxdatetime, files[i].ave / 1000);
      }

      var dataArray = new Array(files.length).fill(0);
      var { data } = await axios
        .get(apiUrl + "/files/" + files[0].id + "?get=raw")
        .catch((error) => {
          this.setState({ step: "error" });
        });
      dataArray[0] = data;
      var { lower, upper } = this.dataBounds(dataArray);

      // Add dataset length to datasetparameters
      datasetparameters = datasetparameters.map((d) => {
        d.shape = this.getShape(data[d.axis]);
        return d;
      });

      // Get Pipeline Data
      var renku = false;
      var scripts = [];
      if (dataset.renku === 0) {
        try {
          ({ data: renku } = await axios.post(apiUrl + "/renku", {
            url: dataset.datasourcelink,
          }));
        } catch (e) {
          console.error(e);
          renku = false;
        }
      }
      try {
        ({ data: scripts } = await axios.get(
          apiUrl + "/pipeline/scripts/" + dataset_id
        ));
      } catch (e) {
        console.error(e);
      }

      this.setState({
        renku,
        dataset,
        datasetparameters,
        files,
        data: dataArray,
        mindatetime,
        maxdatetime,
        mindepth,
        maxdepth,
        lower,
        upper,
        dropdown,
        step,
        allowedStep,
        scripts,
        iframe,
        search,
        lang,
      });
      //} else if (datasource === "Meteolakes") {
    } else if (mapplotfunction === "meteolakes") {
      this.setState({
        dataset,
        datasetparameters,
        dropdown,
        files,
        lang,
        loading: false,
        step: "threedmodel",
        allowedStep: [
          "threedmodel",
          "threedmodeldownload",
          "external",
          "webgis",
        ],
      });
    } else if (mapplotfunction === "datalakes") {
      this.setState({
        dataset,
        datasetparameters,
        dropdown,
        files,
        lang,
        loading: false,
        step: "threedmodel",
        allowedStep: [
          "threedmodel",
          "threedmodeldownload",
          "external",
          "webgis",
        ],
      });
    } else if (mapplotfunction === "remoteSensing") {
      this.setState({
        dataset,
        datasetparameters,
        dropdown,
        files,
        lang,
        step: "remotesensing",
        allowedStep: [
          "remotesensing",
          "remotesensingdownload",
          "external",
          "webgis",
        ],
      });
    } else if (mapplotfunction === "ch2018") {
      this.setState({
        dataset,
        datasetparameters,
        dropdown,
        files,
        lang,
        step: "ch2018",
        allowedStep: ["ch2018", "ch2018download", "external"],
      });
    } else if (mapplotfunction === "simstrat") {
      this.setState({
        dataset,
        datasetparameters,
        dropdown,
        files,
        lang,
        step: "simstrat",
        allowedStep: ["simstrat", "external", "webgis"],
      });
    } else {
      this.setState({
        dataset,
        datasetparameters,
        dropdown,
        files,
        lang,
        step: "external",
        allowedStep: ["external", "webgis"],
      });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    var {
      renku,
      dataset,
      datasetparameters,
      data,
      mindatetime,
      maxdatetime,
      step,
      allowedStep,
      files,
      file,
      scripts,
      iframe,
      search,
      lang,
      dropdown,
    } = this.state;
    document.title = dataset.title
      ? dataset.title + " - Datalakes"
      : "Datalakes";

    // Link
    var p = JSON.parse(JSON.stringify(datasetparameters));
    p = p.filter((x) => ![1, 2, 3, 4].includes(x.parameters_id));
    p = p.map((x) => [dataset.id, x.parameters_id]);
    var link = "/map?selected=" + JSON.stringify(p);
    var monitor = Number.isInteger(dataset.monitor);
    if (iframe && step !== "") step = "plot";
    var title = (
      <h2>
        {dataset.title} {monitor && <div className="title-live">LIVE</div>}
      </h2>
    );

    switch (step) {
      default:
        return (
          <React.Fragment>
            <table className="loading-table">
              <tbody>
                <tr>
                  <td>
                    <Loading />
                    Loading Data
                  </td>
                </tr>
              </tbody>
            </table>
          </React.Fragment>
        );
      case "plot":
        return (
          <React.Fragment>
            {!iframe && (
              <React.Fragment>
                {title}
                <DataSubMenu
                  step={step}
                  allowedStep={allowedStep}
                  updateSelectedState={this.updateSelectedState}
                  link={link}
                />
              </React.Fragment>
            )}
            <div className="datadetail-padding">
              <Plot
                datasetparameters={datasetparameters}
                dropdown={dropdown}
                dataset={dataset}
                data={data}
                files={files}
                file={file}
                lang={lang}
                fileChange={JSON.stringify(file)}
                maxdatetime={maxdatetime}
                mindatetime={mindatetime}
                removeFile={this.removeFile}
                downloadMultipleFiles={this.downloadMultipleFiles}
                iframe={iframe}
                search={search}
              />
            </div>
          </React.Fragment>
        );
      case "locationmap":
        return (
          <React.Fragment>
            {title}
            <DataSubMenu
              step={step}
              allowedStep={allowedStep}
              updateSelectedState={this.updateSelectedState}
              link={link}
            />
            <div className="datadetail-padding">
              <LocationMap
                dataset={dataset}
                file={file}
                files={files}
                min={mindatetime}
                max={maxdatetime}
                onChangeFileInt={this.onChangeFileInt}
                removeFile={this.removeFile}
                selectFilesDatetime={this.selectFilesDatetime}
              />
            </div>
          </React.Fragment>
        );
      case "preview":
        return (
          <React.Fragment>
            {title}
            <DataSubMenu
              step={step}
              allowedStep={allowedStep}
              updateSelectedState={this.updateSelectedState}
              link={link}
            />
            <div className="datadetail-padding">
              <Preview
                data={data}
                getLabel={this.getLabel}
                datasetparameters={datasetparameters}
              />
            </div>
          </React.Fragment>
        );
      case "download":
        return (
          <React.Fragment>
            {title}
            <DataSubMenu
              step={step}
              allowedStep={allowedStep}
              updateSelectedState={this.updateSelectedState}
              link={link}
            />
            <div className="datadetail-padding">
              <Download
                dataset={dataset}
                files={files}
                datasetparameters={datasetparameters}
                selectedFiles={this.selectedFiles}
                getLabel={this.getLabel}
                max={maxdatetime}
                min={mindatetime}
                apiUrl={apiUrl}
              />
            </div>
          </React.Fragment>
        );
      case "pipeline":
        return (
          <React.Fragment>
            {title}
            <DataSubMenu
              step={step}
              allowedStep={allowedStep}
              updateSelectedState={this.updateSelectedState}
              link={link}
            />
            <div className="datadetail-padding">
              <Pipeline dataset={dataset} renku={renku} scripts={scripts} />
            </div>
          </React.Fragment>
        );
      case "information":
        return (
          <React.Fragment>
            {title}
            <DataSubMenu
              step={step}
              allowedStep={allowedStep}
              updateSelectedState={this.updateSelectedState}
              link={link}
            />
            <div className="datadetail-padding">
              <Information
                dataset={dataset}
                datasetparameters={datasetparameters}
                getLabel={this.getLabel}
              />
            </div>
          </React.Fragment>
        );
      case "external":
        return (
          <React.Fragment>
            {title}
            <DataSubMenu
              step={step}
              allowedStep={allowedStep}
              updateSelectedState={this.updateSelectedState}
              link={link}
            />
            <div className="datadetail-padding">
              <External
                dataset={dataset}
                datasetparameters={datasetparameters}
                getLabel={this.getLabel}
                link={link}
              />
            </div>
          </React.Fragment>
        );
      case "threedmodel":
        return (
          <React.Fragment>
            {title}
            <DataSubMenu
              step={step}
              allowedStep={allowedStep}
              updateSelectedState={this.updateSelectedState}
              link={link}
            />
            <div className="datadetail-padding">
              <MapComponent
                dataset={dataset}
                datasetparameters={datasetparameters}
                getLabel={this.getLabel}
                files={files}
                link={link}
              />
            </div>
          </React.Fragment>
        );
      case "threedmodeldownload":
        return (
          <React.Fragment>
            {title}
            <DataSubMenu
              step={step}
              allowedStep={allowedStep}
              updateSelectedState={this.updateSelectedState}
              link={link}
            />
            <div className="datadetail-padding">
              <ThreeDModelDownload
                dataset={dataset}
                datasetparameters={datasetparameters}
                getLabel={this.getLabel}
                files={files}
                link={link}
              />
            </div>
          </React.Fragment>
        );
      case "remotesensingdownload":
        return (
          <React.Fragment>
            {title}
            <DataSubMenu
              step={step}
              allowedStep={allowedStep}
              updateSelectedState={this.updateSelectedState}
              link={link}
            />
            <div className="datadetail-padding">
              <RemoteSensingDownload
                dataset={dataset}
                datasetparameters={datasetparameters}
                getLabel={this.getLabel}
                files={files}
                link={link}
              />
            </div>
          </React.Fragment>
        );
      case "remotesensing":
        return (
          <React.Fragment>
            {title}
            <DataSubMenu
              step={step}
              allowedStep={allowedStep}
              updateSelectedState={this.updateSelectedState}
              link={link}
            />
            <div className="datadetail-padding">
              <MapComponent
                dataset={dataset}
                datasetparameters={datasetparameters}
                getLabel={this.getLabel}
                files={files}
                link={link}
              />
            </div>
          </React.Fragment>
        );
      case "simstrat":
        return (
          <React.Fragment>
            {title}
            <DataSubMenu
              step={step}
              allowedStep={allowedStep}
              updateSelectedState={this.updateSelectedState}
              link={link}
            />
            <div className="datadetail-padding">
              <MapComponent
                dataset={dataset}
                datasetparameters={datasetparameters}
                getLabel={this.getLabel}
                files={files}
                link={link}
              />
            </div>
          </React.Fragment>
        );
      case "ch2018":
        return (
          <React.Fragment>
            {title}
            <DataSubMenu
              step={step}
              allowedStep={allowedStep}
              updateSelectedState={this.updateSelectedState}
              link={link}
            />
            <div className="datadetail-padding">
              <Ch2018Graph
                dataset={dataset}
                datasetparameters={datasetparameters}
                getLabel={this.getLabel}
                files={files}
                link={link}
                search={this.props.location.search}
              />
            </div>
          </React.Fragment>
        );
      case "ch2018download":
        return (
          <React.Fragment>
            {title}
            <DataSubMenu
              step={step}
              allowedStep={allowedStep}
              updateSelectedState={this.updateSelectedState}
              link={link}
            />
            <div className="datadetail-padding">
              <Ch2018Download
                dataset={dataset}
                datasetparameters={datasetparameters}
                getLabel={this.getLabel}
                files={files}
                link={link}
              />
            </div>
          </React.Fragment>
        );
      case "error":
        return (
          <React.Fragment>
            <table className="loading-table">
              <tbody>
                <tr>
                  <td>
                    <h3>
                      Error. Either the connection to the server failed or that
                      dataset could not be found.
                    </h3>
                    <Link to="/data">
                      <h2>Head back to the data portal</h2>
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </React.Fragment>
        );
    }
  }
}

export default DataDetail;
