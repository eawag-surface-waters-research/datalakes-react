import React, { Component } from "react";
import "./errormodal.css";

class ErrorModal extends Component {
  state = { errordetails: false };
  toggleErrorDetails = () => {
    this.setState({ errordetails: !this.state.errordetails });
  };
  render() {
    var { visible, text, closeModal, details } = this.props;
    var { errordetails } = this.state;
    return (
      <React.Fragment>
        {visible && (
          <div className="errormodal">
            <div className="errorinner">
              <table>
                <tbody>
                  <tr>
                    <td>
                      <div className="errortitle">
                        Error Accessing External API
                      </div>
                    </td>
                    <td>
                      <div
                        className="closeicon"
                        onClick={closeModal}
                        title="Close"
                      >
                        &#215;
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <div className="errortext">{text}</div>
                    </td>
                  </tr>
                  {details && (
                    <tr>
                      <td colSpan="2">
                        <div
                          className="errordetails"
                          onClick={this.toggleErrorDetails}
                        >
                          Click here for details of the error.
                        </div>
                        {errordetails && (
                          <div className="errordetailstext">{details}</div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default ErrorModal;
