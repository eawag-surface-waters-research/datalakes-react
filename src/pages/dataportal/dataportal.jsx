import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Fuse from "fuse.js";
import config from "../../../src/config.json";
import SidebarLayout from "../../format/sidebarlayout/sidebarlayout";
import FilterBox from "../../components/filterbox/filterbox";
import MapSelect from "../../graphs/leaflet/mapselect.jsx";
import Loading from "../../components/loading/loading.jsx";
import calendar from "./img/calendar.svg";
import location from "./img/location.svg";
import model from "./img/model.svg";
import satellite from "./img/satellite.svg";
import measurement from "./img/measurement.svg";
import "./dataportal.css";

class DatasetList extends Component {
  render() {
    const {
      dropdown,
      list,
      parameters,
      selected,
      onSelectDataset,
      datalistclass,
      getLabel,
      loading,
      editUrl,
    } = this.props;
    if (list.length > 0) {
      return (
        <React.Fragment>
          <div id="list" className={datalistclass}>
            {list.map((dataset) => (
              <Dataset
                key={dataset.id}
                selected={selected}
                onSelectDataset={onSelectDataset}
                dataset={dataset}
                dropdown={dropdown}
                parameters={parameters}
                getLabel={getLabel}
                editUrl={editUrl}
              />
            ))}
          </div>
        </React.Fragment>
      );
    } else {
      return loading ? (
        <div className="dataportal-loading">
          <Loading />
          Loading Datasets
        </div>
      ) : (
        <div className="dataportal-loading">
          Sorry no datasets match your search. Please adjust your search
          parameters and try again.
        </div>
      );
    }
  }
}

class Dataset extends Component {
  getParameters = (id) => {
    const { parameters } = this.props;
    return parameters.filter((x) => x.datasets_id === id);
  };

  parseDate = (input) => {
    var months = [
      "Jan ",
      "Feb ",
      "Mar ",
      "Apr ",
      "May ",
      "Jun ",
      "Jul ",
      "Aug ",
      "Sept ",
      "Oct ",
      "Nov ",
      "Dec ",
    ];
    var date = new Date(input);
    return months[date.getMonth()] + date.getFullYear();
  };

