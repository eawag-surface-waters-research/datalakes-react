import React, { Component } from "react";
import "./adddataset.css";
import axios from "axios";
import Fuse from "fuse.js";
import { apiUrl } from "../../../src/config.json";
import AddData from "./steps/adddata";
import ReviewData from "./steps/reviewdata";
import ReviewLineage from "./steps/reviewlineage";
import AddMetadata from "./steps/addmetadata";
import Publish from "./steps/publish";
import ProgressBar from "./progressbar";

class AddDataset extends Component {
  state = {
    step: 1,
    allowedStep: [1, 1, 1, 1, 1],
    allFiles: [],
    fileInformation: "",
    renkuResponse: "",
    dropdown: {},
    dataset: {
      id: "",
      title: "",
      description: "",
      origin: "measurement",
      mapplot: "marker",
      mapplotfunction: "gitPlot",
      datasource: "internal",
      datasourcelink: "",
      plotproperties: {
        colors: "Rainbow",
        markerLabel: true,
        markerSymbol: "circle",
        markerFixedSize: true,
        markerSize: 10,
        vectorMagnitude: false,
        vectorArrows: false,
        vectorFlow: false,
        vectorArrowColor: false,
        vectorFlowColor: false,
        legend: false,
      },
      citation: "",
      downloads: 0,
      fileconnect: "no",
      liveconnect: "false",
      renku: "",
      accompanyingdata: [],
      mindatetime: "",
      maxdatetime: "",
      latitude: "",
      longitude: "",
      licenses_id: "",
      organisations_id: "",
      repositories_id: "",
      lakes_id: "",
      persons_id: "",
      projects_id: "",
      embargo: 0,
      password: "none",
    },
    datasetparameters: [],
    files_list: [],
    file: {},
  };

  // 0) Get dropdowns

  getDropdowns = async () => {
    const { data: dropdown } = await axios.get(apiUrl + "/selectiontables");
    this.setState({
      dropdown,
    });
  };

  componentDidMount() {
    this.getDropdowns();
  }

  // 1) Process input file
  validateFile = async (id) => {
    var { dataset, step, dropdown } = this.state;
    var post = {};
    if (id) post = { id };
    // Add blank row to datasets table
    var { data: data1 } = await axios
      .post(apiUrl + "/datasets", post)
      .catch((error) => {
        console.error(error);
        this.setState({ allowedStep: [1, 0, 0, 0, 0] });
        throw new Error(error.response.data.message);
      });

    // Clone git repo and add files to files table
    try {
      var reqObj = this.parseUrl(dataset.datasourcelink);
    } catch (error) {
      throw new Error(
        "Malformed input url. Please check your input and try again"
      );
    }

    reqObj["id"] = data1.id;
    var { data: clone } = await axios
      .post(apiUrl + "/gitclone", reqObj)
      .catch((error) => {
        console.error(error.message);
        this.setState({ allowedStep: [1, 0, 0, 0, 0] });
        throw new Error("Unable to clone repository please try again.");
      });

    var clonestatus_id = clone.clonestatus_id;
    var status = "inprogress";
    var message = "Starting clone";

    var repeattime = 500;
    var internalthis = this;

    const clonepromise = new Promise((resolve, reject) => {
      setTimeout(async function monitor() {
        try {
          var { data: clonestatus } = await axios
            .get(apiUrl + "/gitclone/status/" + clonestatus_id)
            .catch((error) => {
              console.error(error.message);
              this.setState({ allowedStep: [1, 0, 0, 0, 0] });
              throw new Error("Unable to clone repository please try again.");
            });
          ({ status, message } = clonestatus);

          if (status === "failed") {
            internalthis.setState({ allowedStep: [1, 0, 0, 0, 0] });
            throw new Error(message);
          } else if (status === "succeeded") {
            // Parse variable and attribute information from incoming file
            var data2 = JSON.parse(message);
            var { repo_id, file, files, allFiles } = data2;
            var filepath =
              "git/" + repo_id + "/" + reqObj.dir + "/" + reqObj.file;
            if (file) {
              var { data: fileInformation } = await axios
                .get(apiUrl + "/files/" + file.id + "?get=metadata")
                .catch((error) => {
                  console.error(error.message);
                  internalthis.setState({ allowedStep: [1, 0, 0, 0, 0] });
                  throw new Error(
                    "Failed to parse file please check the file structure and try again."
                  );
                });
            } else {
              internalthis.setState({ allowedStep: [1, 0, 0, 0, 0] });
              throw new Error(
                "File not found in repository please check the link and try again."
              );
            }
            dataset["id"] = reqObj.id;
            dataset["repositories_id"] = repo_id;
            dataset["accompanyingdata"] = [filepath];

            // Set initial dataset parameters
            var datasetparameters = internalthis.setDatasetParameters(
              fileInformation,
              dropdown
            );

            internalthis.setState({
              allowedStep: [1, 2, 0, 0, 0],
              fileInformation: fileInformation,
              step: step + 1,
              dataset,
              allFiles,
              datasetparameters,
              files_list: files,
              file,
            });
            return;
          } else {
            document.getElementById("adddata-message").innerHTML = message;
            setTimeout(monitor, repeattime);
          }
        } catch (e) {
          reject(e);
        }
      }, repeattime);
    });

    await clonepromise.catch((error) => {
      throw new Error(error);
    });
  };

