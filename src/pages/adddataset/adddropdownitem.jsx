import React, { Component } from "react";
import axios from "axios";
import Modal from "../../components/modal/modal";
import { apiUrl } from "../../../src/config.json";

class SelectCustom extends Component {
  render() {
    const { list, onChange } = this.props;
    var options = [];
    for (var item of list) {
      options.push(
        <option key={item.name} value={item.id}>
          {item.name}
        </option>
      );
    }
    return <select onChange={onChange}>{options}</select>;
  }
}

class AddDropdownItem extends Component {
  state = {
    values: {}
  };

  clearState = () => {
    this.setState({ values: {} });
  };

  handleChange = input => event => {
    var values = this.state.values;
    values[input] = event.target.value;
    this.setState({ values });
  };

  submit = async e => {
    e.preventDefault();
    await axios.post(apiUrl + "/selectiontables", {
      table: this.props.modalValue,
      data: this.state.values
    });
    this.props.showModal();
    this.clearState();
    this.props.getDropdowns();
  };

  componentDidUpdate() {
    this.setInitialSelectState();
  }

  setInitialSelectState = () => {
    const { modalValue, modalInfo } = this.props;
    var { values } = this.state;
    var keys = "";

    if (modalValue !== undefined) {
      try {
        keys = Object.keys(modalInfo[modalValue][0]);
      } catch (e) {}
    }

    if (Array.isArray(keys)) {
      for (var label of keys) {
        if (label.includes("_id")) {
          if (label in values) {
          } else {
            values[label] = modalInfo[label.split("_")[0]][0].id;
            this.setState({ values });
          }
        }
      }
    }
  };

  render() {
    const { show, showModal, modalValue, modalInfo } = this.props;
    var keys = "";
    var table = [];

    if (modalValue !== undefined) {
      try {
        keys = Object.keys(modalInfo[modalValue][0]);
      } catch (e) {}
    }

    if (Array.isArray(keys)) {
      for (var label of keys) {
        if (label === "id") {
        } else if (label.includes("_id")) {
          table.push(
            <tr key={label}>
              <th>{label}</th>
              <td>
                <SelectCustom
                  list={modalInfo[label.split("_")[0]]}
                  onChange={this.handleChange(label)}
                />
              </td>
            </tr>
          );
        } else {
          table.push(
            <tr key={label}>
              <th>{label}</th>
              <td>
                <input type="text" onChange={this.handleChange(label)} />
              </td>
            </tr>
          );
        }
      }
    }

    var value = (
      <form className="dropdownadd">
        <h1>Add {modalValue}</h1>
        <h3>Do not add duplicate values to the list.</h3>
        <table className="dropdownadd-table">
          <tbody>{table}</tbody>
        </table>
        <div className="buttonnav">
          <button onClick={this.submit}>Submit</button>
        </div>
      </form>
    );
    return (
      <React.Fragment>
        <Modal
          show={show}
          value={value}
          showModal={showModal}
          clearState={this.clearState}
        />
      </React.Fragment>
    );
  }
}

export default AddDropdownItem;
