import React, { Component } from "react";
import Select from "react-select";
import "./dataselect.css";

class DataSelect extends Component {
  addNew = (table) => {
    this.props.showModal(table);
  };

  render() {
    const customStyles = {
      control: (base) => ({
        ...base,
        height: 30,
        minHeight: 30,
      }),
    };
    var { dataList, defaultValue, value, label, disabled } = this.props;
    var list = [];
    try {
      if (dataList.length > 0) {
        for (var param of dataList) {
          let inner = {
            value: param[value],
            label: param[label],
            isDisabled: false,
          };
          if ("isDisabled" in param) {
            inner["isDisabled"] = param["isDisabled"];
          }
          list.push(inner);
        }
      }
    } catch (e) {}
    var dValue = list.find((x) => x.value === defaultValue);
    var isDisabled = false;
    if (disabled) isDisabled = disabled;
    return (
      <div>
        <Select
          options={list}
          value={dValue}
          className="multi-select"
          classNamePrefix="dataselect"
          onChange={this.props.onChange}
          styles={customStyles}
          isDisabled={isDisabled}
          isOptionDisabled={(option) => option.isDisabled}
          noOptionsMessage={
            this.props.showModal
              ? () => (
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => this.addNew(this.props.table)}
                  >
                    Add new
                  </div>
                )
              : () => <div>No options</div>
          }
        />
      </div>
    );
  }
}

export default DataSelect;
