import React, { Component } from "react";
import ProgressBar from "./progressbar";
import axios from "axios";
import { apiUrl } from "../../../src/config.json";
import "./publish.css";
import Loading from "../../components/loading/loading";

class SelectRepo extends React.Component {
  render() {
    var { prevStep, nextStep, loading, repositories, repo, onChangeRepo } =
      this.props;
    if (loading || repositories === undefined) {
      return <Loading />;
    } else {
      var options = [];
      for (var i = 0; i < repositories.length; i++) {
        options.push(
          <option key={i} value={i}>
            {repositories[i].ssh}
          </option>
        );
      }
      return (
        <div className="selectrepo">
          Select the repository from the dropdown that you wish to publish.
          <div className="dropdown">
            <select onChange={onChangeRepo} value={repo}>
              {options}
            </select>
          </div>
          <div className="buttonnav">
            <button onClick={prevStep}>Back</button>
            <button onClick={nextStep}>Next </button>
          </div>
        </div>
      );
    }
  }
}

class SelectArchive extends React.Component {
  render() {
    var { prevStep, nextStep, archives, archive, onChangeArchive } = this.props;
    var options = [];
    for (var i = 0; i < archives.length; i++) {
      options.push(
        <option key={i} value={i}>
          {archives[i]}
        </option>
      );
    }
    return (
      <div className="selectrepo">
        Select the archive to which you want to publish.
        <div className="dropdown">
          <select onChange={onChangeArchive} value={archive}>
            {options}
          </select>
        </div>
        <div className="buttonnav">
          <button onClick={prevStep}>Back</button>
          <button onClick={nextStep}>Next </button>
        </div>
      </div>
    );
  }
}

class MetadataReview extends React.Component {
  render() {
    var { prevStep, nextStep } = this.props;
    return (
      <div>
        Metadata Review
        <div className="buttonnav">
          <button onClick={prevStep}>Back</button>
          <button onClick={nextStep}>Next </button>
        </div>
      </div>
    );
  }
}

class PublishData extends React.Component {
  render() {
    var { prevStep, nextStep } = this.props;
    return (
      <div>
        Publish Data
        <div className="buttonnav">
          <button onClick={prevStep}>Back</button>
          <button onClick={nextStep}>Next </button>
        </div>
      </div>
    );
  }
}

class Publish extends Component {
  state = {
    step: 1,
    allowedStep: [1, 0, 0, 0],
    loading: true,
    repo: 0,
    archives: ["ERIC - Eawag Research Data Insitutional Collection"],
    archive: 0,
  };

  onChangeArchive = (event) => {
    this.setState({ archive: event.target.value });
  };

  onChangeRepo = (event) => {
    this.setState({ repo: event.target.value });
  };

  validateSelectRepo = () => {
    const { step } = this.state;
    this.setState({ allowedStep: [1, 2, 0, 0], step: step + 1 });
  };

  validateSelectArchive = () => {
    const { step } = this.state;
    this.setState({ allowedStep: [1, 2, 3, 0], step: step + 1 });
  };

  validateMetadataReview = () => {
    const { step } = this.state;
    this.setState({ allowedStep: [1, 2, 3, 4], step: step + 1 });
  };

  publishData = () => {
    console.log("Publish");
  };

  prevStep = () => {
    const { step } = this.state;
    this.setState({
      step: step - 1,
    });
  };

  setStep = (step) => {
    if (step !== 0) {
      this.setState({ step });
    }
  };

  async componentDidMount() {
    const { data: selectiontables } = await axios.get(
      apiUrl + "/selectiontables"
    );
    const { data: repositories } = await axios.get(apiUrl + "/repositories");
    var { data: datasets } = await axios.get(apiUrl + "/datasets");
    var { data: parameters } = await axios.get(apiUrl + "/datasetparameters");
    this.setState({
      repositories,
      datasets,
      parameters,
      selectiontables,
      loading: false,
    });
  }

  render() {
    document.title = "Publish - Datalakes";
    var { step, allowedStep, loading, repo, repositories, archives, archive } =
      this.state;
    switch (step) {
      default:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <SelectRepo
              loading={loading}
              nextStep={this.validateSelectRepo}
              prevStep={this.prevStep}
              repositories={repositories}
            />
          </React.Fragment>
        );
      case 1:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <SelectRepo
              loading={loading}
              nextStep={this.validateSelectRepo}
              prevStep={this.prevStep}
              repositories={repositories}
              repo={repo}
              onChangeRepo={this.onChangeRepo}
            />
          </React.Fragment>
        );
      case 2:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <SelectArchive
              nextStep={this.validateSelectArchive}
              prevStep={this.prevStep}
              archives={archives}
              archive={archive}
              onChangeArchive={this.onChangeArchive}
            />
          </React.Fragment>
        );
      case 3:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <MetadataReview
              nextStep={this.validateMetadataReview}
              prevStep={this.prevStep}
            />
          </React.Fragment>
        );
      case 4:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <PublishData nextStep={this.publishData} prevStep={this.prevStep} />
          </React.Fragment>
        );
    }
  }
}

export default Publish;
