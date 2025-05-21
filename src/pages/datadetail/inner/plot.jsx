import React, { Component } from "react";
import * as d3 from "d3";
import { interp2 } from "../../../components/interp2/interp2";
import SidebarLayout from "../../../format/sidebarlayout/sidebarlayout";
import ColorManipulation from "../../../components/colormanipulation/colormanipulation";
import DataSelect from "../../../components/dataselect/dataselect";
import Loading from "../../../components/loading/loading";
import D3HeatMap from "../../../graphs/d3/heatmap/heatmap";
import SliderDouble from "../../../components/sliders/sliderdouble";
import SliderSingle from "../../../components/sliders/slidersingle";
import NumberSliderDouble from "../../../components/sliders/sliderdoublenumber";
import LoadDataSets from "../../../components/loaddatasets/loaddatasets";
import D3LineGraph from "../../../graphs/d3/linegraph/linegraph";
import FilterBox from "../../../components/filterbox/filterbox";
import colorlist from "../../../components/colorramp/colors";
import isArray from "lodash/isArray";
import isInteger from "lodash/isInteger";
import ReportIssue from "../../../components/reportissue/reportissue";
import Connect from "../img/connect.svg";
import Bafu from "./bafu";
import Display from "./display";

class Graph extends Component {
  render() {
    function processMaintenance(maintenance) {
      // process maintenance events to create distinct time intervals with associated events
      // because some maintenance can overlap
      if (!maintenance) return [];
      if (!Array.isArray(maintenance)) maintenance = [maintenance];
      var bounds = [];
      maintenance.forEach((event) => {
        bounds.push({ time: new Date(event.starttime), type: "start", event });
        bounds.push({ time: new Date(event.endtime), type: "stop", event });
      });
      bounds.sort((a, b) => a.time - b.time);

      // create intervals with active maintenance events
      var intervals = [];
      var activeEvents = [];

      for (let i = 0; i < bounds.length - 1; i++) {
        const { time, type, event } = bounds[i];

        if (type === "start") {
          activeEvents.push(event);
        } else {
          const idx = activeEvents.indexOf(event);
          if (idx !== -1) activeEvents.splice(idx, 1);
        }

        const nextTime = bounds[i + 1].time;
        if (time < nextTime && activeEvents.length > 0) {
          intervals.push({
            interval: [new Date(time), new Date(nextTime)],
            events: [...activeEvents],
          });
        }
      }
      return intervals;
    }

    function processEvents(events) {
      // process events to create distinct time intervals with associated events
      // because some events can overlap
      if (!events) return [];
      if (!Array.isArray(events)) events = [events];
      
      // create bounds for each event
      var bounds = [];
      events.forEach((event) => {
        bounds.push({ time: new Date(event.start), type: "start", event });
        bounds.push({ time: new Date(event.stop), type: "stop", event });
      });
      // sort by time and type
      bounds.sort((a, b) => {
        if (a.time.getTime() !== b.time.getTime()) {
          return a.time - b.time;
        }
        return a.type === "start" && b.type === "stop" ? -1 : 1;
      });

      // create intervals with active events
      var intervals = [];
      var activeEvents = [];

      for (let i = 0; i < bounds.length - 1; i++) {
        const { time, type, event } = bounds[i];
    
        if (type === "start") {
          activeEvents.push(event);
        } else {
          const idx = activeEvents.indexOf(event);
          if (idx !== -1) activeEvents.splice(idx, 1);
        }
    
        const nextTime = bounds[i + 1].time;
        if (time < nextTime && activeEvents.length > 0) {
          intervals.push({
            interval: [new Date(time), new Date(nextTime)],
            events: [...activeEvents],
          });
        }
      }

      return intervals;
    }

    var {
      graph,
      plotdata,
      title,
      xlabel,
      ylabel,
      zlabel,
      xunits,
      yunits,
      zunits,
      bcolor,
      colors,
      plotdots,
      thresholdStep,
      display,
      lowerZ,
      upperZ,
      confidence,
      lcolor,
      lweight,
      timeaxis,
      xReverse,
      yReverse,
      file,
      files,
      xaxis,
      yaxis,
      xScale,
      yScale,
      datasetparameters,
      maintenance,
      mask,
      events,
      withEvents,
    } = this.props;
    switch (graph) {
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
      case "heatmap":
        return (
          <React.Fragment>
            <D3HeatMap
              data={plotdata}
              title={title}
              xlabel={xlabel}
              ylabel={ylabel}
              zlabel={zlabel}
              xunits={xunits}
              yunits={yunits}
              zunits={zunits}
              bcolor={bcolor}
              colors={colors}
              thresholdStep={thresholdStep}
              minvalue={lowerZ}
              maxvalue={upperZ}
              yReverse={yReverse}
              xReverse={xReverse}
              display={display}
              maintenance={processMaintenance(mask ? [] : maintenance)}
              events={processEvents(withEvents ? events : [])}
            />
          </React.Fragment>
        );
      case "linegraph":
        if (timeaxis === "x") xScale = "Time";
        if (timeaxis === "y") yScale = "Time";
        var x2label = "";
        var x2units = "";
        var y2label = "";
        var y2units = "";

        var legend = [];
        if (xaxis.length > 1 && file.length < 2) {
          xlabel = "";
          for (let i = 0; i < xaxis.length; i++) {
            let dp = datasetparameters.find((d) => d.axis === xaxis[i]);
            let axis = "x";
            if (i > 0 && legend[0].unit !== dp.unit) {
              axis = "x2";
              xlabel = this.props.xlabel;
              x2label = dp.name;
              x2units = dp.unit;
            }
            legend.push({
              id: i,
              color: lcolor[i],
              text: dp.name + (dp.detail === "none" ? "" : ` (${dp.detail})`),
              unit: dp.unit,
              xaxis: axis,
              yaxis: "y",
            });
          }
          if (legend.filter((l) => l.xaxis === "x").length > 1) xlabel = "";
          if (legend.filter((l) => l.xaxis === "x").length > 1) x2label = "";
        } else if (yaxis.length > 1 && file.length < 2) {
          ylabel = "";
          for (let i = 0; i < yaxis.length; i++) {
            let dp = datasetparameters.find((d) => d.axis === yaxis[i]);
            let axis = "y";
            if (i > 0 && legend[0].unit !== dp.unit) {
              axis = "y2";
              ylabel = this.props.ylabel;
              y2label = dp.name;
              y2units = dp.unit;
            }
            legend.push({
              id: i,
              color: lcolor[i],
              text: dp.name + (dp.detail === "none" ? "" : ` (${dp.detail})`),
              unit: dp.unit,
              yaxis: axis,
              xaxis: "x",
            });
          }
          if (legend.filter((l) => l.yaxis === "y2").length > 1) y2label = "";
          if (legend.filter((l) => l.yaxis === "y").length > 1) ylabel = "";
        } else {
          for (let i = 0; i < file.length; i++) {
            var value = new Date(files[file[i]].ave);
            var text = value.toDateString() + " " + value.toLocaleTimeString();
            var color = lcolor[i];
            legend.push({ id: i, color, text, value, yaxis: "y", xaxis: "x" });
          }
        }

        return (
          <React.Fragment>
            <D3LineGraph
              data={plotdata}
              legend={legend}
              confidence={confidence}
              title={title}
              xlabel={xlabel}
              ylabel={ylabel}
              xunits={xunits}
              yunits={yunits}
              x2label={x2label}
              y2label={y2label}
              x2units={x2units}
              y2units={y2units}
              lcolor={lcolor}
              lweight={lweight}
              bcolor={bcolor}
              xscale={xScale}
              yscale={yScale}
              yReverse={yReverse}
              xReverse={xReverse}
              plotdots={plotdots}
              setDownloadGraph={this.setDownloadGraph}
              border={true}
              maintenance={processMaintenance(mask ? [] : maintenance)}
              events={processEvents(withEvents ? events : [])}
            />
          </React.Fragment>
        );
    }
  }
}

class Sidebar extends Component {
  render() {
    return (
      <React.Fragment>
        <AxisSelect
          graph={this.props.graph}
          xaxis={this.props.xaxis}
          yaxis={this.props.yaxis}
          zaxis={this.props.zaxis}
          addNewFiles={this.props.addNewFiles}
          xoptions={this.props.xoptions}
          yoptions={this.props.yoptions}
          zoptions={this.props.zoptions}
          handleAxisSelect={this.props.handleAxisSelect}
          handleAxisAppend={this.props.handleAxisAppend}
        />
        <Range {...this.props} />
        <DisplayOptions {...this.props} />
      </React.Fragment>
    );
  }
}

