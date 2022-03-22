import React, { Component } from "react";
import Basemap from "../../graphs/leaflet/basemap";
import axios from "axios";
import { apiUrl } from "../../config.json";
import "./lakemorphology.css";
import D3LineGraph from "../../graphs/d3/linegraph/linegraph";

class LakeMorphologyGraph extends Component {
  state = {
    morphology: {},
    data: [],
    xlabel: "",
    xlabels: [],
    ylabel: "",
    xunits: "",
    yunits: "",
    interpolated: true,
  };

  download = () => {
    function getValues(keys, download) {
      return keys.map((d) => download[d].values[i]);
    }
    var { morphology } = this.state;
    var { lake } = this.props;
    var download = JSON.parse(JSON.stringify(morphology));
    delete download.id;
    var keys = Object.keys(download).filter((k) => k !== "Source");
    var csv = `data:text/csv;charset=utf-8, ${keys
      .map((d) => `${d} (${download[d].unit})`)
      .join(",")}\n`;
    for (var i = 0; i < download["Depth"].values.length; i++) {
      csv = csv + `${getValues(keys, download).join(",")}\n`;
    }
    var name = lake.name.split(" ").join("_") + "_Morphology.csv";
    var encodedUri = encodeURI(csv);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", name);
    document.body.appendChild(link);
    link.click();
  };

  onChangeX = (event) => {
    var { ylabel, morphology, interpolated } = this.state;
    var xlabel = event.target.value;
    var { data, xunits } = this.prepareGraph(
      xlabel,
      ylabel,
      morphology,
      interpolated
    );
    this.setState({ data, xunits, xlabel });
  };

  toggleInterpolated = () => {
    var { xlabel, ylabel, morphology, interpolated } = this.state;
    interpolated = !interpolated;
    var { data } = this.prepareGraph(xlabel, ylabel, morphology, interpolated);
    this.setState({ interpolated, data });
  };

  prepareGraph = (xlabel, ylabel, morphology, interpolated) => {
    var data;
    if (interpolated) {
      data = {
        y: morphology[ylabel].values,
        x: morphology[xlabel].values,
      };
    } else {
      var x = [];
      var y = [];
      for (var i = 0; i < morphology["Interpolated"].values.length; i++) {
        if (
          !morphology["Interpolated"].values[i] ||
          morphology["Interpolated"].values[i] === "false"
        ) {
          x.push(morphology[xlabel].values[i]);
          y.push(morphology[ylabel].values[i]);
        }
      }
      data = { x, y };
    }
    var xunits = morphology[xlabel].unit;
    var yunits = morphology[ylabel].unit;
    return { data, xunits, yunits };
  };

  selectLake = async () => {
    var { lake } = this.props;
    var { interpolated } = this.state;
    if (lake.morphology) {
      var { data: morphology } = await axios.get(
        `${apiUrl}/externaldata/morphology/${lake.id}`
      );
      for (var key of Object.keys(morphology)) {
        if (!["id", "interpolated", "source"].includes(key.toLowerCase())) {
          morphology[key].values = morphology[key].values.map((d) =>
            parseFloat(d)
          );
        }
      }
      var ylabel = "Depth";

      var xlabels = Object.keys(morphology).filter(
        (m) =>
          !["id", "depth", "interpolated", "source"].includes(m.toLowerCase())
      );

      var xlabel = xlabels[0];
      if (xlabels.includes("Volume")) xlabel = "Volume";

      var { data, xunits, yunits } = this.prepareGraph(
        xlabel,
        ylabel,
        morphology,
        interpolated
      );

      this.setState({
        morphology,
        data,
        xlabel,
        xlabels,
        ylabel,
        xunits,
        yunits,
      });
    }
  };

  async componentDidUpdate(prevProps) {
    var { lakename } = this.props;
    if (prevProps.lakename !== lakename) {
      this.selectLake();
    }
  }

  async componentDidMount() {
    this.selectLake();
  }

  render() {
    var {
      data,
      xlabel,
      xlabels,
      ylabel,
      xunits,
      yunits,
      interpolated,
      morphology,
    } = this.state;
    var { reset } = this.props;

    return (
      <React.Fragment>
        <div className="xselect">
          <div className="text">Plot Parameter: </div>
          <select onChange={this.onChangeX} value={xlabel}>
            {xlabels.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
          <button onClick={this.download}>Download Morphology</button>
        </div>
        <div className="close" title="Deselect lake" onClick={reset}>
          &#215;
        </div>
        <div className="lakes-graph-short">
          <D3LineGraph
            data={data}
            xlabel={xlabel}
            ylabel={ylabel}
            xunits={xunits}
            yunits={yunits}
            lcolor={["black"]}
            lweight={["1"]}
            bcolor={"white"}
            xscale={"linear"}
            yscale={"linear"}
            yReverse={true}
            xReverse={false}
          />
        </div>
        <div className="interpolated">
          Show interpolated values{" "}
          <input
            type="checkbox"
            checked={interpolated}
            onChange={this.toggleInterpolated}
          />
        </div>

        <div className="reference">
          {"Source" in morphology
            ? morphology["Source"]
            : "Please contact Isabel Kiefer (isabel.kiefer@epfl.ch) at EPFL for more information on this dataset."}
        </div>
      </React.Fragment>
    );
  }
}

class LakeMorphology extends Component {
  state = {
    lakes: [],
    geojson: false,
    sort: "name",
    sortDir: true,
    text: "",
  };
  urlSafe = (str) => {
    var clean = [
      { b: "ä", a: "a" },
      { b: "ö", a: "o" },
      { b: "ü", a: "u" },
      { b: "è", a: "e" },
      { b: "é", a: "e" },
      { b: "à", a: "a" },
      { b: "ù", a: "u" },
      { b: "â", a: "a" },
      { b: "ê", a: "e" },
      { b: "î", a: "i" },
      { b: "ô", a: "o" },
      { b: "û", a: "u" },
      { b: "ç", a: "c" },
      { b: "ë", a: "e" },
      { b: "ï", a: "i" },
      { b: "ü", a: "u" },
      { b: "ì", a: "i" },
      { b: "ò", a: "o" },
      { b: "ó", a: "o" },
    ];
    for (let edit in clean) {
      str = str.replace(edit.b, edit.a);
    }

    return str.replace(/[^a-zA-Z]/g, "").toLowerCase();
  };