  // 2) Validate data parse and get lineage from Renku

  validateData = async () => {
    var { step, datasetparameters, dataset, file, files_list } = this.state;

    // Clean folder
    await axios.get(apiUrl + "/files/clean/" + dataset.id).catch((error) => {
      console.error(error.message);
    });

    // Check all table filled
    /*for (var row of datasetparameters) {
      if (!this.noEmptyString(row)) {
        this.setState({ allowedStep: [1, 2, 0, 0, 0] });
        throw new Error("Please complete all the fields.");
      }
    }*/

    // Lineage from Renku
    dataset["renku"] = 1;
    var allowedStep = [1, 2, 3, 0, 0];
    step = step + 1;
    var { data: renkuData } = await axios
      .get(apiUrl + "/renku/" + encodeURIComponent(dataset.datasourcelink))
      .catch((error) => {
        console.error(error.message);
      });
    if (renkuData && "data" in renkuData) {
      if (renkuData.data.lineage !== null) {
        dataset["renku"] = 0;
        allowedStep = [1, 2, 3, 0, 0];
      }
    }

    // Set real axis values
    var axis = [];
    var parseAxis;
    var updateAxis;
    var j;
    for (var i = 0; i < datasetparameters.length; i++) {
      if (datasetparameters[i]["included"]) {
        parseAxis = datasetparameters[i]["axis"];
        updateAxis = parseAxis;
        j = 1;
        while (axis.includes(updateAxis)) {
          updateAxis = parseAxis + j;
          j++;
        }
        axis.push(updateAxis);
        datasetparameters[i]["rAxis"] = updateAxis;
      }
    }

    // Convert single or multiple files
    if (dataset.fileconnect === "no" || dataset.fileconnect === "mix") {
      const { id } = file;
      var data = await this.convertFile(
        apiUrl,
        id,
        datasetparameters,
        dataset.fileconnect
      );
      var {
        mindatetime,
        maxdatetime,
        mindepth,
        maxdepth,
        longitude,
        latitude,
      } = data;
    } else {
      var arr_mindatetime = [];
      var arr_maxdatetime = [];
      var arr_mindepth = [];
      var arr_maxdepth = [];
      var arr_longitude = [];
      var arr_latitude = [];
      for (var k = 0; k < files_list.length; k++) {
        document.getElementById("reviewdata-message").innerHTML =
          "Processing file " + k + " of " + files_list.length;
        data = await this.convertFile(
          apiUrl,
          files_list[k].id,
          datasetparameters,
          dataset.fileconnect
        );
        arr_mindatetime.push(data.mindatetime);
        arr_maxdatetime.push(data.maxdatetime);
        if (data.mindepth < -2) arr_mindepth.push(data.mindepth);
        if (data.mindepth > 200) arr_maxdepth.push(data.maxdepth);
        arr_longitude.push(data.longitude);
        arr_latitude.push(data.latitude);
      }
      mindatetime = this.getMin(arr_mindatetime);
      maxdatetime = this.getMax(arr_maxdatetime);
      mindepth = this.getMin(arr_mindepth);
      maxdepth = this.getMax(arr_maxdepth);
      longitude = this.getAve(arr_longitude);
      latitude = this.getAve(arr_latitude);
    }

    console.log(mindatetime, maxdatetime, longitude, latitude);

    // Logic for continuing to next step
    dataset["mindatetime"] = mindatetime;
    dataset["maxdatetime"] = maxdatetime;
    dataset["mindepth"] = mindepth;
    dataset["maxdepth"] = maxdepth;
    dataset["longitude"] = longitude;
    dataset["latitude"] = latitude;
    this.setState({
      renkuResponse: renkuData,
      datasetparameters,
      dataset,
      allowedStep,
      step,
    });
    return;
  };

