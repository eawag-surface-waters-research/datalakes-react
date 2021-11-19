import React, { Component } from "react";

class ProgressBar extends Component {
  state = {};
  render() {
    const { step, setStep, allowedStep } = this.props;
    var classes = ["", "", "", "", ""];
    classes[step - 1] = "is-active";
    return (
      <React.Fragment>
        <h1>Publish Repository</h1>
        <div className="container-fluid">
          <ul className="list-unstyled multi-steps">
            <li onClick={() => setStep(allowedStep[0])} className={classes[0]}>
              Select Repo
            </li>
            <li onClick={() => setStep(allowedStep[1])} className={classes[1]}>
              Select Archive
            </li>
            <li onClick={() => setStep(allowedStep[2])} className={classes[2]}>
              Metadata Review
            </li>
            <li onClick={() => setStep(allowedStep[3])} className={classes[3]}>
              Publish
            </li>
          </ul>
        </div>
      </React.Fragment>
    );
  }
}

export default ProgressBar;