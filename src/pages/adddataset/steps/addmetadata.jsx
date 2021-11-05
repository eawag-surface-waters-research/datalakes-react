import React, { Component } from "react";
import DataSelect from "../../../components/dataselect/dataselect";
import AddDropdownItem from "../adddropdownitem";
import qm from "./img/qm.svg";

class AddMetadata extends Component {
  state = {
    modal: false,
    modalValue: "",
    message: "",
  };

  // Modal for adding to dropdown lists
  showModal = (value) => {
    this.setState({
      modal: !this.state.modal,
      modalValue: value,
    });
  };

  nextStep = (e) => {
    e.preventDefault();
    this.props.nextStep().catch((error) => {
      console.error(error.message);
      this.setState({
        message: error.message,
      });
    });
  };

  prevStep = (e) => {
    e.preventDefault();
    this.props.prevStep();
  };

  render() {
    const { dropdown, getDropdowns, dataset, handleChange, handleSelect } =
      this.props;
    const { lakes, persons, projects, organisations, licenses } = dropdown;
    const modalInfo = {
      persons: persons,
      projects: projects,
      lakes: lakes,
      organisations: organisations,
      licenses: licenses,
    };
    const { modal, modalValue, message } = this.state;
    return (
      <React.Fragment>
        <form className="adddataset-form" onSubmit={this.nextStep}>
          <table className="addmetadata">
            <tbody>
              <tr>
                <th>
                  Minimum Datetime
                  <a
                    href="https://www.unixtimestamp.com/"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <img
                      src={qm}
                      style={{ paddingLeft: "6px", height: "14px" }}
                      alt="Information on Unix Time"
                    />
                  </a>
                </th>
                <td>
                  {
                    <React.Fragment>
                      <input
                        type="number"
                        name="mindatetime"
                        placeholder="Seconds since 1970-01-01 00:00:00"
                        onChange={handleChange("mindatetime")}
                        value={
                          dataset["mindatetime"] !== -9999
                            ? dataset["mindatetime"]
                            : ""
                        }
                      />
                      <div>
                        {new Date(dataset["mindatetime"] * 1000).toString()}
                      </div>
                    </React.Fragment>
                  }
                </td>
              </tr>
              <tr>
                <th>
                  Maximum Datetime
                  <a
                    href="https://www.unixtimestamp.com/"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <img
                      src={qm}
                      style={{ paddingLeft: "6px", height: "14px" }}
                      alt="Information on Unix Time"
                    />
                  </a>
                </th>
                <td>
                  {
                    <React.Fragment>
                      <input
                        type="number"
                        name="maxdatetime"
                        placeholder="Seconds since 1970-01-01 00:00:00"
                        onChange={handleChange("maxdatetime")}
                        value={
                          dataset["maxdatetime"] !== -9999
                            ? dataset["maxdatetime"]
                            : ""
                        }
                      />
                      <div>
                        {new Date(dataset["maxdatetime"] * 1000).toString()}
                      </div>
                    </React.Fragment>
                  }
                </td>
              </tr>
              <tr>
                <th>Location</th>
                <td>
                  {
                    <input
                      type="number"
                      name="latitude"
                      style={{ width: "calc(50% - 3px)", marginRight: "3px" }}
                      placeholder="Latitude"
                      onChange={handleChange("latitude")}
                      value={
                        dataset["latitude"] !== -9999 ? dataset["latitude"] : ""
                      }
                    />
                  }
                  {
                    <input
                      type="number"
                      name="longitude"
                      style={{ width: "calc(50% - 3px)", marginLeft: "3px" }}
                      placeholder="Longitude"
                      onChange={handleChange("longitude")}
                      value={
                        dataset["longitude"] !== -9999
                          ? dataset["longitude"]
                          : ""
                      }
                    />
                  }
                </td>
              </tr>
              <tr>
                <th>Minimum Depth (m)</th>
                <td>
                  {
                    <input
                      type="number"
                      name="mindepth"
                      placeholder="Meters below lake surface"
                      onChange={handleChange("mindepth")}
                      value={
                        dataset["mindepth"] !== 0 ? dataset["mindepth"] : ""
                      }
                    />
                  }
                </td>
              </tr>
              <tr>
                <th>Maximum Depth (m)</th>
                <td>
                  {
                    <input
                      type="number"
                      name="maxdepth"
                      placeholder="Meters below lake surface"
                      onChange={handleChange("maxdepth")}
                      value={
                        dataset["maxdepth"] !== 0 ? dataset["maxdepth"] : ""
                      }
                    />
                  }
                </td>
              </tr>
              <tr>
                <th>Lake</th>
                <td>
                  <DataSelect
                    table="lakes"
                    value="id"
                    label="name"
                    dataList={lakes}
                    defaultValue={dataset["lakes_id"]}
                    onChange={handleSelect("lakes_id")}
                    showModal={this.showModal}
                  />
                </td>
              </tr>
              <tr>
                <th>Title</th>
                <td>
                  <input
                    type="text"
                    name="title"
                    defaultValue={dataset["title"]}
                    placeholder="Use a descriptive title to help others"
                    onChange={handleChange("title")}
                  />
                </td>
              </tr>
              <tr>
                <th>Description</th>
                <td>
                  <input
                    type="text"
                    name="description"
                    defaultValue={dataset["description"]}
                    placeholder="Add a description to help others"
                    onChange={handleChange("description")}
                  />
                </td>
              </tr>
              <tr>
                <th>Project</th>
                <td>
                  <DataSelect
                    table="projects"
                    value="id"
                    label="name"
                    dataList={projects}
                    defaultValue={dataset["projects_id"]}
                    onChange={handleSelect("projects_id")}
                    showModal={this.showModal}
                  />
                </td>
              </tr>

              <tr>
                <th>Person</th>
                <td>
                  <DataSelect
                    table="persons"
                    value="id"
                    label="name"
                    dataList={persons}
                    defaultValue={dataset["persons_id"]}
                    onChange={handleSelect("persons_id")}
                    showModal={this.showModal}
                  />
                </td>
              </tr>
              <tr>
                <th>Organisation</th>
                <td>
                  <DataSelect
                    table="organisations"
                    value="id"
                    label="name"
                    dataList={organisations}
                    defaultValue={dataset["organisations_id"]}
                    onChange={handleSelect("organisations_id")}
                    showModal={this.showModal}
                  />
                </td>
              </tr>
              <tr>
                <th>
                  License
                  <a
                    href="https://choosealicense.com/licenses/"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <img
                      src={qm}
                      style={{ paddingLeft: "6px", height: "14px" }}
                      alt="Information on licenses"
                    />
                  </a>
                </th>
                <td>
                  <DataSelect
                    table="licenses"
                    value="id"
                    label="name"
                    dataList={licenses}
                    defaultValue={dataset["licenses_id"]}
                    onChange={handleSelect("licenses_id")}
                    showModal={this.showModal}
                  />
                </td>
              </tr>
              <tr>
                <th>Citation</th>
                <td>
                  <input
                    type="text"
                    name="citation"
                    defaultValue={dataset["citation"]}
                    placeholder="How should others reference your data"
                    onChange={handleChange("citation")}
                  />
                </td>
              </tr>
              <tr>
                <th>Download Embargo (Months)</th>
                <td>
                  <input
                    type="text"
                    name="embargo"
                    defaultValue={dataset["embargo"]}
                    placeholder="How long should data be password protected"
                    onChange={handleChange("embargo")}
                  />
                </td>
              </tr>
              <tr>
                <th>Download Password</th>
                <td>
                  <input
                    type="text"
                    name="password"
                    defaultValue={dataset["password"]}
                    placeholder="Password"
                    onChange={handleChange("password")}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <div className="error-message">{message}</div>
          <div className="buttonnav">
            <button onClick={this.prevStep}>Back</button>
            <button onClick={this.nextStep}>Next </button>
          </div>
        </form>
        <AddDropdownItem
          show={modal}
          showModal={this.showModal}
          modalValue={modalValue}
          modalInfo={modalInfo}
          getDropdowns={getDropdowns}
        />
      </React.Fragment>
    );
  }
}

export default AddMetadata;
