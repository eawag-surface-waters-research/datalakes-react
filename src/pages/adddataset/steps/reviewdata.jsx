import React, { Component } from "react";
import DataSelect from "../../../components/dataselect/dataselect";
import AddDropdownItem from "../adddropdownitem";
import Loading from "../../../components/loading/loading";

class OrderArrows extends Component {
  state = {};
  render() {
    var { up, down, location } = this.props;
    return (
      <div className="orderarrows">
        {location !== "top" && <div onClick={up}>&#9650;</div>}
        {location !== "bottom" && <div onClick={down}>&#9660;</div>}
      </div>
    );
  }
}

class ReviewData extends Component {
  state = {
    modal: false,
    modalValue: "",
    loading: false,
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
    var { loading } = this.state;
    if (!loading) {
      this.setState({
        message:
          "Parsing data to JSON format. This might take a while for large files.",
        loading: true,
      });

      this.props.nextStep().catch((error) => {
        console.error(error, error.message);
        this.setState({
          message: error.message,
          loading: false,
        });
      });
    } else {
      console.error("Processing Running");
    }
  };

  handleDatasetIntercept = (input) => {
    var { handleDataset, resetFileConnect, fileconnect } = this.props;
    if (fileconnect !== "no") {
      resetFileConnect();
    }
    handleDataset(input);
  };

  toggleLive = () => {
    var value = "false";
    if (this.props.dataset.liveconnect === "false") value = "true";
    this.props.updateDataset("liveconnect", value);
  };

  toggleConnect = () => {
    var value = "time";
    if (this.props.dataset.liveconnect === "time") value = "no";
    this.props.updateDataset("fileconnect", value);
  };

  prevStep = (e) => {
    e.preventDefault();
    this.props.prevStep();
  };

  listMatch = (l1, l2) => {
    for (let i of l1) {
      if (l2.includes(i.toLowerCase())) {
        return i;
      }
    }
    return false;
  };

  dpfilter = (datasetparameters, pid) => {
    return datasetparameters.filter((dp) => dp.parameters_id !== pid);
  };

  render() {
    const {
      dropdown,
      getDropdowns,
      datasetparameters,
      handleChange,
      handleCheck,
      handleSelect,
      liveconnect,
      fileconnect,
      moveParameterUp,
      moveParameterDown,
    } = this.props;
    const { parameters, sensors } = dropdown;
    var { modal, modalValue, message, loading } = this.state;

    // Create dynamic table
    var errorids = [27, 28, 29, 30];
    var rows = [];
    var i = 0;
    for (var row of datasetparameters) {
      var link = <div></div>;
      if (errorids.includes(row.parameters_id)) {
        var ids = this.dpfilter(datasetparameters, row.parameters_id);
        var list = ids.map((i) => {
          return { id: i.id, name: i.id };
        });
        link = (
          <DataSelect
            table="parameters"
            value="id"
            label="name"
            defaultValue={row.link}
            dataList={list}
            onChange={handleSelect(i, "link")}
          />
        );
      }
      var location = "";
      if (i === 0) location = "top";
      if (i === datasetparameters.length - 1) location = "bottom";
      let temp_id = i;
      rows.push(
        <tr key={"row" + i}>
          <td>
            <OrderArrows
              up={() => moveParameterUp(temp_id)}
              down={() => moveParameterDown(temp_id)}
              location={location}
            />
          </td>
          <td>{row.id}</td>
          <td>{row.parseparameter}</td>
          <td>{row.parseUnit}</td>
          <td>{"[" + row.dims.map((d) => d.name).join(", ") + "]"}</td>
          <td>
            <DataSelect
              table="parameters"
              value="id"
              label="name"
              dataList={parameters}
              defaultValue={row.parameters_id}
              onChange={handleSelect(i, "parameters_id")}
              showModal={this.showModal}
            />
          </td>
          <td>
            <DataSelect
              value="name"
              label="name"
              dataList={row.axis_list}
              defaultValue={row.axis}
              onChange={handleSelect(i, "axis")}
            />
          </td>
          <td>{link}</td>
          <td>
            <input
              value={row.detail}
              type="text"
              onChange={handleChange(i, "detail")}
            />
          </td>
          <td>
            <input
              type="text"
              name="unit"
              value={row.unit}
              onChange={handleChange(i, "unit")}
            />
          </td>
          <td>
            <DataSelect
              table="sensors"
              value="id"
              label="name"
              dataList={sensors}
              defaultValue={row.sensors_id}
              onChange={handleSelect(i, "sensors_id")}
              showModal={this.showModal}
            />
          </td>
          <td>
            <input
              type="checkbox"
              defaultChecked={row.included}
              onChange={handleCheck(i, "included")}
            ></input>
          </td>
        </tr>
      );
      i++;
    }

    // Modal data
    const modalInfo = { parameters: parameters, sensors: sensors };

    // Loading message when parsing data
    if (message !== "") {
      var userMessage = (
        <div className="loading">
          {loading && <Loading />}
          <div id="reviewdata-message">{message}</div>
        </div>
      );
    }

    return (
      <React.Fragment>
        <form className="adddataset-form" onSubmit={this.nextStep}>
          <div className="lineage-text">
            Review the file autoparse to ensure that the file axis and
            parameters are correct.
          </div>
          <div className="file-connection">
            <label className="switch">
              <input
                type="checkbox"
                onChange={this.toggleConnect}
                checked={fileconnect === "time"}
              />
              <span className="slider round"></span>
            </label>
            Connect files along the time axis.
          </div>
          <div className="repo-connection">
            <label className="switch">
              <input
                type="checkbox"
                onChange={this.toggleLive}
                checked={liveconnect === "true"}
              />
              <span className="slider round"></span>
            </label>
            Live connection
          </div>
          <table className="datareview">
            <tbody>
              <tr>
                <td></td>
                <th colSpan="4">Read from file</th>
                <th colSpan="7">Check and adjust auto-parse</th>
              </tr>
              <tr>
                <td style={{ width: "15px" }}></td>
                <th style={{ width: "15px" }}>ID</th>
                <th style={{ width: "120px" }}>Variable</th>
                <th style={{ width: "120px" }}>Units</th>
                <th style={{ width: "220px" }}>Dimensions</th>
                <th style={{ width: "calc(33.33% - 55px)" }}>Parameter</th>
                <th style={{ width: "55px" }}>Axis</th>
                <th style={{ width: "80px" }}>Link</th>
                <th>Extra Details</th>
                <th>Units</th>
                <th>Sensor</th>
                <th style={{ width: "15px" }}>
                  <div title="Include parameter.">Incl.</div>
                </th>
              </tr>
              {rows}
            </tbody>
          </table>
          <div className="error-message">{userMessage}</div>
          <div className="buttonnav">
            <button onClick={this.prevStep}>Back</button>
            <button onClick={this.nextStep}>Parse Data </button>
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

export default ReviewData;
