import React, { Component } from "react";
import "./modal.css";

class Modal extends Component {
  hide = () => {
    this.props.showModal();
    this.props.clearState();
  }
  render() {
    const { show, value } = this.props;
    if (!show) {
      return null;
    }
    return (
      <React.Fragment>
        <div className="modal">
          <div className="modal-content">
            <span onClick={this.hide} className="close">&times;</span>
            {value}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Modal;