  convertFile = async (apiUrl, id, datasetparameters, fileconnect) => {
    var { data } = await axios
      .post(apiUrl + "/convert", {
        id: id,
        variables: datasetparameters,
        fileconnect: fileconnect,
      })
      .catch((error) => {
        console.error(error.message);
        this.setState({ allowedStep: [1, 2, 0, 0, 0] });
        throw new Error(
          "Unable to convert file to JSON format. Please contact the developer."
        );
      });
    return data;
  };

  // 3) Validate lineage

  validateLineage = async () => {
    const { dataset, step } = this.state;
    if (dataset["accompanyingdata"].length > 0) {
      this.setState({ allowedStep: [1, 2, 3, 4, 0], step: step + 1 });
    } else {
      throw new Error("Please add some files.");
    }
    return;
  };

  // 4) Validate metadata

  validateMetadata = async () => {
    const { dataset, step } = this.state;
    if (this.noEmptyString(dataset)) {
      this.setState({ allowedStep: [1, 2, 3, 4, 5], step: step + 1 });
    } else {
      throw new Error("Please complete all the fields.");
    }
  };

  // 5) Publish

  publish = async () => {
    const { dataset, datasetparameters } = this.state;
    await axios
      .post(apiUrl + "/datasetparameters", {
        id: dataset.id,
        datasetparameters: datasetparameters,
      })
      .catch((error) => {
        throw new Error("Failed to publish please try again.");
      });
    await axios.put(apiUrl + "/datasets", dataset).catch((error) => {
      throw new Error("Failed to publish please try again.");
    });
    window.location.href = "/datadetail/" + dataset.id;
  };

  // Progress Bar

  prevStep = () => {
    const { step } = this.state;
    this.setState({
      step: step - 1,
    });
  };

  setStep = (step) => {
    if (step !== 0) {
      this.setState({ step });
    }
  };

  // Check nothing in dictionary is empty string
  noEmptyString = (dict) => {
    var out = true;
    for (var key of Object.keys(dict)) {
      if (dict[key] === "") {
        out = false;
      }
    }
    return out;
  };

  // Parse url
  parseUrl = (url) => {
    url = decodeURI(url);
    var ssh;
    var dir;
    var branch;
    var file;
    url = url.replace("/-/", "/");
    if (url.includes("renkulab.io/gitlab")) {
      const path = url.split("/blob/")[1].split("/");
      const loc = url.split("/blob/")[0].split("/");
      const repo = loc[loc.length - 1];
      branch = path[0];
      ssh =
        "git@renkulab.io:" +
        url.split("/blob/")[0].split("renkulab.io/gitlab/").pop() +
        ".git";
      dir = path.slice(1, path.length - 1);
      dir.unshift(repo);
      dir = dir.join("/");
      file = path[path.length - 1];
    } else if (url.includes("github.com")) {
      const path = url.split("/blob/")[1].split("/");
      const loc = url.split("/blob/")[0].split("/");
      const repo = loc[loc.length - 1];
      branch = path[0];
      ssh =
        "git@github.com:" +
        url.split("/blob/")[0].split("github.com/").pop() +
        ".git";
      dir = path.slice(1, path.length - 1);
      dir.unshift(repo);
      dir = dir.join("/");
      file = path[path.length - 1];
    } else if (url.includes("gitlab.com")) {
      const path = url.split("/blob/")[1].split("/");
      const loc = url.split("/blob/")[0].split("/");
      const repo = loc[loc.length - 1];
      branch = path[0];
      ssh =
        "git@gitlab.com:" +
        url.split("/blob/")[0].split("gitlab.com/").pop() +
        ".git";
      dir = path.slice(1, path.length - 1);
      dir.unshift(repo);
      dir = dir.join("/");
      file = path[path.length - 1];
    } else {
      alert("Repository type not recognised.");
    }
    return {
      ssh: ssh,
      dir: dir,
      branch: branch,
      file: file,
    };
  };

