import React, { Component } from "react";
import EditSettings from "./editsettings";
import { sortableHandle } from "react-sortable-hoc";
import "./maplayers.css";

const DragHandle = sortableHandle(({ inner }) => (
  <div title="Drag to re-order layers">{inner}</div>
));

class LayerObject extends Component {
  state = {
    open: this.props.defaultOpen,
    settings: false,
  };
  toggleOpen = () => {
    this.setState({ open: !this.state.open });
  };
  toggleSettings = () => {
    this.setState({ settings: !this.state.settings });
  };
  render() {
    var { open, settings } = this.state;
    var {
      id,
      title,
      parameter_name,
      color,
      content,
      allowSettings,
      display,
      displayGroup,
      removeSelected,
      onUpdate,
      toggleLayerView,
    } = this.props;
    return (
      <div className="maplayers-dropdown">
        <table className="maplayers-dropdown-table">
          <tbody>
            <tr className="maplayers-dropdown-title">
              <td
                className="maplayers-symbol"
                onClick={this.toggleOpen}
                style={{ width: "10px" }}
                title={open ? "Hide layer legend" : "Show layer legend"}
              >
                {open ? "▿" : "▹"}
              </td>
              <td className="maplayers-check">
                {" "}
                <input
                  className="maplayers-checkbox"
                  type="checkbox"
                  title={display.visible ? "Hide layer" : "Show layer"}
                  onChange={() => toggleLayerView(id)}
                  checked={display.visible}
                />
              </td>
              <td style={{ width: "100%" }} onClick={this.toggleOpen}>
                <DragHandle inner={title} />
                <div className="maplayers-parameter" style={{ color: color }}>
                  {parameter_name}
                </div>
              </td>
              {allowSettings && (
                <td
                  onClick={this.toggleSettings}
                  style={{ width: "10px" }}
                  className="maplayers-settings"
                  title="Layer display settings"
                >
                  &#9881;
                </td>
              )}
            </tr>
          </tbody>
        </table>
        <div
          className={
            settings
              ? "maplayers-dropdown-content"
              : "maplayers-dropdown-content hide"
          }
        >
          <EditSettings
            id={id}
            display={display}
            displayGroup={displayGroup}
            removeSelected={removeSelected}
            onUpdate={onUpdate}
          />
        </div>
        <div
          className={
            open
              ? "maplayers-dropdown-content"
              : "maplayers-dropdown-content hide"
          }
        >
          {content}
        </div>
      </div>
    );
  }
}

export default LayerObject;
