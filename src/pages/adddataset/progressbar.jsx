import React, { Component } from "react";

class ProgressBar extends Component {
  state = {};
  render() {
    const { step, setStep, allowedStep } = this.props;
    var classes = ["", "", "", "", "", ""];
    classes[step - 1] = "is-active";
    return (
      <React.Fragment>
        <div className="container-fluid">
          <ul className="list-unstyled multi-steps">
            <li onClick={() => setStep(allowedStep[0])} className={classes[0]}>
              Repository
            </li>
            <li onClick={() => setStep(allowedStep[1])} className={classes[1]}>
              Files
            </li>
            <li onClick={() => setStep(allowedStep[2])} className={classes[2]}>
              Data Review
            </li>
            <li onClick={() => setStep(allowedStep[3])} className={classes[3]}>
              Lineage
            </li>
            <li onClick={() => setStep(allowedStep[4])} className={classes[4]}>
              Metadata
            </li>
            <li onClick={() => setStep(allowedStep[5])} className={classes[5]}>
              Publish
            </li>
          </ul>
        </div>
      </React.Fragment>
    );
  }
}

export default ProgressBar;