import React, { Component } from "react";
import ReactDOM from "react-dom";
import Loading from "../../../components/loading/loading";

class CloneRepository extends Component {
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
          "Cloning repository. This might take a while for repositories with large datasets.",
      });
      var id = false;
      if (document.getElementById("id").value !== "") {
        id = document.getElementById("id").value;
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
            <h3>Welcome to the Datalakes UI for adding new datasets.</h3>
            Datalakes is a reproducible data portal. As such all datasets should
            be saved in a git repository. Please provide a link to your
            repository below. Links must be in the "ssh" format as if you were
            going to clone your repository.
          </div>
          <div className="form-group">
            <label htmlFor="git">Git Repository</label>
            <input
              id="git"
              type="text"
              ref="git"
              placeholder="git@gitlab.renkulab.io:lexplore/meteostation.git"
              onChange={this.props.handleChange("ssh")}
              defaultValue={dataset.ssh}
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

export default CloneRepository;