class AxisSelect extends Component {
  render() {
    var {
      graph,
      xaxis,
      yaxis,
      zaxis,
      xoptions,
      yoptions,
      zoptions,
      addNewFiles,
      handleAxisSelect,
    } = this.props;
    return (
      <React.Fragment>
        <FilterBox
          title="Axis"
          preopen="true"
          content={
            <div>
              {xaxis && (
                <div>
                  x:{" "}
                  <div className="axis-select">
                    <DataSelect
                      value="value"
                      label="label"
                      dataList={xoptions}
                      defaultValue={xaxis[0]}
                      onChange={handleAxisSelect}
                    />
                  </div>
                </div>
              )}
              {yaxis && (
                <div>
                  y:{" "}
                  <div className="axis-select">
                    <DataSelect
                      value="value"
                      label="label"
                      dataList={yoptions}
                      defaultValue={yaxis[0]}
                      onChange={handleAxisSelect}
                    />
                  </div>
                </div>
              )}
              {zaxis && (
                <div>
                  z:{" "}
                  <div className="axis-select">
                    <DataSelect
                      value="value"
                      label="label"
                      dataList={zoptions}
                      defaultValue={zaxis}
                      disabled={graph === "linegraph"}
                      onChange={handleAxisSelect}
                    />
                  </div>
                </div>
              )}
            </div>
          }
        />
        {graph === "linegraph" && !addNewFiles && (
          <FilterBox
            title="Compare"
            newFeature="true"
            preopen="false"
            content={<Compare {...this.props} />}
          />
        )}
      </React.Fragment>
    );
  }
}

