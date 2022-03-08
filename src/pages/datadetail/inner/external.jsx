import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../css/datadetail.css";

class External extends Component {
  state = {};
  render() {
    const { dataset, datasetparameters, getLabel, link } = this.props;

    // Parameter Table
    var rows = [];
    for (var row of datasetparameters) {
      rows.push(
        <tr key={row.id}>
          <td>{getLabel("parameters", row.parameters_id, "name")}</td>
          <td>{row.axis}</td>
          <td>{row.unit}</td>
          <td>
            <a
              href={getLabel("sensors", row.sensors_id, "link")}
              target="_blank"
              rel="noopener noreferrer"
              title={getLabel("sensors", row.sensors_id, "manufacturer")}
            >
              {getLabel("sensors", row.sensors_id, "name")}
            </a>
          </td>
        </tr>
      );
    }

    return (
      <div className="information">
        <div className="datadetail-header">
          This in an external datasource. If you are intersted in previewing the
          data either view the dataset in the Web GIS or follow the link below
          to the origin dataset.
          <div>
            <Link to={link}>
              <button>Web GIS</button>
            </Link>
            <a href={dataset.datasourcelink}>
              <button>Dataset Source</button>
            </a>
          </div>
        </div>
        <div className="info-width">
          <div className="info-head">Parameters</div>
          <table>
            <tbody>
              <tr>
                <th>Parameter</th>
                <th>Axis</th>
                <th>Units</th>
                <th>Sensor</th>
              </tr>
              {rows}
            </tbody>
          </table>
        </div>
        <div className="info-inner">
          <div className="info-head">Properties</div>
          <table>
            <tbody>
              <tr>
                <th>Link</th>
                <td>
                  <a
                    href={dataset.datasourcelink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Link to data source
                  </a>
                </td>
              </tr>
              <tr>
                <th>Start</th>
                <td>{new Date(dataset.mindatetime).toString()}</td>
              </tr>
              <tr>
                <th>End</th>
                <td>{new Date(dataset.maxdatetime).toString()}</td>
              </tr>
              <tr>
                <th>Latitude</th>
                <td>{dataset.latitude === "-9999" ? "Variable" : dataset.latitude}</td>
              </tr>
              <tr>
                <th>Longitude</th>
                <td>{dataset.longitude === "-9999" ? "Variable" : dataset.longitude}</td>
              </tr>
              <tr>
                <th>Min Depth (m)</th>
                <td>
                  {dataset.mindepth === "-9999" ? "Variable" : dataset.mindepth}
                </td>
              </tr>
              <tr>
                <th>Max Depth (m)</th>
                <td>
                  {dataset.maxdepth === "-9999" ? "Variable" : dataset.maxdepth}
                </td>
              </tr>
              <tr>
                <th>Lake</th>
                <td>{getLabel("lakes", dataset.lakes_id, "name")}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="info-inner">
          <div className="info-head">Contact</div>
          <table>
            <tbody>
              <tr>
                <th>Name</th>
                <td>{getLabel("persons", dataset.persons_id, "name")}</td>
              </tr>
              <tr>
                <th>Email</th>
                <td>{getLabel("persons", dataset.persons_id, "email")}</td>
              </tr>
              <tr>
                <th>Organisation</th>
                <td>
                  {getLabel("organisations", dataset.organisations_id, "name")}
                </td>
              </tr>
              <tr>
                <th>Project</th>
                <td>{getLabel("projects", dataset.projects_id, "name")}</td>
              </tr>
              <tr>
                <th>License</th>
                <td>
                  <a
                    href={getLabel("licenses", dataset.licenses_id, "link")}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={getLabel(
                      "licenses",
                      dataset.licenses_id,
                      "description"
                    )}
                  >
                    {getLabel("licenses", dataset.licenses_id, "name")}
                  </a>
                </td>
              </tr>
              <tr>
                <th>Citation</th>
                <td>{dataset.citation}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default External;