  fuseSearch = (keys, list, find) => {
    var options = {
      keys: keys,
      shouldSort: true,
      threshold: 0.9,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
    };
    var fuse = new Fuse(list, options);
    var match = find.split("_").join(" ");
    var search = fuse.search(match);
    var defaultValue = "";
    if (search.length !== 0) {
      defaultValue = search[0].id;
    }
    // Fix common match errors of pressure and temperature
    if (defaultValue === 10 && !find.toLowerCase().includes("air")) {
      defaultValue = 18;
    } else if (defaultValue === 6 && !find.toLowerCase().includes("air")) {
      defaultValue = 5;
    } else if (defaultValue === 18 && !find.toLowerCase().includes("press")) {
      defaultValue = search[1].id;
    } else if (defaultValue === 2 && !find.toLowerCase().includes("depth")) {
      defaultValue = search[1].id;
    } else if (defaultValue === 22 && find.toLowerCase().includes("do")) {
      defaultValue = 12;
    }
    return defaultValue;
  };

  findUnits = (parameters, defaultParameter) => {
    return parameters.find((x) => x.id === defaultParameter).unit;
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

  getAve = (arr) => {
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length || 0;
  };

  allEqual = (arr) => {
    try {
      return arr.every((v) => v === arr[0]);
    } catch (e) {
      return "";
    }
  };

  defaultAxis = (dp) => {
    var maxdim = Math.max(...dp.map((d) => d.dims.length));
    var params = dp.map((d) => d.parameters_id);
    var type = "unknown";
    if (maxdim === 2) {
      type = "2D";
    } else if (
      maxdim === 1 &&
      params.includes(1) &&
      (params.includes(2) || params.includes(18))
    ) {
      type = "profile";
    }
    for (var i = 0; i < dp.length; i++) {
      let defaultAxis = "y";
      if (type === "2D") {
        if (dp[i].dims.length > 1) {
          defaultAxis = "z";
        } else if (dp[i].parameters_id === 1) {
          defaultAxis = "x";
        }
      } else if (type === "profile") {
        if (dp[i].parameters_id === 1) {
          defaultAxis = "M";
        } else if (![2, 18].includes(dp[i].parameters_id)) {
          defaultAxis = "x";
        }
      } else {
        if (dp[i].parameters_id === 1) {
          defaultAxis = "x";
        }
      }
      dp[i].axis = defaultAxis;
    }
    return dp;
  };

  addMaskLink = (dp) => {
    for (var i = 0; i < dp.length; i++) {
      if (dp[i].parseparameter.includes("_qual")) {
        let name = dp[i].parseparameter.split("_qual")[0];
        let match = dp.find((d) => d.parseparameter === name);
        if (match) {
          dp[i].link = match.id;
        }
      }
    }
    return dp;
  };

  setDatasetParameters = (fileInformation, dropdown) => {
    const { parameters, sensors } = dropdown;
    const { variables, attributes } = fileInformation;

    // Initial data parse and auto field matching
    var parseparameter = "";
    var parseUnit = "";
    var parseSensor = "";
    var variableAttributes = "";
    var variable = {};
    var datasetparameters = [];

    // Loop over variables in nc file
    let index = 0;
    for (var key in variables) {
      parseparameter = key;
      parseUnit = "NA";
      parseSensor = "NA";
      variableAttributes = variables[key].attributes;

      // Look for names in nc file.
      if ("units" in variableAttributes) {
        parseUnit = variableAttributes["units"].value;
      }
      if ("standard_name" in variableAttributes) {
        parseparameter = variableAttributes["standard_name"].value;
      }
      if ("long_name" in variableAttributes) {
        parseparameter = variableAttributes["long_name"].value;
      }
      if ("sensor" in attributes) {
        parseSensor = attributes["sensor"].value;
      }

      // Search for matching names in database to define default values
      var defaultParameter = this.fuseSearch(
        ["name"],
        parameters,
        parseparameter
      );
      // Detect error mask layers
      if (
        parseparameter.includes("_qual") ||
        parseUnit === "0 = nothing to report, 1 = more investigation"
      ) {
        defaultParameter = 27;
      }

      var defaultSensor = this.fuseSearch(["name"], sensors, parseSensor);

      // Fallback to parameter units if none provided in nc file
      var defaultUnit;
      if (parseUnit === "NA") {
        defaultUnit = this.findUnits(parameters, defaultParameter);
      } else {
        defaultUnit = parseUnit;
      }

      // Summarise data
      variable = {
        id: index,
        parseparameter: key,
        parseUnit: parseUnit,
        parseSensor: parseSensor,
        parameters_id: defaultParameter,
        unit: defaultUnit,
        axis: "y",
        link: -1,
        detail: "none",
        sensors_id: defaultSensor,
        included: true,
        dims: variables[key].dimensions,
      };
      datasetparameters.push(variable);
      index++;
    }

    datasetparameters = this.defaultAxis(datasetparameters);

    datasetparameters = this.addMaskLink(datasetparameters);

    return datasetparameters;
  };

  // Handle changes to inputs

  handleAccompanyingData = (accompanyingdata) => {
    var { dataset } = this.state;
    dataset.accompanyingdata = accompanyingdata;
    this.setState({ dataset });
  };

  handleChange = (input) => (event) => {
    var values = this.state.values;
    values[input] = event.target.value;
    this.setState({ values });
  };

  handleDataset = (input) => (event) => {
    var dataset = this.state.dataset;
    dataset[input] = Number.isInteger(event.value)
      ? event.value
      : event.target.value;
    this.setState({ dataset });
  };

  handleParameter = (a, b) => (event) => {
    var datasetparameters = this.state.datasetparameters;
    datasetparameters[a][b] = event.target ? event.target.value : event.value;
    if (b === "parameters_id") datasetparameters[a]["link"] = -1;
    this.setState({ datasetparameters });
  };

  handleParameterCheck = (a, b) => (event) => {
    var { datasetparameters, dataset } = this.state;
    datasetparameters[a][b] = !datasetparameters[a][b];
    dataset.fileconnect = "no";
    this.setState({ datasetparameters, dataset });
  };

  moveParameterUp = (i) => {
    if (i > 0) {
      var { datasetparameters } = this.state;
      datasetparameters.splice(i - 1, 0, datasetparameters.splice(i, 1)[0]);
      this.setState({ datasetparameters });
    }
  };

  moveParameterDown = (i) => {
    var { datasetparameters } = this.state;
    if (i < datasetparameters.length - 1) {
      datasetparameters.splice(i + 1, 0, datasetparameters.splice(i, 1)[0]);
      this.setState({ datasetparameters });
    }
  };

  render() {
    document.title = "Add Data - Datalakes";
    const {
      step,
      allowedStep,
      allFiles,
      fileInformation,
      renkuResponse,
      dropdown,
      dataset,
      datasetparameters,
      files_list,
    } = this.state;

    switch (step) {
      default:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <AddData
              nextStep={this.validateFile}
              handleChange={this.handleDataset}
              dataset={dataset}
            />
          </React.Fragment>
        );
      case 1:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <AddData
              nextStep={this.validateFile}
              handleChange={this.handleDataset}
              dataset={dataset}
            />
          </React.Fragment>
        );
      case 2:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <ReviewData
              datasetparameters={datasetparameters}
              dropdown={dropdown}
              fileconnect={dataset.fileconnect}
              liveconnect={dataset.liveconnect}
              fileInformation={fileInformation}
              files_list={files_list}
              nextStep={this.validateData}
              prevStep={this.prevStep}
              handleSelect={this.handleParameter}
              handleChange={this.handleParameter}
              handleDataset={this.handleDataset}
              handleCheck={this.handleParameterCheck}
              getDropdowns={this.getDropdowns}
              moveParameterUp={this.moveParameterUp}
              moveParameterDown={this.moveParameterDown}
            />
          </React.Fragment>
        );
      case 3:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <ReviewLineage
              dataset={dataset}
              allFiles={allFiles}
              renkuResponse={renkuResponse}
              handleAccompanyingData={this.handleAccompanyingData}
              nextStep={this.validateLineage}
              prevStep={this.prevStep}
              handleChange={this.handleDataset}
            />
          </React.Fragment>
        );
      case 4:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <AddMetadata
              dataset={dataset}
              dropdown={dropdown}
              datasetparameters={datasetparameters}
              nextStep={this.validateMetadata}
              prevStep={this.prevStep}
              handleChange={this.handleDataset}
              handleSelect={this.handleDataset}
              getDropdowns={this.getDropdowns}
            />
          </React.Fragment>
        );
      case 5:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <Publish
              nextStep={this.publish}
              prevStep={this.prevStep}
              datasetparameters={datasetparameters}
              dataset={dataset}
              dropdown={dropdown}
            />
          </React.Fragment>
        );
    }
  }
}

export default AddDataset;