class Compare extends Component {
  state = {};
  render() {
    var { xaxis, yaxis, xoptions, yoptions, handleAxisAppend } = this.props;
    var units = [];
    var selected = [];
    var selectable = [];
    var options = xoptions.concat(yoptions);
    if (xaxis.length > 1) {
      for (let i = 0; i < xaxis.length; i++) {
        units.push(xoptions.find((x) => x.value === xaxis[i]).unit);
        if (i !== 0) selected.push(xoptions.find((x) => x.value === xaxis[i]));
      }
      units = [...new Set(units)];
    } else if (yaxis.length > 1) {
      for (let i = 0; i < yaxis.length; i++) {
        units.push(yoptions.find((y) => y.value === yaxis[i]).unit);
        if (i !== 0) selected.push(yoptions.find((y) => y.value === yaxis[i]));
      }
      units = [...new Set(units)];
    }
    if (units.length < 2) units = options.map((o) => o.unit);
    for (let i = 0; i < options.length; i++) {
      if (
        ![1, 2, 18].includes(options[i].id) &&
        units.includes(options[i].unit) &&
        !xaxis.includes(options[i].value) &&
        !yaxis.includes(options[i].value)
      ) {
        selectable.push(options[i]);
      }
    }
    return (
      <div className="axis-compare">
        <div className="axis-compare-selected">
          {selected.map((o) => (
            <div
              className="axis-compare-selected-object"
              key={"selected_" + o.value}
              onClick={() => handleAxisAppend(o.value)}
              title="Click to remove parameter"
            >
              {o.label}
              <span className="close">&#215;</span>
            </div>
          ))}
        </div>
        {selectable.length > 0 && (
          <div className="axis-compare-title">
            Add Additional Parameter
            <div className="axis-compare-selectable">
              {selectable.map((o) => (
                <div
                  className="axis-compare-selectable-object"
                  key={"selectable_" + o.value}
                  onClick={() => handleAxisAppend(o.value)}
                  title="Click to add parameter"
                >
                  {o.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
}

class Range extends Component {
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

  onChangeLowerX = (event) => {
    if (event instanceof Date) {
      this.props.onChangeX([event.getTime(), this.props.upperX * 1000]);
    } else {
      this.props.onChangeX([event, this.props.upperX]);
    }
  };

  onChangeLowerY = (event) => {
    if (event instanceof Date) {
      this.props.onChangeY([event.getTime(), this.props.upperY * 1000]);
    } else {
      this.props.onChangeY([event, this.props.upperY]);
    }
  };

  onChangeUpperX = (event) => {
    if (event instanceof Date) {
      this.props.onChangeX([this.props.lowerX * 1000, event.getTime()]);
    } else {
      this.props.onChangeX([this.props.lowerX, event]);
    }
  };

  onChangeUpperY = (event) => {
    if (event instanceof Date) {
      this.props.onChangeY([this.props.lowerY * 1000, event.getTime()]);
    } else {
      this.props.onChangeY([this.props.lowerY, event]);
    }
  };

  onChangeFile = (event) => {
    var { onChangeFile, files } = this.props;
    var id = this.closest(
      event.getTime(),
      files.map((a) => a.ave.getTime())
    );
    if (id > 0 && id < files.length) onChangeFile(id);
  };

  render() {
    var { timeaxis, graph, files, file, xaxis, yaxis } = this.props;
    var { minX, maxX, minY, maxY, lowerX, upperX, lowerY, upperY } = this.props;
    var { data, downloadData, xunits, yunits, xlabel, ylabel } = this.props;
    var { onChangeFile, toggleAddNewFile, removeFile, lcolor } = this.props;
    var { mindatetime, maxdatetime, addNewFiles } = this.props;
    var connect;
    if (files.length > 0) {
      connect = files[file[0]].connect;
    }
    if (connect === "ind") {
      var fileControl = [];
      if (file.length > 0) {
        var value = files[file[file.length - 1]].ave;
        for (var i = 0; i < file.length; i++) {
          let dt = new Date(files[file[i]].ave);
          let text = dt.toDateString() + " " + dt.toLocaleTimeString();
          fileControl.push(
            <tr key={"file" + i}>
              <td>
                <div
                  className="color-line"
                  style={{ backgroundColor: lcolor[i] }}
                />
              </td>
              <td>{text}</td>
              <td
                id={i}
                onClick={removeFile}
                title="Remove"
                className="removefile"
              >
                ✕
              </td>
            </tr>
          );
        }
      }
    }
    return (
      <React.Fragment>
        {timeaxis === "M" && (
          <FilterBox
            title="Files"
            preopen="true"
            content={
              <div className="">
                <SliderSingle
                  onChange={this.onChangeFile}
                  onChangeFileInt={onChangeFile}
                  file={file}
                  value={value}
                  min={mindatetime}
                  max={maxdatetime}
                  files={files}
                  type="time"
                />
                <LoadDataSets data={data} downloadData={downloadData} />
                {graph === "linegraph" && (
                  <React.Fragment>
                    <div className="keeplines">
                      Keep previously plotted line{" "}
                      <input
                        checked={addNewFiles}
                        type="checkbox"
                        onChange={toggleAddNewFile}
                      />
                    </div>
                    <table className="filecontrol">
                      <tbody>{fileControl}</tbody>
                    </table>
                  </React.Fragment>
                )}
              </div>
            }
          />
        )}
        {["x", "y"].includes(timeaxis) && (
          <FilterBox
            title={"x" === timeaxis ? xlabel + " Range" : ylabel + " Range"}
            content={
              <div className="side-date-slider">
                <SliderDouble
                  onChangeLower={
                    "x" === timeaxis ? this.onChangeLowerX : this.onChangeLowerY
                  }
                  onChangeUpper={
                    "x" === timeaxis ? this.onChangeUpperX : this.onChangeUpperY
                  }
                  min={"x" === timeaxis ? minX : minY}
                  max={"x" === timeaxis ? maxX : maxY}
                  lower={"x" === timeaxis ? lowerX : lowerY}
                  upper={"x" === timeaxis ? upperX : upperY}
                  files={files}
                />
                <LoadDataSets data={data} downloadData={downloadData} />
              </div>
            }
            preopen={true}
          />
        )}
        {timeaxis !== "x" && xaxis.length === 1 && (
          <FilterBox
            title={xlabel + " Range"}
            content={
              <div className="side-date-slider">
                <NumberSliderDouble
                  onChangeLower={this.onChangeLowerX}
                  onChangeUpper={this.onChangeUpperX}
                  min={minX}
                  max={maxX}
                  lower={lowerX}
                  upper={upperX}
                  unit={xunits}
                />
              </div>
            }
            preopen={false}
          />
        )}
        {timeaxis !== "y" && yaxis.length === 1 && (
          <FilterBox
            title={ylabel + " Range"}
            content={
              <div className="side-date-slider">
                <NumberSliderDouble
                  onChangeLower={this.onChangeLowerY}
                  onChangeUpper={this.onChangeUpperY}
                  min={minY}
                  max={maxY}
                  lower={lowerY}
                  upper={upperY}
                  unit={yunits}
                />
              </div>
            }
            preopen={false}
          />
        )}
      </React.Fragment>
    );
  }
}

class DisplayOptions extends Component {
  state = {
    colors: this.props.colors,
    title: this.props.title,
    bcolor: this.props.bcolor,
    upperZ: this.props.upperZ,
    lowerZ: this.props.lowerZ,
    mask: this.props.mask,
    thresholdStep: this.props.thresholdStep,
    decimate: this.props.decimate,
    average: this.props.average,
    plotdots: this.props.plotdots,
    withEvents: this.props.withEvents,
    interpolate: this.props.interpolate,
    xScale: this.props.xScale,
    yScale: this.props.yScale,
  };
  toggleMask = () => {
    this.setState({ mask: !this.state.mask });
  };

  toggleEvents = () => {
    this.setState({ withEvents: !this.state.withEvents });
  };

  togglePlotdots = () => {
    this.setState({ plotdots: !this.state.plotdots });
  };

  resetLower = () => {
    var lowerZ = this.props.minZ;
    this.setState({ lowerZ });
  };

  resetUpper = () => {
    var upperZ = this.props.maxZ;
    this.setState({ upperZ });
  };

  onChangeDecimate = (event) => {
    var decimate = parseInt(event.target.value);
    this.setState({ decimate });
  };

  onChangeInterpolate = (event) => {
    this.setState({ interpolate: event.target.value });
  };
  onChangeAverage = (event) => {
    var average = event.target.value;
    this.setState({ average });
  };
  onChangexScale = (event) => {
    var xScale = event.target.value;
    this.setState({ xScale });
  };
  onChangeyScale = (event) => {
    var yScale = event.target.value;
    this.setState({ yScale });
  };
  onChangeLocalColors = (colors) => {
    this.setState({ colors });
  };
  onChangeLocalTitle = (event) => {
    var title = event.target.value;
    this.setState({ title });
  };
  onChangeLocalThreshold = (event) => {
    var thresholdStep = event.target.value;
    this.setState({ thresholdStep });
  };
  onChangeLocalMin = (event) => {
    var lowerZ = parseFloat(event.target.value);
    this.setState({ lowerZ });
  };
  onChangeLocalMax = (event) => {
    var upperZ = parseFloat(event.target.value);
    this.setState({ upperZ });
  };
  onChangeLocalBcolor = (event) => {
    var bcolor = event.target.value;
    this.setState({ bcolor });
  };
  updatePlot = () => {
    this.props.onChangeState(this.state);
  };
  componentDidUpdate(prevProps) {
    var {
      colors,
      title,
      bcolor,
      lowerZ,
      upperZ,
      thresholdStep,
      decimate,
      average,
      plotdots,
      interpolate,
    } = this.props;
    var updateZ = false;
    if (
      !isNaN(lowerZ) &&
      !isNaN(upperZ) &&
      (prevProps.lowerZ !== lowerZ || prevProps.upperZ !== upperZ)
    ) {
      updateZ = true;
    }
    if (
      prevProps.title !== title ||
      prevProps.colors !== colors ||
      updateZ ||
      prevProps.thresholdStep !== thresholdStep ||
      prevProps.decimate !== decimate ||
      prevProps.average !== average ||
      prevProps.plotdots !== plotdots ||
      prevProps.interpolate !== interpolate
    ) {
      this.setState({
        colors,
        title,
        bcolor,
        lowerZ,
        upperZ,
        thresholdStep,
        decimate,
        average,
        plotdots,
        interpolate,
      });
    }
  }
  render() {
    var {
      colors,
      title,
      bcolor,
      lowerZ,
      upperZ,
      thresholdStep,
      mask,
      decimate,
      average,
      plotdots,
      withEvents,
      interpolate,
      xScale,
      yScale,
    } = this.state;
    var { array, graph, timeaxis, interpolate_options } = this.props;
    upperZ = upperZ === undefined ? 0 : upperZ;
    lowerZ = lowerZ === undefined ? 0 : lowerZ;
    return (
      <FilterBox
        title="Display Options"
        content={
          <React.Fragment>
            <table className="colors-table">
              <tbody>
                <tr>
                  <td>Title</td>
                  <td colSpan="2">
                    <textarea
                      id="title"
                      defaultValue={title}
                      onChange={this.onChangeLocalTitle}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Background</td>
                  <td>
                    <input
                      type="color"
                      id="bcolor"
                      defaultValue={bcolor}
                      onChange={this.onChangeLocalBcolor}
                    />
                  </td>
                </tr>
                {graph === "heatmap" && (
                  <tr>
                    <td>Maximum</td>
                    <td colSpan="2">
                      <div className="z-edit">
                        <input
                          type="number"
                          id="upperZ"
                          value={upperZ}
                          onChange={this.onChangeLocalMax}
                        />
                        <button onClick={this.resetUpper}>Reset</button>
                      </div>
                    </td>
                  </tr>
                )}
                {graph === "heatmap" && (
                  <tr>
                    <td>Minimum</td>
                    <td colSpan="2">
                      <div className="z-edit">
                        <input
                          type="number"
                          id="lowerZ"
                          value={lowerZ}
                          onChange={this.onChangeLocalMin}
                        />
                        <button onClick={this.resetLower}>Reset</button>
                      </div>
                    </td>
                  </tr>
                )}
                {graph === "heatmap" && (
                  <tr>
                    <td>Number of Thresholds</td>
                    <td>
                      <input
                        type="number"
                        id="threshold"
                        step="1"
                        value={thresholdStep}
                        onChange={this.onChangeLocalThreshold}
                      />
                    </td>
                  </tr>
                )}
                {graph === "heatmap" && (
                  <tr>
                    <td>Interpolate missing values</td>
                    <td>
                      <select
                        id="interpolate"
                        value={interpolate}
                        onChange={this.onChangeInterpolate}
                        className="scale-select"
                      >
                        {interpolate_options.map((op) => (
                          <option key={op} value={op}>
                            {op}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                )}
                {["x", "y"].includes(timeaxis) && (
                  <tr>
                    <td>Down Sample</td>
                    <td>
                      1:
                      <input
                        className="downsample"
                        type="number"
                        step="1"
                        min="1"
                        value={decimate}
                        onChange={this.onChangeDecimate}
                      />
                    </td>
                  </tr>
                )}
                {["x", "y"].includes(timeaxis) && (
                  <tr>
                    <td>Averaging</td>
                    <td>
                      <select
                        id="average"
                        value={average}
                        onChange={this.onChangeAverage}
                        className="scale-select"
                      >
                        <option value="None">None</option>
                        <option value="Hourly">Hourly</option>
                        <option value="Daily">Daily</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                      </select>
                    </td>
                  </tr>
                )}
                <tr>
                  <td>Show Masked Points</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={!mask}
                      onChange={this.toggleMask}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Show Events</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={withEvents}
                      onChange={this.toggleEvents}
                    />
                  </td>
                </tr>
                {graph === "linegraph" && (
                  <tr>
                    <td>Plot Points</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={plotdots}
                        onChange={this.togglePlotdots}
                      />
                    </td>
                  </tr>
                )}
                {graph === "linegraph" && timeaxis !== "x" && (
                  <tr>
                    <td>xScale</td>
                    <td>
                      <select value={xScale} onChange={this.onChangexScale}>
                        <option value="Linear">Linear</option>
                        <option value="Log">Log</option>
                      </select>
                    </td>
                  </tr>
                )}
                {graph === "linegraph" && timeaxis !== "y" && (
                  <tr>
                    <td>yScale</td>
                    <td>
                      <select value={yScale} onChange={this.onChangeyScale}>
                        <option value="Linear">Linear</option>
                        <option value="Log">Log</option>
                      </select>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {graph === "heatmap" && (
              <ColorManipulation
                onChange={this.onChangeLocalColors}
                colors={colors}
                array={array}
              />
            )}
            <div className="editsettings-button">
              <button
                type="button"
                title="Update mapplot settings"
                onClick={this.updatePlot}
              >
                Update Plot
              </button>
            </div>
          </React.Fragment>
        }
      />
    );
  }
}

class Plot extends Component {
  state = {
    plotdata: [],
    xaxis: ["x"],
    yaxis: ["y"],
    zaxis: "z",
    xoptions: [],
    yoptions: [],
    zoptions: [],
    xlabel: "",
    ylabel: "",
    zlabel: "",
    xunits: "",
    yunits: "",
    zunits: "",
    graph: "",
    colors: [
      { color: "#0000ff", point: 0 },
      { color: "#ff0000", point: 1 },
    ],
    title: "",
    bcolor: false,
    lcolor: [
      "#000000",
      "#e6194B",
      "#3cb44b",
      "#ffe119",
      "#4363d8",
      "#f58231",
      "#911eb4",
      "#42d4f4",
      "#f032e6",
      "#bfef45",
      "#fabed4",
      "#469990",
      "#dcbeff",
      "#9A6324",
      "#fffac8",
      "#800000",
      "#aaffc3",
      "#808000",
      "#ffd8b1",
      "#000075",
    ],
    thresholdStep: 20,
    display: "heatmap",
    lweight: Array.from({ length: 20 }).map((x) => "1"),
    decimate: 1,
    average: "None",
    mask: true,
    interpolate: "none",
    interpolate_options: [
      "none",
      "x-linear",
      "y-linear",
      "x-nearest",
      "y-nearest",
    ],
    withEvents: false,
    plotdots: false,
    upperY: 1,
    lowerY: 0,
    upperX: 1,
    lowerX: 0,
    upperZ: 1,
    lowerZ: 0,
    maxY: 1,
    minY: 0,
    maxX: 1,
    minX: 0,
    maxZ: 1,
    minZ: 0,
    xScale: "Linear",
    yScale: "Linear",
    yReverse: false,
    xReverse: false,
    timeaxis: "",
    refresh: false,
    addNewFiles: false,
    failed: false,
  };

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

  average = (nums) => {
    return d3.mean(nums);
  };

  toggleAddNewFile = () => {
    this.setState({ addNewFiles: !this.state.addNewFiles });
  };

  onChangeState = (state) => {
    state.refresh = "z";
    this.setState(state);
  };

  onChangeY = async (event) => {
    var lower = event[0];
    var upper = event[1];
    if (
      lower !== this.state.lowerY * 1000 ||
      upper !== this.state.upperY * 1000
    ) {
      var { downloadMultipleFiles, data, files } = this.props;
      var { timeaxis } = this.state;
      if (timeaxis === "y") {
        var toDownload = [];
        for (var i = 0; i < files.length; i++) {
          if (
            new Date(files[i].mindatetime).getTime() < upper &&
            new Date(files[i].maxdatetime).getTime() > lower &&
            data[i] === 0
          ) {
            toDownload.push(i);
          }
        }
        upper = upper / 1000;
        lower = lower / 1000;
        if (toDownload.length > 0) {
          document.getElementById("detailloading").style.display = "block";
          await downloadMultipleFiles(toDownload);
          document.getElementById("detailloading").style.display = "none";
        }
      }
      this.setState({ lowerY: lower, upperY: upper, refresh: true });
    }
  };

  onChangeX = async (event) => {
    var lower = event[0];
    var upper = event[1];
    if (
      lower !== this.state.lowerX * 1000 ||
      upper !== this.state.upperX * 1000
    ) {
      var { downloadMultipleFiles, data, files } = this.props;
      var { timeaxis } = this.state;
      if (timeaxis === "x") {
        var toDownload = [];
        for (var i = 0; i < files.length; i++) {
          if (
            new Date(files[i].mindatetime).getTime() < upper &&
            new Date(files[i].maxdatetime).getTime() > lower &&
            data[i] === 0
          ) {
            toDownload.push(i);
          }
        }
        upper = upper / 1000;
        lower = lower / 1000;
        if (toDownload.length > 0) {
          document.getElementById("detailloading").style.display = "block";
          await downloadMultipleFiles(toDownload);
          document.getElementById("detailloading").style.display = "none";
        }
      }
      this.setState({ lowerX: lower, upperX: upper, refresh: true });
    }
  };

  onChangeFile = async (event) => {
    var { file, data, downloadMultipleFiles } = this.props;
    var { addNewFiles } = this.state;
    if (!file.includes(event) && file.length < 20) {
      if (!addNewFiles) file = [];
      file.push(event);
      if (data[event] === 0) {
        document.getElementById("detailloading").style.display = "block";
        await downloadMultipleFiles([event], file);
        document.getElementById("detailloading").style.display = "none";
      } else {
        await downloadMultipleFiles([], file);
      }
    }
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

  findLink = (parameters, link) => {
    return parameters.find((p) => p.id === link);
  };

  setAxisOptions = (datasetparameters, xaxis, yaxis) => {
    var xoptions = [];
    var yoptions = [];
    var zoptions = [];
    var graph = "linegraph";
    var xdp = datasetparameters.find((dp) => dp.axis === xaxis[0]);
    var ydp = datasetparameters.find((dp) => dp.axis === yaxis[0]);
    var yReverse = false;
    var xReverse = false;
    if ([2, 18, 43].includes(xdp.parameters_id)) xReverse = true;
    if ([2, 18, 43].includes(ydp.parameters_id)) yReverse = true;
    for (var j = 0; j < datasetparameters.length; j++) {
      var detail = datasetparameters[j]["detail"];
      var link = datasetparameters[j]["link"];
      var extra = "";
      if (Number.isInteger(link) && this.findLink(datasetparameters, link)) {
        extra = ` (${this.findLink(datasetparameters, link).name})`;
      } else if (["none", null, "null"].includes(detail)) {
        extra = "";
      } else {
        extra = ` (${detail})`;
      }

      if (
        datasetparameters[j]["axis"].includes("x") &&
        datasetparameters[j].parameters_id !== 27
      ) {
        xoptions.push({
          value: datasetparameters[j]["axis"],
          label: datasetparameters[j]["name"] + extra,
          id: datasetparameters[j]["parameters_id"],
          unit: datasetparameters[j]["unit"],
        });
      } else if (
        datasetparameters[j]["axis"].includes("y") &&
        datasetparameters[j].parameters_id !== 27
      ) {
        yoptions.push({
          value: datasetparameters[j]["axis"],
          label: datasetparameters[j]["name"] + extra,
          id: datasetparameters[j]["parameters_id"],
          unit: datasetparameters[j]["unit"],
        });
      } else if (datasetparameters[j]["axis"].includes("z")) {
        if (
          xdp.shape[0] === datasetparameters[j].shape[1] &&
          ydp.shape[0] === datasetparameters[j].shape[0] &&
          datasetparameters[j].parameters_id !== 27
        ) {
          graph = "heatmap";
          zoptions.push({
            value: datasetparameters[j]["axis"],
            label: datasetparameters[j]["name"] + extra,
          });
        }
      }
    }
    return { xoptions, yoptions, zoptions, graph, yReverse, xReverse };
  };

  getAxisLabels = (datasetparameters, xaxis, yaxis, zaxis) => {
    var xdp = datasetparameters.find((dp) => dp.axis === xaxis[0]);
    var ydp = datasetparameters.find((dp) => dp.axis === yaxis[0]);
    var zdp = datasetparameters.find((dp) => dp.axis === zaxis);

    var xlabel = xdp ? xdp.name : "";
    var ylabel = ydp ? ydp.name : "";
    var zlabel = zdp ? zdp.name : "";

    var xunits = xdp ? xdp.unit : "";
    var yunits = ydp ? ydp.unit : "";
    var zunits = zdp ? zdp.unit : "";

    return { xlabel, ylabel, zlabel, xunits, yunits, zunits };
  };

  handleAxisAppend = (event) => {
    var { xaxis, yaxis, zaxis } = this.state;
    if (event.includes("x")) {
      if (xaxis.includes(event)) {
        xaxis = xaxis.filter((x) => x !== event);
      } else {
        xaxis.push(event);
      }
    }
    if (event.includes("y")) {
      if (yaxis.includes(event)) {
        yaxis = yaxis.filter((y) => y !== event);
      } else {
        yaxis.push(event);
      }
    }
    this.axisEdit(xaxis, yaxis, zaxis);
  };

  handleAxisSelect = (event) => {
    var { xaxis, yaxis, zaxis } = this.state;
    if (event.value.includes("x")) xaxis = [event.value];
    if (event.value.includes("y")) yaxis = [event.value];
    if (event.value.includes("z")) zaxis = event.value;
    this.axisEdit(xaxis, yaxis, zaxis);
  };

  axisEdit = (xaxis, yaxis, zaxis) => {
    var { datasetparameters, data } = this.props;
    var { timeaxis, lowerY, lowerX, upperY, upperX } = this.state;
    var { xoptions, yoptions, zoptions, graph, yReverse, xReverse } =
      this.setAxisOptions(datasetparameters, xaxis, yaxis);
    if (zoptions.length > 0 && !zoptions.map((z) => z.value).includes(zaxis))
      zaxis = zoptions[0].value;
    var { xlabel, ylabel, zlabel, xunits, yunits, zunits } = this.getAxisLabels(
      datasetparameters,
      xaxis,
      yaxis,
      zaxis
    );
    var { minX, maxX, minY, maxY } = this.getBounds(
      data,
      xaxis,
      yaxis,
      timeaxis
    );
    if (timeaxis !== "x") {
      upperX = maxX;
      lowerX = minX;
    }
    if (timeaxis !== "y") {
      upperY = maxY;
      lowerY = minY;
    }

    this.setState({
      xaxis,
      yaxis,
      zaxis,
      xoptions,
      yoptions,
      zoptions,
      graph,
      xlabel,
      ylabel,
      zlabel,
      xunits,
      yunits,
      zunits,
      upperX,
      lowerX,
      upperY,
      lowerY,
      yReverse,
      xReverse,
      minX,
      maxX,
      minY,
      maxY,
      refresh: true,
    });
  };

  maskArray = (arr, maskArr, mask) => {
    var out = [];
    if (mask && isArray(maskArr) && arr.length === maskArr.length) {
      if (isArray(arr[0])) {
        for (let i = 0; i < arr.length; i++) {
          let inner = [];
          for (let j = 0; j < arr[i].length; j++) {
            if (maskArr[i][j] === 0) {
              inner.push(arr[i][j]);
            } else {
              inner.push(null);
            }
          }
          out.push(inner);
        }
      } else {
        for (let i = 0; i < arr.length; i++) {
          if (maskArr[i] < 1) {
            out.push(arr[i]);
          } else {
            out.push(null);
          }
        }
      }
      return out;
    } else {
      return arr;
    }
  };

  addMaintenance = (data, mask, time, maintenance) => {
    if (mask === undefined) {
      if (isArray(data[0])) {
        mask = Array(data.length)
          .fill()
          .map(() => Array(data[0].length).fill(0));
      } else {
        mask = new Array(time.length).fill(0);
      }
    }
    for (let i = 0; i < time.length; i++) {
      for (let j = 0; j < maintenance.length; j++) {
        if (maintenance[j].start < time[i] && time[i] < maintenance[j].end) {
          if (isArray(data[0])) {
            if (time.length === data.length) {
              for (let k = 0; k < data.length; k++) {
                mask[i][k] = 1;
              }
            } else if (time.length === data[0].length) {
              for (let k = 0; k < data.length; k++) {
                mask[k][i] = 1;
              }
            }
          } else {
            mask[i] = 1;
          }
        }
      }
    }
    return mask;
  };

  selectAxisAndMask = (
    data,
    files,
    file,
    xaxis,
    yaxis,
    zaxis,
    dp,
    mask,
    timeaxis,
    maintenance,
    graph
  ) => {
    var plotdata = [];
    var maskaxis = [];
    var axis = [].concat.apply([], [xaxis, yaxis, zaxis]);
    const findaxis = (dp, ax) => {
      return dp.find((p) => p.axis === ax);
    };
    const findmask = (dp, axp) => {
      return dp.find((dp) => dp.link === axp.id && dp.parameters_id === 27);
    };
    for (var ax of axis) {
      var axp = findaxis(dp, ax);
      if (axp && findmask(dp, axp)) {
        maskaxis.push(findmask(dp, axp)["axis"]);
      } else {
        maskaxis.push(false);
      }
    }

    var iter, pd, j;
    if (files[file[0]].connect === "ind") {
      iter = file;
    } else {
      iter = [...Array(data.length).keys()];
    }

    try {
      var maintenance_ids = maintenance.map((m) => m.datasetparameters_id);
      if (graph === "linegraph") {
        if (String([timeaxis]) === String(xaxis)) {
          for (let i = 0; i < yaxis.length; i++) {
            let a = dp.find((d) => d.axis === yaxis[i]).id;
            if (maintenance_ids.includes(a)) {
              let idx = axis.findIndex((e) => e === yaxis[i]);
              let m = maintenance.filter((m) => m.datasetparameters_id === a);
              for (let i of iter) {
                if (data[i] !== 0) {
                  if (maskaxis[idx] === false) {
                    maskaxis[idx] = axis[idx] + "_qual";
                  }
                  data[i][maskaxis[idx]] = this.addMaintenance(
                    data[i][axis[idx]],
                    data[i][maskaxis[idx]],
                    data[i][timeaxis],
                    m
                  );
                }
              }
            }
          }
        }
      } else if (graph === "heatmap") {
        if (String([timeaxis]) === String(xaxis)) {
          let a = dp.find((d) => d.axis === zaxis).id;
          if (maintenance_ids.includes(a)) {
            let idx = axis.findIndex((e) => e === zaxis);
            let m = maintenance.filter(
              (m) => m.datasetparameters_id === a && m.depths === ""
            );
            for (let i of iter) {
              if (data[i] !== 0) {
                if (maskaxis[idx] === false) {
                  maskaxis[idx] = axis[i] + "_qual";
                }
                data[i][maskaxis[idx]] = this.addMaintenance(
                  data[i][axis[idx]],
                  data[i][maskaxis[idx]],
                  data[i][timeaxis],
                  m
                );
              }
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to add maintenance periods.");
      console.error(e);
    }

    for (let i of iter) {
      if (data[i] !== 0) {
        pd = {};
        for (j = 0; j < axis.length; j++) {
          if (maskaxis) {
            pd[axis[j]] = this.maskArray(
              data[i][axis[j]],
              data[i][maskaxis[j]],
              mask
            );
          } else {
            pd[axis[j]] = data[i][axis[j]];
          }
        }
        plotdata.push(pd);
      }
    }

    return plotdata;
  };

  formatTime = (plotdata, datasetparameters, xaxis, yaxis) => {
    var xdp = datasetparameters.find((dp) => dp.axis === xaxis);
    var ydp = datasetparameters.find((dp) => dp.axis === yaxis);

    if (xdp.parameters_id === 1) {
      if (isArray(plotdata)) {
        for (let i = 0; i < plotdata.length; i++) {
          plotdata[i].x = plotdata[i].x.map((pdx) => new Date(pdx * 1000));
        }
      } else {
        plotdata.x = plotdata.x.map((pdx) => new Date(pdx * 1000));
      }
    }
    if (ydp.parameters_id === 1) {
      if (isArray(plotdata)) {
        for (let i = 0; i < plotdata.length; i++) {
          plotdata[i].y = plotdata[i].y.map((pdy) => new Date(pdy * 1000));
        }
      } else {
        plotdata.y = plotdata.y.map((pdy) => new Date(pdy * 1000));
      }
    }
    return plotdata;
  };

  joinData = (plotdata, graph, xaxis, yaxis, zaxis, connect, timeaxis) => {
    if (graph === "linegraph") {
      if (isArray(plotdata) && connect === "join") {
        plotdata = this.joinLinegraphData(plotdata, xaxis, yaxis, timeaxis);
      }
      if ((xaxis.length > 1 || yaxis.length > 1) && plotdata.length === 1) {
        plotdata = this.reorderMultipleLines(plotdata, xaxis, yaxis);
      }
    } else if (graph === "heatmap") {
      if (isArray(plotdata) && connect === "join") {
        plotdata = this.joinHeatmapData(plotdata, xaxis, yaxis, zaxis);
      }
    }
    return this.relabelDataObject(plotdata);
  };

  reorderMultipleLines = (plotdata, xaxis, yaxis) => {
    var lines = [];
    var ax;
    if (xaxis.length > 1) {
      for (ax of xaxis) {
        lines.push({
          x: plotdata[0][ax],
          y: plotdata[0][yaxis[0]],
          z: undefined,
        });
      }
    } else if (yaxis.length > 1) {
      for (ax of yaxis) {
        lines.push({
          y: plotdata[0][ax],
          x: plotdata[0][xaxis[0]],
          z: undefined,
        });
      }
    }
    return lines;
  };

  relabelDataObject = (plotdata) => {
    var data = [];
    for (var i = 0; i < plotdata.length; i++) {
      var keys = Object.keys(plotdata[i]);
      data.push({
        x: plotdata[i][keys.filter((k) => k.includes("x"))[0]],
        y: plotdata[i][keys.filter((k) => k.includes("y"))[0]],
        z: plotdata[i][keys.filter((k) => k.includes("z"))[0]],
      });
    }
    return data;
  };

  joinLinegraphData(plotdata, xaxis, yaxis, timeaxis) {
    var ax;
    var data = [];
    var axis = [].concat.apply([], [xaxis, yaxis]);
    for (var i = 0; i < plotdata.length; i++) {
      for (var j = 0; j < plotdata[i][xaxis[0]].length; j++) {
        var pd = {};
        for (ax of axis) {
          pd[ax] = plotdata[i][ax][j];
        }
        data.push(pd);
      }
    }
    if (timeaxis === "x") {
      data.sort((a, b) =>
        a[xaxis[0]] > b[xaxis[0]] ? 1 : b[xaxis[0]] > a[xaxis[0]] ? -1 : 0
      );
      data = data.filter((d) => d[xaxis] !== null);
    } else if (timeaxis === "y") {
      data.sort((a, b) =>
        a[yaxis[0]] > b[yaxis[0]] ? 1 : b[yaxis[0]] > a[yaxis[0]] ? -1 : 0
      );
      data = data.filter((d) => d[yaxis] !== null);
    }
    var out = { z: undefined };
    for (ax of axis) {
      out[ax] = [];
    }
    for (var k = 0; k < data.length; k++) {
      for (ax of axis) {
        out[ax].push(data[k][ax]);
      }
    }
    return [out];
  }

  joinHeatmapData(data, xaxis, yaxis, zaxis) {
    if (data.length > 1) {
      if (
        data.every(
          (d) =>
            JSON.stringify(d[yaxis[0]]) === JSON.stringify(data[0][yaxis[0]])
        )
      ) {
        var dataJoined = JSON.parse(JSON.stringify(data[0]));
        for (let i = 1; i < data.length; i++) {
          if (
            data[i][xaxis[0]].length === data[i][zaxis][0].length &&
            data[i][yaxis[0]].length === data[i][zaxis].length
          ) {
            let minB = Math.min(...data[i - 1][xaxis[0]]);
            let maxB = Math.max(...data[i - 1][xaxis[0]]);
            let minA = Math.min(...data[i][xaxis[0]]);
            let maxA = Math.max(...data[i][xaxis[0]]);
            if (minA > maxB) {
              dataJoined[xaxis[0]] = dataJoined[xaxis[0]].concat(
                data[i][xaxis[0]]
              );
              dataJoined[zaxis] = dataJoined[zaxis].map((d, index) =>
                d.concat(data[i][zaxis][index])
              );
            } else if (minB > maxA) {
              dataJoined[xaxis[0]] = data[i][xaxis[0]].concat(
                dataJoined[xaxis[0]]
              );
              dataJoined[zaxis] = data[i][zaxis].map((d, index) =>
                d.concat(dataJoined[zaxis][index])
              );
            } else {
              return data;
            }
          }
        }
        return [dataJoined];
      }
    }
    return data;
  }

  roundFactor = (dt, factor) => {
    var year = dt.getFullYear();
    var month = dt.getMonth();
    var day = dt.getDate();
    var hours = dt.getHours();
    if (factor === "Hourly") {
      return new Date(year, month, day, hours);
    } else if (factor === "Daily") {
      return new Date(year, month, day);
    } else if (factor === "Monthly") {
      return new Date(year, month, 0);
    } else if (factor === "Yearly") {
      return new Date(year, 0, 0);
    } else {
      return dt;
    }
  };

  average1D = (arr, factor, tx) => {
    var ox = "y";
    if (tx === "y") ox = "x";
    var data = {};
    var value;
    for (var i = 0; i < arr[tx].length; i++) {
      value = this.roundFactor(arr[tx][i], factor).getTime();
      if (value in data) {
        data[value].push(arr[ox][i]);
      } else {
        data[value] = [arr[ox][i]];
      }
    }
    var arrDict = [];
    for (var key in data) {
      arrDict.push({
        [tx]: new Date(parseInt(key)),
        [ox]: this.average(data[key]),
      });
    }
    arrDict.sort((a, b) => (a[tx] > b[tx] ? 1 : b[tx] > a[tx] ? -1 : 0));
    var x = [];
    var y = [];
    for (var k = 0; k < arrDict.length; k++) {
      x.push(arrDict[k].x);
      y.push(arrDict[k].y);
    }
    return { x, y, z: undefined };
  };

  average2D = (arr, factor, tx, bounds) => {
    var ox = "y";
    var data = {};
    var arrDict = [];
    var value, x, y, z;
    if (tx === "x") {
      for (let i = 0; i < arr[tx].length; i++) {
        value = this.roundFactor(arr[tx][i], factor).getTime();
        if (value in data) {
          for (let j = 0; j < arr[ox].length; j++) {
            data[value][j].push(arr.z[j][i]);
          }
        } else {
          data[value] = [];
          for (let j = 0; j < arr[ox].length; j++) {
            data[value].push([arr.z[j][i]]);
          }
        }
      }
      for (let key in data) {
        arrDict.push({
          [tx]: new Date(parseInt(key)),
          z: data[key].map((d) => this.average(d)),
        });
      }
      arrDict.sort((a, b) => (a[tx] > b[tx] ? 1 : b[tx] > a[tx] ? -1 : 0));
      x = [];
      y = arr[ox];
      z = [...Array(y.length)].map((x) => []);
      for (let i = 0; i < arrDict.length; i++) {
        x.push(arrDict[i].x);
        for (let j = 0; j < arr[ox].length; j++) {
          z[j].push(arrDict[i].z[j]);
        }
      }
      return { x, y, z };
    } else if (tx === "y") {
      ox = "x";
      for (let i = 0; i < arr[tx].length; i++) {
        value = this.roundFactor(arr[tx][i], factor).getTime();
        if (value in data) {
          data[value].push(arr.z[i]);
        } else {
          data[value] = [arr.z[i]];
        }
      }
      for (let key in data) {
        let zz = [];
        for (let i = 0; i < arr[ox].length; i++) {
          let zt = [];
          for (let j = 0; j < data[key].length; j++) {
            zt.push(data[key][j][i]);
          }
          zz.push(this.average(zt));
        }
        arrDict.push({
          [tx]: new Date(parseInt(key)),
          z: zz,
        });
      }
      arrDict.sort((a, b) => (a[tx] > b[tx] ? 1 : b[tx] > a[tx] ? -1 : 0));
      x = arr[ox];
      y = [];
      z = [];
      for (let i = 0; i < arrDict.length; i++) {
        y.push(arrDict[i].y);
        z.push(arrDict[i].z);
      }
      return { x, y, z };
    } else {
      return arr;
    }
  };

  averageData = (plotdata, timeaxis, average, graph, bounds) => {
    var out;
    if ((plotdata && ["x", "y"].includes(timeaxis), average !== "None")) {
      if (graph === "linegraph") {
        if (Array.isArray(plotdata)) {
          out = [];
          for (let i = 0; i < plotdata.length; i++) {
            out.push(this.average1D(plotdata[i], average, timeaxis));
          }
        } else {
          out = this.average1D(plotdata, average, timeaxis);
        }
        return out;
      } else if (graph === "heatmap") {
        if (Array.isArray(plotdata)) {
          out = [];
          for (let i = 0; i < plotdata.length; i++) {
            out.push(this.average2D(plotdata[i], average, timeaxis, bounds));
          }
        } else {
          out = this.average2D(plotdata, average, timeaxis, bounds);
        }
        return out;
      } else {
        return plotdata;
      }
    } else {
      return plotdata;
    }
  };

  decimate1D = (arr, factor) => {
    var x = [];
    var y = [];
    for (let i = 0; i < arr.x.length; i = i + factor) {
      if (arr.x[i]) {
        x.push(arr.x[i]);
        y.push(arr.y[i]);
      }
    }
    return { x, y, z: undefined };
  };

  decimate2D = (arr, factor, timeaxis) => {
    var x, y, z;
    if (timeaxis === "x") {
      y = arr.y;
      x = [];
      z = [...Array(arr.y.length)].map((x) => []);
      for (let i = 0; i < arr.x.length; i = i + factor) {
        if (arr.x[i]) {
          x.push(arr.x[i]);
          for (let j = 0; j < arr.y.length; j++) {
            z[j].push(arr.z[j][i]);
          }
        }
      }
      return { x, y, z };
    } else if (timeaxis === "y") {
      x = arr.x;
      y = [];
      z = [];
      for (let i = 0; i < arr.y.length; i = i + factor) {
        if (arr.y[i]) {
          y.push(arr.y[i]);
          z.push(arr.z[i]);
        }
      }
      return { x, y, z };
    } else {
      return arr;
    }
  };

  decimateData = (plotdata, timeaxis, decimate, graph) => {
    var out;
    if (decimate > 1 && isInteger(decimate) && plotdata) {
      if (graph === "linegraph") {
        if (Array.isArray(plotdata)) {
          out = [];
          for (let i = 0; i < plotdata.length; i++) {
            out.push(this.decimate1D(plotdata[i], decimate));
          }
        } else {
          out = this.decimate1D(plotdata, decimate);
        }
        return out;
      } else if (graph === "heatmap") {
        if (Array.isArray(plotdata)) {
          out = [];
          for (let i = 0; i < plotdata.length; i++) {
            out.push(this.decimate2D(plotdata[i], decimate, timeaxis));
          }
        } else {
          out = this.decimate2D(plotdata, decimate, timeaxis);
        }
        return out;
      } else {
        return plotdata;
      }
    } else {
      return plotdata;
    }
  };

  sliceXArray = (data, lower, upper) => {
    var y = data.y;
    var x = [];
    var z = [];
    var mask = [];
    if (data.z && data.y) {
      for (var i = 0; i < data.x.length; i++) {
        if (data.x[i] >= lower && data.x[i] <= upper) {
          x.push(data.x[i]);
          mask.push(true);
        } else {
          mask.push(false);
        }
      }
      for (var j = 0; j < data.y.length; j++) {
        z.push(data.z[j].filter((item, i) => mask[i]));
      }
    }
    if (x.length > 0) {
      return { x: x, y: y, z: z };
    } else {
      return false;
    }
  };

  sliceYArray = (data, lower, upper) => {
    var x = data.x;
    var y = [];
    var z = [];
    if (data.z && data.y) {
      for (var i = 0; i < data.y.length; i++) {
        if (data.y[i] >= lower && data.y[i] <= upper) {
          y.push(data.y[i]);
          z.push(data.z[i]);
        }
      }
    }
    if (y.length > 0) {
      return { x: x, y: y, z: z };
    } else {
      return false;
    }
  };

  sliceXYArray = (
    data,
    lowerX,
    upperX,
    lowerY,
    upperY,
    minX,
    maxX,
    minY,
    maxY
  ) => {
    var x = [];
    var y = [];
    if (upperX < maxX || lowerX > minX) {
      for (let i = 0; i < data.x.length; i++) {
        if (data.x[i] >= lowerX && data.x[i] <= upperX) {
          x.push(data.x[i]);
          y.push(data.y[i]);
        }
      }
    } else {
      x = data.x;
      y = data.y;
    }
    var d = { x, y };
    x = [];
    y = [];
    if (upperY < maxY || lowerY > minY) {
      for (let i = 0; i < d.y.length; i++) {
        if (d.y[i] >= lowerY && d.y[i] <= upperY) {
          x.push(d.x[i]);
          y.push(d.y[i]);
        }
      }
    } else {
      x = d.x;
      y = d.y;
    }
    return { x, y, z: undefined };
  };

  sliceData = (
    plotdata,
    graph,
    upperX,
    lowerX,
    upperY,
    lowerY,
    minX,
    maxX,
    minY,
    maxY,
    connect
  ) => {
    if (graph === "linegraph") {
      if (Array.isArray(plotdata)) {
        var dataout = [];
        for (let i = 0; i < plotdata.length; i++) {
          let slice = this.sliceXYArray(
            plotdata[i],
            lowerX,
            upperX,
            lowerY,
            upperY,
            minX,
            maxX,
            minY,
            maxY
          );
          if (slice) dataout.push(slice);
        }
        plotdata = dataout;
      } else {
        plotdata = this.sliceXYArray(
          plotdata,
          lowerX,
          upperX,
          lowerY,
          upperY,
          minX,
          maxX,
          minY,
          maxY
        );
      }
      return plotdata;
    } else if (graph === "heatmap") {
      if (upperX < maxX || lowerX > minX) {
        if (Array.isArray(plotdata)) {
          var dataoutX = [];
          for (let i = 0; i < plotdata.length; i++) {
            let slice = this.sliceXArray(plotdata[i], lowerX, upperX);
            if (slice) dataoutX.push(slice);
          }
          plotdata = dataoutX;
        } else {
          plotdata = this.sliceXArray(plotdata, lowerX, upperX);
        }
      }
      if (upperY < maxY || lowerY > minY) {
        if (Array.isArray(plotdata)) {
          var dataoutY = [];
          for (let i = 0; i < plotdata.length; i++) {
            let slice = this.sliceYArray(plotdata[i], lowerY, upperY);
            if (slice) dataoutY.push(slice);
          }
          plotdata = dataoutY;
        } else {
          plotdata = this.sliceYArray(plotdata, lowerY, upperY);
        }
      }
      return plotdata;
    } else {
      return plotdata;
    }
  };

  addGaps = (obj, timeaxis, gap) => {
    if (timeaxis === "x" && obj) {
      if (!Array.isArray(obj)) obj = [obj];
      for (let i = 0; i < obj.length; i++) {
        for (let j = 1; j < obj[i].x.length; j++) {
          if (
            obj[i].x[j].getTime() - obj[i].x[j - 1].getTime() >
            gap * 60 * 60 * 1000
          ) {
            obj[i].x.splice(
              j,
              0,
              new Date(obj[i].x[j - 1].getTime() + 60 * 1000)
            );
            obj[i].z.map((z) => z.splice(j, 0, null));
            obj[i].x.splice(
              j + 1,
              0,
              new Date(obj[i].x[j + 1].getTime() - 60 * 1000)
            );
            obj[i].z.map((z) => z.splice(j + 1, 0, null));
            j = j + 2;
          }
        }
      }
      return obj;
    } else if (timeaxis === "y" && obj) {
      if (!Array.isArray(obj)) obj = [obj];
      for (let i = 0; i < obj.length; i++) {
        for (let j = 1; j < obj[i].y.length; j++) {
          if (
            obj[i].y[j].getTime() - obj[i].y[j - 1].getTime() >
            gap * 60 * 60 * 1000
          ) {
            obj[i].y.splice(
              j,
              0,
              new Date(obj[i].y[j - 1].getTime() + 60 * 1000)
            );
            obj[i].z.splice(j, 0, Array(obj[i].x.length).fill(null));
            obj[i].y.splice(
              j + 1,
              0,
              new Date(obj[i].y[j + 1].getTime() - 60 * 1000)
            );
            obj[i].z.splice(j, 0, Array(obj[i].x.length).fill(null));
            j = j + 2;
          }
        }
      }
      return obj;
    } else {
      return obj;
    }
  };

  processPlotData = (
    xaxis,
    yaxis,
    zaxis,
    upperY,
    lowerY,
    maxY,
    minY,
    upperX,
    lowerX,
    minX,
    maxX,
    decimate,
    average,
    datasetparameters,
    timeaxis,
    graph,
    interpolate
  ) => {
    var { mask, gap } = this.state;
    var { data, files, file, maintenance } = this.props;

    var plotdata = this.selectAxisAndMask(
      data,
      files,
      file,
      xaxis,
      yaxis,
      zaxis,
      datasetparameters,
      mask,
      timeaxis,
      maintenance,
      graph
    );

    var { minZ: lowerZ, maxZ: upperZ } = this.getZBounds(plotdata);

    plotdata = this.joinData(
      plotdata,
      graph,
      xaxis,
      yaxis,
      zaxis,
      files[file[0]].connect,
      timeaxis
    );

    try {
      plotdata = this.sliceData(
        plotdata,
        graph,
        upperX,
        lowerX,
        upperY,
        lowerY,
        minX,
        maxX,
        minY,
        maxY,
        files[file[0]].connect
      );
    } catch (e) {
      console.error(e);
    }

    try {
      plotdata = this.decimateData(plotdata, timeaxis, decimate, graph);
    } catch (e) {
      console.error(e);
    }
    try {
      plotdata = this.formatTime(
        plotdata,
        datasetparameters,
        xaxis[0],
        yaxis[0]
      );
      try {
        plotdata = this.averageData(plotdata, timeaxis, average, graph, {
          lowerX,
          lowerY,
          upperX,
          upperY,
        });
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
    }

    try {
      plotdata = this.addGaps(plotdata, timeaxis, gap);
    } catch (e) {
      console.error(e);
    }

    try {
      plotdata = this.interpolate2D(plotdata, interpolate, graph);
    } catch (e) {
      console.error(e);
    }

    return { plotdata, lowerZ, upperZ };
  };

  interpolate2D = (obj, interpolate, graph) => {
    if (graph === "heatmap" && interpolate !== "none") {
      if (!Array.isArray(obj)) obj = [obj];
      for (let i = 0; i < obj.length; i++) {
        obj[i] = interp2(obj[i].x, obj[i].y, obj[i].z, interpolate);
      }
    }
    return obj;
  };

  filterData = (arr) => {
    if (Array.isArray(arr)) {
      var data = [];
      for (let i = 0; i < arr.length; i++) {
        if (!isNaN(parseFloat(arr[i])) && isFinite(arr[i])) {
          data.push(arr[i]);
        }
      }
      return arr;
    } else {
      return [];
    }
  };

  getInitialBounds = (dataset, data, file, xaxis, yaxis, zaxis) => {
    var { maxdatetime, mindatetime, datasetparameters } = this.props;
    var timeaxis = "x";
    if (
      datasetparameters
        .filter((dp) => dp.axis.includes("y"))
        .map((d) => d.parameters_id)
        .includes(1)
    )
      timeaxis = "y";
    if (datasetparameters.map((d) => d.axis).includes("M")) timeaxis = "M";

    const title = dataset.title;
    var colors = this.parseColor(dataset.plotproperties.colors);
    var zdomain = d3.extent(this.filterData(data[file[0]][zaxis]).flat());

    var yextents = [];
    for (var ya of yaxis) {
      yextents = yextents.concat(d3.extent(this.filterData(data[file[0]][ya])));
    }
    var ydomain = d3.extent(yextents);

    var xextents = [];
    for (var xa of xaxis) {
      xextents = xextents.concat(d3.extent(this.filterData(data[file[0]][xa])));
    }
    var xdomain = d3.extent(xextents);

    var minZ = zdomain[0] || 0;
    var maxZ = zdomain[1] || 1;
    var minY = ydomain[0];
    var maxY = ydomain[1];
    var minX = xdomain[0];
    var maxX = xdomain[1];
    var lowerY = minY;
    var upperY = maxY;
    var lowerX = minX;
    var upperX = maxX;
    var lowerZ = minZ;
    var upperZ = maxZ;
    if (timeaxis === "x" && maxdatetime && mindatetime) {
      minX = Math.min(minX, mindatetime);
      maxX = Math.max(maxX, maxdatetime);
    }

    if (timeaxis === "y" && maxdatetime && mindatetime) {
      minY = Math.min(minY, mindatetime);
      maxY = Math.max(maxY, maxdatetime);
    }

    return {
      title,
      colors,
      minZ,
      maxZ,
      minY,
      maxY,
      minX,
      maxX,
      lowerY,
      upperY,
      lowerX,
      upperX,
      lowerZ,
      upperZ,
      timeaxis,
    };
  };

  getZBounds = (plotdata) => {
    var minZ = Infinity;
    var maxZ = -Infinity;
    var pd = plotdata;
    if (!isArray(plotdata)) {
      pd = [pd];
    }
    for (var i = 0; i < pd.length; i++) {
      let zdomain = d3.extent(this.filterData(pd[i].z).flat());
      minZ = Math.min(zdomain[0], minZ);
      maxZ = Math.max(zdomain[1], maxZ);
    }
    return { minZ, maxZ };
  };

  getBounds = (data, xaxis, yaxis, timeaxis) => {
    var { maxdatetime, mindatetime } = this.props;
    var minX = Infinity;
    var maxX = -Infinity;
    var minY = Infinity;
    var maxY = -Infinity;
    for (var i = 0; i < data.length; i++) {
      if (data[i] !== 0) {
        let xdomain = d3.extent(this.filterData(data[i][xaxis]));
        let ydomain = d3.extent(this.filterData(data[i][yaxis]));
        minX = Math.min(xdomain[0], minX);
        maxX = Math.max(xdomain[1], maxX);
        minY = Math.min(ydomain[0], minY);
        maxY = Math.max(ydomain[1], maxY);
      }
    }

    if (timeaxis === "x" && maxdatetime && mindatetime) {
      minX = Math.min(minX, mindatetime);
      maxX = Math.max(maxX, maxdatetime);
    }

    if (timeaxis === "y" && maxdatetime && mindatetime) {
      minY = Math.min(minY, mindatetime);
      maxY = Math.max(maxY, maxdatetime);
    }

    return { minX, maxX, minY, maxY };
  };

  processUrlAxis = (url, datasetparameters, xaxis, yaxis, zaxis) => {
    var search = url.replace("?", "").split("&");
    var validAxis = datasetparameters.map((d) => d.axis);
    for (let s of search) {
      if (s.includes("axis")) {
        try {
          var xxaxis = [];
          var yyaxis = [];
          let axis = s
            .replace("axis:[", "")
            .replace("axis:(", "")
            .replace("axis:%5B", "")
            .replace("axis:%5b", "")
            .replace("]", "")
            .replace(")", "")
            .replace("%5D", "")
            .replace("%5d", "")
            .split(",");
          for (let a of axis) {
            if (validAxis.includes(a)) {
              if (a.includes("x")) xxaxis.push(a);
              if (a.includes("y")) yyaxis.push(a);
              if (a.includes("z")) zaxis = a;
            }
          }
          xaxis = xxaxis;
          yaxis = yyaxis;
        } catch (e) {
          console.error("Failed to parse axis from url");
        }
      }
    }
    return { xaxis, yaxis, zaxis };
  };

  processUrlBounds = (url, lowerX, upperX) => {
    if (url.includes("&latest")) {
      let newLower = upperX - 7 * 24 * 60 * 60;
      if (newLower > lowerX) lowerX = newLower;
    }
    return { lowerX, upperX };
  };

  componentDidMount() {
    var { datasetparameters, dataset, file, data } = this.props;
    var {
      xaxis,
      yaxis,
      zaxis,
      decimate,
      average,
      display,
      thresholdStep,
      withEvents,
      plotdots,
      interpolate,
    } = this.state;

    if (data[0] === false) {
      this.setState({ failed: true });
    } else {
      ({ xaxis, yaxis, zaxis } = this.processUrlAxis(
        this.props.search,
        datasetparameters,
        xaxis,
        yaxis,
        zaxis
      ));

      var { xoptions, yoptions, zoptions, graph, yReverse, xReverse } =
        this.setAxisOptions(datasetparameters, xaxis, yaxis);

      var { xlabel, ylabel, zlabel, xunits, yunits, zunits } =
        this.getAxisLabels(datasetparameters, xaxis, yaxis, zaxis);

      var {
        title,
        colors,
        minY,
        maxY,
        minX,
        maxX,
        minZ,
        maxZ,
        lowerY,
        upperY,
        lowerX,
        upperX,
        timeaxis,
      } = this.getInitialBounds(dataset, data, file, xaxis, yaxis, zaxis);

      ({ lowerX, upperX } = this.processUrlBounds(
        this.props.search,
        lowerX,
        upperX
      ));

      if ("interpolate" in dataset.plotproperties)
        interpolate = dataset.plotproperties.interpolate;

      var { plotdata, lowerZ, upperZ } = this.processPlotData(
        xaxis,
        yaxis,
        zaxis,
        upperY,
        lowerY,
        maxY,
        minY,
        upperX,
        lowerX,
        minX,
        maxX,
        decimate,
        average,
        datasetparameters,
        timeaxis,
        graph,
        interpolate
      );

      if ("display" in dataset.plotproperties)
        display = dataset.plotproperties.display;
      if ("thresholdStep" in dataset.plotproperties)
        thresholdStep = dataset.plotproperties.thresholdStep;
      if (plotdata[0].x.length < 100) plotdots = true;

      this.setState({
        plotdata,
        xaxis,
        yaxis,
        zaxis,
        xoptions,
        yoptions,
        zoptions,
        graph,
        xlabel,
        ylabel,
        zlabel,
        xunits,
        yunits,
        zunits,
        yReverse,
        xReverse,
        title,
        colors,
        minZ,
        maxZ,
        minY,
        maxY,
        minX,
        maxX,
        lowerY,
        upperY,
        lowerX,
        upperX,
        lowerZ,
        upperZ,
        timeaxis,
        display,
        thresholdStep,
        plotdots,
        interpolate,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    var {
      refresh,
      timeaxis,
      upperY,
      lowerY,
      upperX,
      lowerX,
      lowerZ,
      upperZ,
      xaxis,
      yaxis,
      zaxis,
      graph,
      minZ,
      maxZ,
    } = this.state;
    if (refresh || this.props.fileChange !== prevProps.fileChange) {
      var { minX, maxX, minY, maxY } = this.getBounds(
        this.props.data,
        xaxis,
        yaxis,
        timeaxis
      );
      if (prevState.minY === prevState.lowerY && prevState.lowerY === lowerY)
        lowerY = minY;
      if (prevState.maxY === prevState.upperY && prevState.upperY === upperY)
        upperY = maxY;
      if (prevState.minX === prevState.lowerX && prevState.lowerX === lowerX)
        lowerX = minX;
      if (prevState.maxX === prevState.upperX && prevState.upperX === upperX)
        upperX = maxX;

      var { plotdata } = this.processPlotData(
        xaxis,
        yaxis,
        zaxis,
        upperY,
        lowerY,
        maxY,
        minY,
        upperX,
        lowerX,
        minX,
        maxX,
        this.state.decimate,
        this.state.average,
        this.props.datasetparameters,
        timeaxis,
        graph,
        this.state.interpolate
      );

      if (refresh !== "z") {
        if (minZ === lowerZ || maxZ === upperZ) {
          ({ minZ, maxZ } = this.getZBounds(plotdata));
          upperZ = maxZ;
          lowerZ = minZ;
        } else {
          ({ minZ, maxZ } = this.getZBounds(plotdata));
        }
      }

      this.setState({
        plotdata,
        refresh: false,
        minZ,
        maxZ,
        minX,
        maxX,
        minY,
        maxY,
        upperX,
        upperY,
        upperZ,
        lowerX,
        lowerY,
        lowerZ,
      });
    }
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="failed-download">
          <img src={Connect} alt="Disconnected" />
          Unable to download data from the Datalakes API.
          <div>
            <b>Please try refreshing the page or come back later.</b>
          </div>
        </div>
      );
    } else if (this.props.search.toLowerCase().includes("bafu")) {
      return (
        <React.Fragment>
          <div className="detailloading" id="detailloading">
            <Loading />
            Downloading extra files.
          </div>
          <Bafu {...this.state} {...this.props} onChangeX={this.onChangeX} />
        </React.Fragment>
      );
    } else if (this.props.search.toLowerCase().includes("display")) {
      return (
        <React.Fragment>
          <div className="detailloading" id="detailloading">
            <Loading />
            Downloading extra files.
          </div>
          <Display {...this.state} {...this.props} onChangeX={this.onChangeX} />
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <SidebarLayout
            sidebartitle="Plot Controls"
            wide={true}
            left={
              <React.Fragment>
                <div className="detailloading" id="detailloading">
                  <Loading />
                  Downloading extra files.
                </div>
                <div className="detailgraph">
                  <Graph {...this.state} {...this.props} />
                  {!this.props.iframe && (
                    <ReportIssue
                      id={this.props.dataset.id}
                      repositories_id={this.props.dataset.repositories_id}
                      ssh={this.props.dataset.ssh}
                      dataset={this.state.title}
                      datasetparameters={this.props.datasetparameters}
                    />
                  )}
                </div>
              </React.Fragment>
            }
            rightNoScroll={
              <Sidebar
                {...this.state}
                {...this.props}
                onChangeState={this.onChangeState}
                onChangeFile={this.onChangeFile}
                onChangeX={this.onChangeX}
                onChangeY={this.onChangeY}
                toggleAddNewFile={this.toggleAddNewFile}
                handleAxisSelect={this.handleAxisSelect}
                handleAxisAppend={this.handleAxisAppend}
              />
            }
          />
        </React.Fragment>
      );
    }
  }
}

export default Plot;
