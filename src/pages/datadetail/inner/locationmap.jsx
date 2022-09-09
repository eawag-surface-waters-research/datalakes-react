import React, { Component } from "react";
import SidebarLayout from "../../../format/sidebarlayout/sidebarlayout";
import SliderDouble from "../../../components/sliders/sliderdouble";
import FilterBox from "../../../components/filterbox/filterbox";
import MapSelect from "../../../graphs/leaflet/mapselect";
import "../css/datadetail.css";

class LocationMap extends Component {
  state = {
    lower: this.props.min,
    upper: this.props.max,
  };
  onChangeBounds = (event) => {
    let lower = event[0] / 1000;
    let upper = event[1] / 1000;
    if (lower !== this.state.lower || upper !== this.state.upper) {
      this.setState({ lower, upper });
    }
  };
  clickPoint = (event) => {
    var { onChangeFileInt } = this.props;
    onChangeFileInt(event.target.options.id);
  };
  onChangeLower = (event) => {
    let lower = event.getTime() / 1000;
    if (lower !== this.state.lower) {
      this.setState({ lower });
    }
  };
  onChangeUpper = (event) => {
    let upper = event.getTime() / 1000;
    if (upper !== this.state.upper) {
      this.setState({ upper });
    }
  };
  render() {
    var { files, file, removeFile, selectFilesDatetime, min, max } = this.props;
    var { lower, upper } = this.state;
    var plotfiles = files.map((f, index) => {
      f["fileid"] = index;
      return f;
    });
    plotfiles = plotfiles.filter((f) => f.mindt >= lower && f.maxdt <= upper);
    var filecontrol = [];
    if (files.length > 0) {
      for (let i = 0; i < file.length; i++) {
        let value = new Date(files[file[i]].ave);
        let text = value.toDateString() + " " + value.toLocaleTimeString();
        filecontrol.push(
          <tr key={"file" + file[i]}>
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

    return (
      <React.Fragment>
        <SidebarLayout
          sidebartitle="Plot Controls"
          wide={true}
          left={
            <React.Fragment>
              <MapSelect
                datasets={plotfiles}
                clickPoint={this.clickPoint}
                files={file}
              />
            </React.Fragment>
          }
          rightNoScroll={
            <React.Fragment>
              <FilterBox
                title="Selected Files"
                preopen="true"
                content={
                  <table className="filecontrol">
                    <tbody>{filecontrol}</tbody>
                  </table>
                }
              />
              <FilterBox
                title="Date Filter"
                preopen="true"
                content={
                  <div>
                    <SliderDouble
                      onChange={this.onChangeBounds}
                      onChangeLower={this.onChangeLower}
                      onChangeUpper={this.onChangeUpper}
                      min={min}
                      max={max}
                      lower={lower}
                      upper={upper}
                      files={files}
                    />
                    <button
                      onClick={() => selectFilesDatetime(plotfiles)}
                      title="Select all profiles in time period."
                    >
                      Select files
                    </button>
                    {plotfiles.length} profiles
                  </div>
                }
              />
            </React.Fragment>
          }
        />
      </React.Fragment>
    );
  }
}

export default LocationMap;
