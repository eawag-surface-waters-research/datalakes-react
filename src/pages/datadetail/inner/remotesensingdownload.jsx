import React, { Component } from "react";
import "swagger-ui-react/swagger-ui.css";
import SwaggerUI from "swagger-ui-react";
import Calendar from "react-calendar";
import "../css/datadetail.css";

class RemoteSensingDownload extends Component {
  state = {
    start: new Date(),
    end: new Date(),
    selected_files: [],
  };

  onChangeRange = (value) => {
    var { files } = this.props;
    var start = value[0];
    var end = value[1];
    var selected_files = this.selectedFiles(files, start, end);
    this.setState({ start, end, selected_files });
  };

  selectedFiles = (files, start, end) => {
    var selected_files = files.filter(
      (f) => f.mindatetime >= start && f.maxdatetime <= end
    );
    selected_files = selected_files.map((sf) => {
      let path = sf.filelink.split("/");
      let name = path.pop().split(".")[0];
      let name_path = name.split("_");
      let len = name_path.length;
      sf.folder = path.join("/");
      sf.nc = `${sf.folder}/${name_path[0]}_${name_path[len - 2]}_${
        name_path[len - 1]
      }.nc`;
      sf.satellite = name_path[len - 2];
      return sf;
    });
    return selected_files;
  };

  async componentDidMount() {
    var { files } = this.props;
    files = files.map((f) => {
      f.maxdatetime = new Date(f.maxdatetime);
      f.mindatetime = new Date(f.mindatetime);
      return f;
    });

    var end = new Date(this.props.dataset.maxdatetime);
    var start = new Date(end.getTime() - 4 * 24 * 60 * 60 * 1000);

    var selected_files = this.selectedFiles(files, start, end);

    this.setState({
      start,
      end,
      files,
      selected_files,
    });
  }

  render() {
    const { getLabel, dataset } = this.props;
    var { start, end, selected_files } = this.state;
    var { mindatetime, maxdatetime } = dataset;
    mindatetime = new Date(mindatetime);
    maxdatetime = new Date(maxdatetime);

    var table_inner = [];
    for (var file of selected_files) {
      table_inner.push(
        <tr key={file.filelink}>
          <td>{file.satellite}</td>
          <td>
            {file.mindatetime.toLocaleTimeString() +
              " " +
              file.mindatetime.toLocaleDateString()}
          </td>
          <td title="Download JSON">
            <a href={file.filelink}>
              <button>JSON</button>
            </a>
          </td>
          <td title="Download NetCDF">
            <a href={file.nc}>
              <button>NetCDF</button>
            </a>
          </td>
        </tr>
      );
    }

    var git = "https://gitlab.com/eawag-rs/sencast";

    var url = "https://api.datalakes-eawag.ch/externaldata/remotesensing/";
    var swagger = url + "api";

    return (
      <div className="datadetail-padding">
        <div className="info-title">Licence</div>
        <a
          href={getLabel("licenses", dataset.licenses_id, "link")}
          title={getLabel("licenses", dataset.licenses_id, "description")}
        >
          {getLabel("licenses", dataset.licenses_id, "name")}
        </a>
        <div className="info-title">Citation</div>
        {dataset.citation}

        <div className="info-title">Git Repository</div>
        <a href={git} target="_blank" rel="noopener noreferrer">
          {git}
        </a>

        <div className="info-title">Available Data</div>
        <p>
          Data available from {mindatetime.toLocaleDateString()} to{" "}
          {maxdatetime.toLocaleDateString()}
        </p>

        <div className="info-title">Download</div>
        <div className="remotesensingdownload">
          <div className="downloadinner">
            <Calendar
              selectRange={true}
              minDate={mindatetime}
              maxDate={maxdatetime}
              value={[start, end]}
              onChange={this.onChangeRange}
            />
          </div>
          <div className="downloadinner">
            <table>
              <thead>
                <tr>
                  <th>Satellite</th>
                  <th>Datetime</th>
                  <th colSpan="2">Download</th>
                </tr>
              </thead>
              <tbody>{table_inner}</tbody>
            </table>
          </div>
        </div>
        <div className="info-title">API</div>

        <div className="api-meteolakes">
          [ Base URL: {url} ]
          <SwaggerUI url={swagger} />
        </div>
      </div>
    );
  }
}

export default RemoteSensingDownload;
