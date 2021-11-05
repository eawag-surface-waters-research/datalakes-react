import React, { Component } from "react";
import ReactDOM from "react-dom";
import Loading from "../../../components/loading/loading";

class AddData extends Component {
  state = {
    message: "",
    loading: false,
    optionalid: false,
  };

  toggleOptional = () => {
    this.setState({ optionalid: !this.state.optionalid });
  };

  nextStep = async (e) => {
    e.preventDefault();
    var { loading } = this.state;
    if (!loading) {
      this.setState({
        loading: true,
        message:
          "Downloading and analysing file. This might take a while for large files.",
      });
      var id = false;
      if (document.getElementById("id").value !== ""){
        id = document.getElementById("id").value
      }
      this.props.nextStep(id).catch((error) => {
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

  componentDidMount() {
    // Put cursor in input box.
    ReactDOM.findDOMNode(this.refs.git).focus();
    ReactDOM.findDOMNode(this.refs.git).select();
  }

  render() {
    const { dataset } = this.props;
    var { message, loading } = this.state;

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
        <div className="adddataset-form">
          <div className="welcome-text">
            <p>
              Welcome to the Datalakes add dataset portal. Currently we only
              support connection to git repositories from the following
              companies: <a href="https://renkulab.io/gitlab">Renkulab.io</a>,{" "}
              <a href="https://gitlab.com/">GitLab</a> and{" "}
              <a href="https://github.com/">GitHub</a>.
            </p>
            <p>
              It is important that the repository is either open for public
              access or you have invited the user <b>EawagDatalakes</b> to have
              at least Reporter access.{" "}
              <a href="https://renkulab.io/gitlab/james.runnalls">
                Renkulab.io
              </a>
              , <a href="https://gitlab.com/EawagDatalakes">GitLab</a> and{" "}
              <a href="https://github.com/eawagdatalakes">GitHub</a>
            </p>
            <p>
              Input data must be in NetCDF format according to the CF
              convensions. If you wish to upload multiple file to the same
              dataset they must be of the same format and in the same folder
              with no other files present.
            </p>
            <p>Data must be on the master branch.</p>
            <p>Enter a link below to the NetCDF file in your git repository.</p>
          </div>
          <div className="form-group">
            <label htmlFor="git">Link to Git File</label>
            <input
              id="git"
              type="text"
              ref="git"
              placeholder="https://gitcompany/repo-group/repo-name/blob/master/folders/file-name.nc"
              onChange={this.props.handleChange("datasourcelink")}
              defaultValue={dataset.datasourcelink}
            />
            <label
              className="optional-id"
              htmlFor="id"
              onClick={this.toggleOptional}
            >
              Specify id for dataset (not recommended)
            </label>
            <input
              id="id"
              className={
                this.state.optionalid ? "optional-id" : "optional-id hide"
              }
              ref="id"
              type="number"
              min="0"
              step="1"
            />
          </div>
          <div className="error-message">{userMessage}</div>
          <div className="buttonnav">
            <button onClick={this.nextStep}>Process</button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default AddData;
