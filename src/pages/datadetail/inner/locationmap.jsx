import React, { Component } from "react";
import SidebarLayout from "../../../format/sidebarlayout/sidebarlayout";
import SliderDouble from "../../../components/sliders/sliderdouble";
import FilterBox from "../../../components/filterbox/filterbox";
import MapSelect from "../../../graphs/leaflet/mapselect";
import axios from "axios";
import "../css/datadetail.css";

class LocationMap extends Component {
  state = {
    lower: this.props.min,
    upper: this.props.max,
    loading: false,
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
  fileIdSelect = (arr, filetype) => {
    var { files } = this.props;
    var out = [];
    if (filetype === "nc") {
      for (var i = 0; i < arr.length; i++) {
        out.push(files[arr[i]].filelineage);
      }
    } else {
      for (i = 0; i < arr.length; i++) {
        out.push(files[arr[i]].id);
      }
    }

    return out;
  };
  downloadFiles = (filetype, apiUrl, arr, title) => {
    this.setState({ loading: true }, () => {
      arr = this.fileIdSelect(arr, filetype);
      var { embargo } = this.props.dataset;
      var { upper } = this.state;
      var embargoDate =
        new Date().getTime() - embargo * 30.4167 * 24 * 60 * 60 * 1000;
      var datasetpassword = "";
      if (upper * 1000 > embargoDate) {
        datasetpassword = prompt(
          "Selection contains embargoed data. (after " +
            new Date(embargoDate) +
            ") Please enter the password to download data."
        );
      }
      var url;
      if (filetype === "csv") {
        url = `${apiUrl}/download/csv?password=${datasetpassword}`;
      } else {
        url = `${apiUrl}/download?password=${datasetpassword}`;
      }
      var name =
        title.replace(/\s/g, "").toLowerCase() + "_datalakesdownload.zip";
      axios({
        method: "post",
        url: url,
        responseType: "blob",
        data: { ids: arr },
      })
        .then(({ data }) => {
          const downloadUrl = window.URL.createObjectURL(new Blob([data]));
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.setAttribute("download", name);
          document.body.appendChild(link);
          link.click();
          link.remove();
          this.setState({ loading: false });
        })
        .catch((error) => {
          console.error(error);
          this.setState({ loading: false });
          if (error.response !== undefined && error.response.status === 403) {
            alert("Incorrect password provided");
          } else {
            alert(
              "Failed to download files, please select fewer files or access data directly from the git repository (a link can be found under the information tab)."
            );
          }
        });
    });
  };
  render() {
    var {
      files,
      file,
      removeFile,
      selectFilesDatetime,
      min,
      max,
      dataset,
      apiUrl,
    } = this.props;
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
        let text = `${value.toDateString()} ${value.toLocaleTimeString()}`;
        let name = `(${files[file[i]].nc_name})`;
        filecontrol.push(
          <tr key={"filename" + file[i]}>
            <td>
              {text}
              <br />
              <span>{name}</span>
            </td>
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
                  <div className="mapfilecontrol">
                    <table className="filecontrol">
                      <tbody>{filecontrol}</tbody>
                    </table>
                    <button
                      onClick={() =>
                        this.downloadFiles(
                          "nc",
                          apiUrl,
                          file,
                          dataset.title
                        )
                      }
                      title="Download selected files."
                    >
                      {this.state.loading
                        ? "Downloading, please wait..."
                        : `Download ${filecontrol.length} NetCDF files`}
                    </button>
                  </div>
                }
              />
              <FilterBox
                title="Date Filter"
                preopen="true"
                content={
                  <div className="mapdatefilter">
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
                      className={plotfiles.length < 21 ? "" : "red"}
                    >
                      {plotfiles.length < 21
                        ? `Select ${plotfiles.length} profiles`
                        : `Reduce time range to select max 20 files (currently ${plotfiles.length} files in time range)`}
                    </button>
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
