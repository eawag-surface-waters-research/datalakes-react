import React, { Component } from "react";
import Select from "react-select";
import Loading from "../../../components/loading/loading";

class SelectDataset extends Component {
  state = {
    message: "",
    loading: false,
  };

  nextStep = async (e) => {
    e.preventDefault();
    var { loading } = this.state;
    if (!loading) {
      this.setState({
        loading: true,
        message:
          "Accessing files. This might take a while for repositories with external storage.",
      });
      this.props.nextStep().catch((error) => {
        console.error(error.message);
        console.log(error);
        this.setState({
          message: error.message,
          loading: false,
        });
      });
    } else {
      console.error("Processing Running");
    }
  };

  prevStep = (e) => {
    e.preventDefault();
    this.props.prevStep();
  };

  render() {
    var { dataset, allFiles } = this.props;
    var { message, loading } = this.state;
    var { folder } = dataset;

    allFiles.sort(function (a, b) {
      return b.split("/").length - a.split("/").length;
    });
    allFiles = allFiles.filter((f) => f.slice(-3) === ".nc");
    allFiles = allFiles.map((f) => {
      let lastIndex = f.lastIndexOf("/");
      return f.slice(0, lastIndex);
    });
    allFiles = [...new Set(allFiles)];
    allFiles = allFiles.map((f) => {
      let firstIndex = f.split("/", 3).join("/").length;
      return {
        value: f,
        label: f.slice(firstIndex, f.length),
      };
    });

    if (message !== "") {
      var userMessage = (
        <div className="loading">
          {loading && <Loading />}
          <div id="adddata-message">{message}</div>
        </div>
      );
    }

    return (
      <React.Fragment>
        <form className="adddataset-form" onSubmit={this.nextStep}>
          <div className="lineage-text">
            Select the folder from the dropdown that contains your dataset. Only folders containing NetCDF files are displayed.
          </div>
          <Select
            options={allFiles}
            defaultValue={folder}
            onChange={this.props.handleFolder}
          />

          <div className="error-message">{userMessage}</div>
          <div className="buttonnav">
            <button onClick={this.prevStep}>Back</button>
            <button onClick={this.nextStep}>Next </button>
          </div>
        </form>
      </React.Fragment>
    );
  }
}

export default SelectDataset;