  render() {
    const { dataset, selected, onSelectDataset, getLabel, editUrl } =
      this.props;
    var url;
    if (dataset.id === 1) {
      url = "/lakemorphology";
    } else {
      url = "/datadetail/" + dataset.id;
    }
    var params = this.getParameters(dataset.id);
    params = params.filter(
      (x) => ![1, 2, 3, 4, 27, 28, 29, 30].includes(x.parameters_id)
    );
    var param_names = params.map((p) => p.name);
    param_names = [...new Set(param_names)];
    var lake = getLabel("lakes", dataset.lakes_id);
    if (lake === "Multiple") {
      lake = "Switzerland";
    }
    var typeimg = model;
    var typetext = "Model Results";
    if (dataset.origin === "measurement") {
      typeimg = measurement;
      typetext = "Measurements";
    } else if (dataset.origin === "satellite") {
      typeimg = satellite;
      typetext = "Satellite Data";
    }
    return (
      <table className="dataset">
        <tbody>
          <tr>
            <td className="dataset-top">
              <div className="dataset-title">{dataset.title}</div>
              {Number.isInteger(dataset.monitor) && (
                <div className="dataset-live">LIVE</div>
              )}
              <div>{dataset.description}</div>
              <div className="buttons">
                <Link
                  to={url}
                  key={dataset.id}
                  title="Click to explore plots, lineage, downloads and metadata"
                  className="text"
                  onClick={editUrl}
                >
                  <div className="button-main">View Dataset</div>
                </Link>
                {dataset.mapplot !== "other" && (
                  <div
                    className={
                      selected.includes(dataset)
                        ? "button-sub grey"
                        : "button-sub"
                    }
                    onClick={() => onSelectDataset(dataset)}
                  >
                    {selected.includes(dataset) ? "Deselect" : "Select"}
                  </div>
                )}
              </div>
            </td>
            <td rowSpan={2} className="dataset-right">
              {param_names.map((param) => (
                <div className="params" key={param}>
                  {param}
                </div>
              ))}
            </td>
          </tr>
          <tr>
            <td className="dataset-bottom">
              <div className="date-highlight">
                <img className="icon" src={location} alt="location" /> {lake}
              </div>
              <div className="date-highlight">
                <img className="icon" src={calendar} alt="calendar" />
                {this.parseDate(dataset.mindatetime)} to{" "}
                {this.parseDate(dataset.maxdatetime)}
              </div>
              <img
                className="type"
                alt={typetext}
                title={typetext}
                src={typeimg}
              />
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
}

class PopupBox extends Component {
  render() {
    const { title, fun, state } = this.props;
    var symbol;
    if (state) {
      symbol = "-";
    } else {
      symbol = "+";
    }
    return (
      <div className="filterbox">
        <div className="toprow" onClick={fun}>
          <div className="title">{title}</div>
          <span className="symbol">{symbol}</span>
        </div>
      </div>
    );
  }
}

class FilterBoxInner extends Component {
  capitalizeFirstLetter = (string) => {
    if (string && string.length > 2) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    } else {
      return string;
    }
  };
  state = {};
  render() {
    var { params, checkbox, cat, filters, table } = this.props;
    params = params.map((p) => {
      if (p.name === "internal") p.name = "Git Repository";
      return p;
    });
    params = params.filter((p) => p.name !== "Error");
    return (
      <React.Fragment>
        <div id="filterboxinner" className="">
          {params.map((param) => (
            <div
              key={param.id + "_" + param.name}
              onClick={() => checkbox(param.id, param.name, cat, table)}
              className="filterboxinner"
            >
              <input
                type="checkbox"
                className="checkboxfilter"
                checked={param.name in filters}
                readOnly
              ></input>
              {this.capitalizeFirstLetter(param.name) + " "}({param.count})
            </div>
          ))}
        </div>
      </React.Fragment>
    );
  }
}

class FilterBar extends Component {
  render() {
    const { filters, removeFilter } = this.props;
    return (
      <div className="filterbar">
        {Object.keys(filters).map((filter) => (
          <div
            key={filter}
            className="filterbar-item"
            onClick={() => removeFilter(filter)}
            title="Remove filter"
          >
            <div className="filterbar-text">{filter}</div>
            <div className="filterbar-x">&#10005;</div>
          </div>
        ))}
      </div>
    );
  }
}

class DataPortal extends Component {
  state = {
    filters: {},
    search: "",
    datasets: [],
    parameters: [],
    selected: [],
    sortby: "recent",
    download: false,
    map: false,
    loading: true,
  };

  parameterDetails = (dropdown, parameters, x) => {
    return dropdown.parameters.find(
      (item) => item.id === parameters[x].parameters_id
    );
  };

  getLabel = (input, id) => {
    const { dropdown } = this.state;
    try {
      return dropdown[input].find((x) => x.id === id).name;
    } catch (e) {
      console.log(e);
      return "NA";
    }
  };

  getLabelInitial = (input, id, dropdown) => {
    try {
      return dropdown[input].find((x) => x.id === id).name;
    } catch (e) {
      console.log(e);
      return "NA";
    }
  };

  setSelect = (event) => {
    this.setState({ sortby: event.target.value });
  };

  download = () => {
    this.setState({ download: !this.state.download });
  };

  mapToggle = () => {
    this.setState({ map: !this.state.map });
  };

  searchDatasets = (event) => {
    if (event.target.value === "") this.clearUrl();
    this.setState({ search: event.target.value });
  };

  selectDataset = (dataset) => {
    if (this.state.selected.includes(dataset)) {
      const selected = this.state.selected.filter((c) => c !== dataset);
      this.setState({ selected: selected });
    } else {
      const selected = this.state.selected;
      selected.push(dataset);
      this.setState({ selected: selected });
    }
  };

  clearSelected = () => {
    this.setState({ selected: [] });
  };

  removeFilter = (filter) => {
    var { filters } = this.state;
    if (filter in filters) {
      delete filters[filter];
    }
    this.setState({ filters });
  };

  checkboxAddFilter = (id, name, cat, table) => {
    var { filters } = this.state;
    if (name in filters) {
      delete filters[name];
    } else {
      filters[name] = { id: id, category: cat, set: table };
    }
    this.setState({ filters });
  };

  mapAddFilter = (latlng) => {
    var { filters } = this.state;
    filters.Location = { id: latlng, category: "Location", set: "Location" };
    this.setState({ filters });
  };

