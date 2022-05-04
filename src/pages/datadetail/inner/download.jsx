import React, { Component } from "react";
import SliderDouble from "../../../components/sliders/sliderdouble";
import Loading from "../../../components/loading/loading";
import axios from "axios";
import "../css/datadetail.css";

class Download extends Component {
  state = {
    upper: this.props.max,
    lower: this.props.min,
    loading: false,
  };

  onChangeTime = (values) => {
    const lower = values[0] / 1000;
    const upper = values[1] / 1000;
    if (
      Math.round(lower) !== Math.round(this.state.lower) ||
      Math.round(upper) !== Math.round(this.state.upper)
    ) {
      this.setState({ lower, upper });
    }
  };

  onChangeUpper = (value) => {
    var upper = value.getTime() / 1000;
    this.setState({ upper });
  };

  onChangeLower = (value) => {
    var lower = value.getTime() / 1000;
    this.setState({ lower });
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
    const {
      getLabel,
      dataset,
      apiUrl,
      min,
      max,
      files,
      selectedFiles,
      datasetparameters,
    } = this.props;
    var { upper, lower, loading } = this.state;
    var csv =
      !/\d/.test(datasetparameters.map((dp) => dp.axis).join("")) ||
      !datasetparameters
        .map((dp) => dp.axis)
        .join("")
        .includes("z");
    var selectedArray = [0];
    if (files.length > 1) {
      selectedArray = selectedFiles(upper, lower, files, "download");
    }

    return (
      <div className="download">
        <div className="info-title">Licence</div>
        <a
          href={getLabel("licenses", dataset.licenses_id, "link")}
          title={getLabel("licenses", dataset.licenses_id, "description")}
        >
          {getLabel("licenses", dataset.licenses_id, "name")}
        </a>
        <div className="info-title">Citation</div>
        {dataset.citation}

        {dataset.embargo > 0 && (
          <div>
            <div className="info-title">Embargo Period</div>
            Data more recent than {dataset.embargo} months requires a password
            to download. <br />
            Please contact {getLabel("persons", dataset.persons_id, "email")} to
            request access to this data.
          </div>
        )}

        <div className="info-title">Download</div>

        <div className="multipledownload">
          {files.length > 1 && (
            <div>
              <div className="subheading">
                Select time period for downloads.
              </div>
              {loading && (
                <div className="download-loading">
                  Sending download request...
                  <Loading />
                </div>
              )}
              <SliderDouble
                onChange={this.onChangeTime}
                onChangeLower={this.onChangeLower}
                onChangeUpper={this.onChangeUpper}
                min={min}
                max={max}
                lower={lower}
                upper={upper}
                files={files}
              />
              <div className="selected-download">
                {selectedArray.length} of {files.length} files selected for
                download.
              </div>
            </div>
          )}

          <div className="subheading">Select file type for download.</div>
          <button
            onClick={() =>
              this.downloadFiles("nc", apiUrl, selectedArray, dataset.title)
            }
            className="download-button"
            title="Download datasets in NetCDF format"
          >
            NetCDF
          </button>
          <button
            onClick={() =>
              this.downloadFiles("json", apiUrl, selectedArray, dataset.title)
            }
            className="download-button"
            title="Download datasets in JSON format"
          >
            JSON
          </button>
          {csv && (
            <button
              onClick={() =>
                this.downloadFiles("csv", apiUrl, selectedArray, dataset.title)
              }
              className="download-button"
              title="Download datasets in CSV format"
            >
              CSV (Beta)
            </button>
          )}
        </div>
        <div className="info-title">Parse Data</div>
        <div className="parsedata">
          <p>
            Data is provided as a Zip file containing the files (in the format
            you have specified) for the selected time period.
          </p>
          <b>Date and Time</b>
          <p>
            Datetime is in Unix time format (
            <a
              href="https://www.unixtimestamp.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              details
            </a>
            ). Most languages have a function for parsing this format to a
            datetime object.
          </p>
          <table>
            <tbody>
              <tr>
                <th>Python</th>
                <td></td>
                <td>
                  from datetime import datetime <br /> dt =
                  datetime.utcfromtimestamp(unixdatetime)
                </td>
              </tr>
              <tr>
                <th>R</th>
                <td></td>
                <td>
                  library(anytime) <br /> dt {"<"}- anytime(unixdatetime)
                </td>
              </tr>
              <tr>
                <th>Javascript</th>
                <td></td>
                <td>var dt = new Date(unixdatetime * 1000)</td>
              </tr>
            </tbody>
          </table>
          <b>Reading from NetCDF</b>
          <p>
            There are a number of resources that give detailed information on
            how to read and interact with NetCDF files. Linked below are some
            suggested resources.
          </p>
          <table>
            <tbody>
              <tr>
                <th>Python</th>
                <td></td>
                <td>
                  <a
                    href="https://unidata.github.io/netcdf4-python/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://unidata.github.io/netcdf4-python/
                  </a>
                </td>
              </tr>
              <tr>
                <th>R</th>
                <td></td>
                <td>
                  <a
                    href="https://cran.r-project.org/web/packages/ncdf4/ncdf4.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://cran.r-project.org/web/packages/ncdf4/ncdf4.pdf
                  </a>
                </td>
              </tr>
              <tr>
                <th>Javascript</th>
                <td></td>
                <td>
                  <a
                    href="https://github.com/cheminfo/netcdfjs"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://github.com/cheminfo/netcdfjs
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
          <b>Reading from JSON</b>
          <p>
            JSON is the native format of Javascript, data is stored in this
            format to allow fast access to the data for visualistion on the web
            platform. Significantly more metadata is available in the NetCDF
            file. As with datetime, most languages have a native import function
            for JSON.
          </p>
        </div>
      </div>
    );
  }
}

export default Download;
