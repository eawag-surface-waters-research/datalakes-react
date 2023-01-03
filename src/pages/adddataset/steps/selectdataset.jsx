import React, { Component } from "react";
import Select from "react-select";

class SelectDataset extends Component {
  state = {
    message: "",
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
    var { dataset, allFiles } = this.props;
    var { folder } = dataset;
    const { message } = this.state;
    allFiles.sort(function (a, b) {
      return b.split("/").length - a.split("/").length;
    });
    allFiles = allFiles.filter((f) => f.slice(-3) === ".nc");
    allFiles = allFiles.map((f) => {
      let lastIndex = f.lastIndexOf("/");
      let firstIndex = f.split("/", 3).join("/").length;
      return {
        value: f.slice(0, lastIndex),
        label: f.slice(firstIndex, lastIndex),
      };
    });

    return (
      <React.Fragment>
        <form className="adddataset-form" onSubmit={this.nextStep}>
          <div className="lineage-text"></div>

          <Select options={allFiles} />

          <div className="error-message">{message}</div>
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