  startTimeAddFilter = (e) => {
    var { filters } = this.state;
    var date = e.target.value;
    var f = Object.values(filters).filter((f) => f.set === "Start Date");
    if (f.length > 0) {
      delete filters["After " + f[0].id];
    }
    if (date !== "") {
      filters["After " + date] = {
        id: date,
        category: "mindatetime",
        set: "Start Date",
      };
    }
    this.setState({ filters });
  };

  endTimeAddFilter = (e) => {
    var { filters } = this.state;
    var date = e.target.value;
    var f = Object.values(filters).filter((f) => f.set === "End Date");
    if (f.length > 0) {
      delete filters["Before " + f[0].id];
    }
    if (date !== "") {
      filters["Before " + date] = {
        id: date,
        category: "maxdatetime",
        set: "End Date",
      };
    }
    this.setState({ filters });
  };

  count = (input, name, parameters) => {
    return parameters.filter((x) => x[input] === name).length;
  };

  sortDownloads = (dataset) => {
    return dataset;
  };

  filterList = (params, name, label, exclude = "") => {
    var distinct = [];
    var dp = [...new Set(params.map((x) => x[name]))];
    for (var p of dp) {
      if (p !== exclude) {
        var namelabel = p;
        if (name.includes("id")) namelabel = this.getLabel(label, p);
        distinct.push({
          id: p,
          name: namelabel,
          count: this.count(name, p, params),
        });
      }
    }
    distinct.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
    return distinct;
  };

  sortDatasets = (dataset, sortby) => {
    if (sortby === "az") {
      dataset.sort((a, b) => {
        return a.title - b.title;
      });
    } else if (sortby === "downloads") {
      dataset.sort((a, b) => {
        return b.downloads - a.downloads;
      });
    } else if (sortby === "recent") {
      dataset.sort((a, b) => {
        return new Date(b.maxdatetime) - new Date(a.maxdatetime);
      });
    }
    return dataset;
  };

  filterDataSet = (dataset, filters, parameters, avoid = "") => {
    const filterData = (data, filter, parameters) => {
      if (filter.set === "datasets") {
        return data.filter((item) => item[filter.category] === filter.id);
      } else if (filter.set === "parameters") {
        return data.filter(
          (item) =>
            parameters.filter(
              (x) =>
                x[filter.category] === filter.id && x.datasets_id === item.id
            ).length > 0
        );
      } else if (filter.set === "Location") {
        var latlng = filter.id;
        var maxlat = Math.max.apply(
          Math,
          latlng.map(function (o) {
            return o.lat;
          })
        );
        var maxlng = Math.max.apply(
          Math,
          latlng.map(function (o) {
            return o.lng;
          })
        );
        var minlat = Math.min.apply(
          Math,
          latlng.map(function (o) {
            return o.lat;
          })
        );
        var minlng = Math.min.apply(
          Math,
          latlng.map(function (o) {
            return o.lng;
          })
        );
        return data.filter(
          (item) =>
            item["latitude"] > minlat &&
            item["latitude"] < maxlat &&
            item["longitude"] > minlng &&
            item["longitude"] < maxlng
        );
      } else if (filter.set === "Start Date") {
        return data.filter(
          (item) =>
            new Date(item["maxdatetime"]).getTime() >
            new Date(filter.id).getTime()
        );
      } else if (filter.set === "End Date") {
        return data.filter(
          (item) =>
            new Date(item["mindatetime"]).getTime() <
            new Date(filter.id).getTime()
        );
      } else {
        return data;
      }
    };

    if (Object.keys(filters).length > 0) {
      var tDatasets;
      var category = [
        ...new Set(Object.values(filters).map((filter) => filter.category)),
      ].filter((cat) => cat !== avoid); // List of catagories in filters
      for (var l of category) {
        tDatasets = [];
        for (var f of this.filterCategory(filters, l)) {
          tDatasets = tDatasets.concat(filterData(dataset, f, parameters));
        }
        dataset = [...new Set(tDatasets)];
      }
    }
    return dataset;
  };

  filterCategory = (filters, l) => {
    return Object.values(filters).filter((filter) => filter.category === l);
  };

  filterParameters = (dataset, params) => {
    return params.filter(
      (param) =>
        dataset.filter((data) => data.id === param.datasets_id).length > 0 &&
        param.parameters_id !== 1
    );
  };

  focusSearchBar = (e) => {
    if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
      document.getElementById("dataportalsearchbar").focus();
    }
  };