  setText = (event) => {
    this.setState({ text: event.target.value });
  };

  setLocation = (name, id) => {
    const pathname = this.props.location.pathname;
    this.props.history.push({
      pathname: pathname,
      search: this.urlSafe(name) + "_" + id,
    });
  };

  resetLocation = () => {
    const pathname = this.props.location.pathname;
    this.props.history.push({
      pathname: pathname,
      search: "",
    });
  };

  setLake = (feature) => {
    this.setLocation(feature.properties.Name, feature.properties.id);
  };

  sort = (sort, morphology) => {
    if (["name", "elevation", "depth"].includes(sort)) {
      var x = this.state.sortDir ? 1 : -1;
      morphology.sort((a, b) =>
        a[sort] > b[sort] ? x : b[sort] > a[sort] ? -x : 0
      );
    }
  };

  filter = (text, morphology) => {
    if (text !== "") {
      return morphology.filter((m) =>
        m.name.toLowerCase().includes(text.toLowerCase())
      );
    } else {
      return JSON.parse(JSON.stringify(morphology));
    }
  };

  setSort = (sort) => {
    this.setState({ sort, sortDir: !this.state.sortDir });
  };

  async componentDidMount() {
    let server = await Promise.all([
      axios.get(apiUrl + "/selectiontables/lakes"),
      axios.get(apiUrl + "/externaldata/lakejson"),
    ]).catch((error) => {
      console.error(error);
    });
    var lakes = server[0].data;
    var geojson = server[1].data;
    lakes = lakes.map((l) => {
      l.depth = parseFloat(l.depth);
      l.elevation = parseFloat(l.elevation);
      return l;
    });
    lakes = lakes.filter((l) => l.morphology);
    var ids = lakes.map((l) => l.id);
    geojson.features = geojson.features.filter((f) =>
      ids.includes(f.properties.id)
    );
    this.setState({ lakes, geojson });
  }
  render() {
    document.title = "Lake Morphology - Datalakes";
    let { search } = this.props.location;
    var { lakes, geojson, sort, text } = this.state;
    var list = this.filter(text, lakes);
    this.sort(sort, list);

    var lake;
    var id;
    if (
      search &&
      lakes.map((l) => l.id).includes(parseInt(search.split("_")[1]))
    ) {
      lake = lakes.find((l) => l.id === parseInt(search.split("_")[1]));
      id = lake.id;
    }
    return (
      <React.Fragment>
        {lake ? (
          <h2>Lake Morphology - {lake.name}</h2>
        ) : (
          <h2>Lake Morphology</h2>
        )}
        <div className="morphology">
          <div className="left">
            {lake ? (
              <div className="lake-morphology">
                <LakeMorphologyGraph
                  lake={lake}
                  lakename={lake.name}
                  geojson={geojson}
                  reset={this.resetLocation}
                />
              </div>
            ) : (
              <div className="lake-morphology short">
                <div className="banner">
                  Select a lake to view and download its morphology.
                </div>
              </div>
            )}
            <div className={lake ? "lakes-map" : "lakes-map full"}>
              <Basemap
                basemap="datalakesmap"
                geojson={geojson}
                geojson_function={this.setLake}
                geojson_zoom={id}
              />
            </div>
          </div>
          <div className="right">
            <div className="lake-list-header">
              <input
                placeholder="Search for lake"
                value={text}
                onChange={this.setText}
                type="search"
              />
              <table>
                <tbody>
                  <tr>
                    <th
                      onClick={() => this.setSort("name")}
                      title="Click to sort by name"
                      style={{ width: "220px" }}
                    >
                      Lake
                    </th>
                    <th
                      onClick={() => this.setSort("depth")}
                      title="Click to sort by depth"
                      style={{ width: "60px" }}
                    >
                      Depth (m)
                    </th>
                    <th
                      onClick={() => this.setSort("elevation")}
                      title="Click to sort by elevation"
                      style={{ width: "60px" }}
                    >
                      Elevation (mAOD)
                    </th>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="lake-list-body">
              <table>
                <tbody>
                  {list.map((l) => (
                    <tr
                      key={l.id}
                      onClick={() => this.setLocation(l.name, l.id)}
                    >
                      <td style={{ width: "230px" }}>{l.name}</td>
                      <td style={{ width: "60px" }} className="center">
                        {l.depth}
                      </td>
                      <td style={{ width: "60px" }} className="center">
                        {l.elevation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default LakeMorphology;
