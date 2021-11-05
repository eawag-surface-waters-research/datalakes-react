import React, { Component } from "react";
import FileSelector from "../../../components/fileselector/fileselector";

class ReviewLineage extends Component {
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
    const {
      dataset,
      renkuResponse,
      allFiles,
      handleAccompanyingData,
    } = this.props;
    var { accompanyingdata } = dataset;
    const { message } = this.state;
    allFiles.sort(function(a, b){
      return b.split("/").length - a.split("/").length;
    })
    var selectedfiles = accompanyingdata
      .map((ad) => {
        var arr = ad.split("/");
        return arr[arr.length - 1];
      })
      .join(", ");
    var renku = "";
    if (renkuResponse.stdout === 0 && renkuResponse.log.data.lineage !== null) {
      renku = "Renku lineage information detected.";
    }

    return (
      <React.Fragment>
        <form className="adddataset-form" onSubmit={this.nextStep}>
          <div className="lineage-text">
            <p>
              Reproducability is key for open science. Please attach all files
              needed to reproduce a subset of this dataset.
            </p>{" "}
            <p>This typically includes:</p>
            <ol>
              <li>An example of the raw data</li>
              <li>Any processing scripts</li>
              <li>Environment information such as requirements.txt</li>
            </ol>
            <p>
              This is also a good place to add custom calibration files or any
              other information related to the data.
            </p>
            <p>{renku}</p>
          </div>
          <FileSelector
            allFiles={allFiles}
            accompanyingdata={accompanyingdata}
            handleAccompanyingData={handleAccompanyingData}
          />
          <div className="selectedfiles"><b>Selected:</b> {selectedfiles}</div>
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

export default ReviewLineage;