  editUrl = () => {
    if (this.state.search === "") {
      let { pathname } = this.props.location;
      this.props.history.push({
        pathname: pathname,
        search: "",
      });
    } else {
      var new_search = "?search=" + this.state.search.replaceAll(" ", "+");
      let { search, pathname } = this.props.location;
      if (new_search !== search) {
        this.props.history.push({
          pathname: pathname,
          search: new_search,
        });
      }
    }
  };

  clearUrl = () => {
    let { pathname } = this.props.location;
    this.props.history.push({
      pathname: pathname,
      search: "",
    });
  };

  async componentDidMount() {
    window.addEventListener("keydown", this.focusSearchBar);
    var { search: location_search } = this.props.location;
    var { search } = this.state;
    const timeout = 1000;
    var server;
    try {
      server = await Promise.all([
        axios.get(config.apiUrl + "/selectiontables", { timeout: timeout }),
        axios.get(config.apiUrl + "/datasets", { timeout: timeout }),
        axios.get(config.apiUrl + "/datasetparameters", { timeout: timeout }),
      ]);
    } catch (error) {
      console.error("NodeJS API error switching to serverless API");
      server = await Promise.all([
        axios.get(config.serverlessUrl + "/selectiontables"),
        axios.get(config.serverlessUrl + "/datasets"),
        axios.get(config.serverlessUrl + "/datasetparameters"),
      ]);
    }
    const dropdown = server[0].data;
    var datasets = server[1].data;
    var parameters = server[2].data;
    if (server[1].status !== 200) datasets = [];
    if (server[2].status !== 200) {
      parameters = [];
    } else {
      // Add parameter details
      var details;
      var dict = {};
      for (var x in parameters) {
        try {
          details = this.parameterDetails(dropdown, parameters, x);
          parameters[x]["name"] = details.name;
          parameters[x]["characteristic"] = details.characteristic;
          if (parameters[x]["datasets_id"] in dict) {
            dict[parameters[x]["datasets_id"]].push(details.name);
          } else {
            dict[parameters[x]["datasets_id"]] = [details.name];
          }
        } catch (err) {
          parameters[x]["name"] = null;
          parameters[x]["characteristic"] = null;
        }
      }
    }
    for (var dataset of datasets) {
      dataset["parameters"] = dict[dataset["id"]];
      dataset["lake_name"] = this.getLabelInitial(
        "lakes",
        dataset["lakes_id"],
        dropdown
      );
    }
    const options = {
      shouldSort: true,
      threshold: 0.6,
      useExtendedSearch: true,
      keys: ["title", "description", "parameters", "lake_name"],
    };
    var fuse_datasets = JSON.parse(JSON.stringify(datasets));
    const fuse = new Fuse(fuse_datasets, options);
    var search_arr = location_search
      .replace("?", "")
      .split("&")
      .filter((s) => s.includes("search"));
    if (search_arr.length === 1)
      search = search_arr[0].split("=")[1].replaceAll("+", " ");
    this.setState({
      datasets,
      parameters,
      dropdown,
      fuse,
      search,
      loading: false,
    });
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.focusSearchBar);
  }

  render() {
    document.title = "Data Portal - Datalakes";
    const {
      fuse,
      search,
      filters,
      datasets,
      selected,
      dropdown,
      parameters,
      sortby,
      download,
      map,
      loading,
    } = this.state;

    // Filter by filters
    var fDatasets = this.filterDataSet(datasets, filters, parameters);

    // Filter by search
    if (search !== "" && search !== undefined && !loading) {
      fDatasets = fuse.search(search).map((f) => f.item);
    }

    // Parameter filtering
    var fParams = this.filterParameters(fDatasets, parameters);
    const dataP = this.filterParameters(
      this.filterDataSet(datasets, filters, parameters, "parameters_id"),
      parameters
    );
    const dataL = this.filterDataSet(datasets, filters, parameters, "lakes_id");

    var dParams = this.filterList(dataP, "parameters_id", "parameters", 1);
    var dLake = this.filterList(dataL, "lakes_id", "lakes");
    var dOrigin = this.filterList(datasets, "origin", "NA");

    // Sort by
    if (search === "") {
      fDatasets = this.sortDatasets(fDatasets, sortby);
    }

    // Selected link
    var sids = selected.map((x) => x.id);
    var p = JSON.parse(JSON.stringify(parameters));
    p = p.filter((x) => sids.includes(x.datasets_id));
    p = p.filter((x) => ![1, 2, 3, 4].includes(x.parameters_id));
    p = p.map((x) => [x.datasets_id, x.parameters_id]);
    var link = "/map?selected=" + JSON.stringify(p);

    return (
      <React.Fragment>
        <h1>Data Portal</h1>
        <div className="search">
          <input
            id="dataportalsearchbar"
            onChange={this.searchDatasets}
            className="SearchBar"
            placeholder="Search using keywords e.g. ctd or geneva or salinity"
            type="search"
            ref="search"
            value={search}
          />
        </div>
        <SidebarLayout
          sidebartitle="Filters"
          left={
            <React.Fragment>
              <div className="sortbar">
                <table className="sortbar-table">
                  <tbody>
                    <tr>
                      <td>
                        <div
                          title="Download multiple datasets"
                          onClick={this.download}
                        >
                          {selected.length} selected of {fDatasets.length}{" "}
                          datasets
                        </div>
                      </td>
                      <td>
                        <div
                          title="Clear selected datasets"
                          onClick={this.clearSelected}
                        >
                          &#10005;
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                {search === "" && (
                  <select
                    title="Sort by"
                    onChange={this.setSelect}
                    defaultValue={sortby}
                  >
                    <option value="az">A-Z</option>
                    <option value="recent">Recent</option>
                    <option value="downloads">Downloads</option>
                  </select>
                )}
              </div>
              <FilterBar filters={filters} removeFilter={this.removeFilter} />

              <div className={download ? "popup" : "hidepopup"}>
                <div className="download-inner">
                  <h3>Selected Datasets</h3>
                  {selected.length > 0 ? (
                    <div>
                      <div className="download-selected">
                        {selected.map((s) => {
                          return (
                            <div key={s.title} className="download-item">
                              {s.title}
                            </div>
                          );
                        })}
                      </div>
                      <Link to={link}>
                        <button title="See datasets on web GIS">
                          Plot datasets in the Map Viewer
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <div>No datasets selected</div>
                  )}
                </div>
              </div>

              <div
                className={map ? "popup" : "hidepopup"}
                title="Hold ctrl and drag with your mouse to select custom area"
              >
                <div className="mapselecttitle">
                  Hold ctrl, click and drag to select a custom area
                </div>
                <MapSelect
                  datasets={fDatasets}
                  selectPoints={this.mapAddFilter}
                  filters={filters}
                  mapToggle={this.mapToggle}
                />
              </div>
              <DatasetList
                selected={this.state.selected}
                list={fDatasets}
                parameters={fParams}
                onSelectDataset={this.selectDataset}
                datalistclass={"datalist show"}
                dropdown={dropdown}
                getLabel={this.getLabel}
                loading={loading}
                editUrl={this.editUrl}
              />
            </React.Fragment>
          }
          rightNoScroll={
            <React.Fragment>
              <table className="time-selector">
                <tbody>
                  <tr>
                    <td>From</td>
                    <td>Until</td>
                  </tr>
                  <tr>
                    <td>
                      <input type="date" onChange={this.startTimeAddFilter} />
                    </td>
                    <td>
                      <input type="date" onChange={this.endTimeAddFilter} />
                    </td>
                  </tr>
                </tbody>
              </table>
              <PopupBox title="Location" fun={this.mapToggle} state={map} />
              <FilterBox
                title="Origin"
                content={
                  <FilterBoxInner
                    checkbox={this.checkboxAddFilter}
                    cat="origin"
                    params={dOrigin}
                    filters={filters}
                    table="datasets"
                  />
                }
                preopen="true"
              />
              <FilterBox
                title="Lake"
                content={
                  <FilterBoxInner
                    checkbox={this.checkboxAddFilter}
                    cat="lakes_id"
                    params={dLake}
                    filters={filters}
                    table="datasets"
                  />
                }
                preopen="true"
              />
              <FilterBox
                title="Parameters"
                content={
                  <FilterBoxInner
                    checkbox={this.checkboxAddFilter}
                    cat="parameters_id"
                    params={dParams}
                    filters={filters}
                    table="parameters"
                  />
                }
                preopen="true"
              />
            </React.Fragment>
          }
        />
      </React.Fragment>
    );
  }
}

export default DataPortal;
