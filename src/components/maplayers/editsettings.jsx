import React, { Component } from "react";
import ColorManipulation from "../colormanipulation/colormanipulation";
import "./maplayers.css";

class EditSettings extends Component {
  state = {
    yselectindex: this.props.display.yselectindex,
    opacity: this.props.display.opacity,
    colors: this.props.display.colors,
    min: this.props.display.min,
    max: this.props.display.max,
    markerLabel: this.props.display.markerLabel,
    legend: this.props.display.legend,
    movingAverage: this.props.display.movingAverage,
    markerSymbol: this.props.display.markerSymbol,
    markerFixedSize: this.props.display.markerFixedSize,
    markerSize: this.props.display.markerSize,
    vectorArrowColor: this.props.display.vectorArrowColor,
    vectorFlowColor: this.props.display.vectorFlowColor,
    vectorArrows: this.props.display.vectorArrows,
    vectorFlow: this.props.display.vectorFlow,
    vectorMagnitude: this.props.display.vectorMagnitude,
    validpixelexpression: this.props.display.validpixelexpression,
    contour: this.props.display.contour,
    thresholds: this.props.display.thresholds,
  };

  capitalize = (s) => {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  onChangeInput = (event, name) => {
    this.setState({ [name]: event.target.value });
  };
  toggle = (name) => {
    this.setState({ [name]: !this.state[name] });
  };
  localOpacityChange = (event) => {
    this.setState({ opacity: event.target.value / 100 });
  };
  localColorChange = (colors) => {
    this.setState({ colors });
  };
  resetMin = () => {
    var { datamin } = this.props.display;
    this.setState({ min: datamin });
  };
  resetMax = () => {
    var { datamax } = this.props.display;
    this.setState({ max: datamax });
  };
  localMarkerFixedSizeChange = (event) => {
    var markerFixedSize = false;
    if (event.target.value === "true") markerFixedSize = true;
    this.setState({ markerFixedSize });
  };
  localVectorArrowColorChange = (event) => {
    var vectorArrowColor = false;
    if (event.target.value === "true") vectorArrowColor = true;
    this.setState({ vectorArrowColor });
  };
  updateDisplay = () => {
    var variables = [
      "yselectindex",
      "opacity",
      "colors",
      "min",
      "max",
      "markerLabel",
      "legend",
      "movingAverage",
      "markerSymbol",
      "markerFixedSize",
      "markerSize",
      "vectorArrowColor",
      "vectorFlowColor",
      "vectorArrows",
      "vectorFlow",
      "vectorMagnitude",
      "validpixelexpression",
      "contour",
      "thresholds",
    ];
    var { display, onUpdate, displayGroup } = this.props;

    for (let variable of variables) {
      display[variable] = this.state[variable];
    }

    var index = displayGroup.findIndex((x) => x.id === display.id);
    displayGroup[index] = display;
    onUpdate(displayGroup);
  };

  render() {
    var {
      yselectindex,
      opacity,
      colors,
      min,
      max,
      markerLabel,
      legend,
      movingAverage,
      markerSymbol,
      markerFixedSize,
      markerSize,
      vectorArrowColor,
      vectorFlowColor,
      vectorArrows,
      vectorFlow,
      vectorMagnitude,
      validpixelexpression,
      contour,
      thresholds,
    } = this.state;
    var { removeSelected, id, display: displayProps } = this.props;
    var { mapplot, datasetparameters, data } = displayProps;
    if (min === null) min = 0;
    if (max === null) max = 0;
    var { array } = displayProps;
    var type = datasetparameters.map((dp) => dp.axis + "&" + dp.parameters_id);
    if (!yselectindex) yselectindex = 0;
    var yselectparam = datasetparameters.find((dp) => dp.axis === "y");
    return (
      <div className="editsettings">
        <div>
          <table className="min-max">
            <tbody>
              <tr>
                <td style={{ width: "35px" }}>Min:</td>
                <td>
                  <input
                    type="number"
                    value={min}
                    onChange={(e) => this.onChangeInput(e, "min")}
                  />
                </td>
                <td style={{ width: "70px" }}>
                  <div className="editsettings-button">
                    <button type="button" onClick={this.resetMin}>
                      Reset
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Max:</td>
                <td>
                  <input
                    type="number"
                    value={max}
                    onChange={(e) => this.onChangeInput(e, "max")}
                  />
                </td>
                <td>
                  <div className="editsettings-button">
                    <button type="button" onClick={this.resetMax}>
                      Reset
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {type.includes("x&1") &&
          !type.includes("y&2") &&
          type.join(",").includes("z&") && (
            <div>
              {this.capitalize(yselectparam.parseparameter) + " "}
              <select
                value={yselectindex}
                onChange={(e) => this.onChangeInput(e, "yselectindex")}
              >
                {data.y.map((d, index) => (
                  <option value={index} key={d}>
                    {d}
                  </option>
                ))}
              </select>
              {" " + yselectparam.unit}
            </div>
          )}
        {["raster", "group"].includes(mapplot) &&
          validpixelexpression === "NA" && (
            <div className="editsettings-markeroptions">
              <div className="editsettings-title">Raster Options</div>
              <table className="editsettings-table">
                <tbody>
                  <tr>
                    <td>Contour (Beta)</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={contour}
                        onChange={() => this.toggle("contour")}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>No. Contours</td>
                    <td>
                      <input
                        type="number"
                        min={10}
                        max={10000}
                        step={1}
                        value={thresholds}
                        onChange={(e) => this.onChangeInput(e, "thresholds")}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        {["marker", "group"].includes(mapplot) && (
          <div className="editsettings-markeroptions">
            <div className="editsettings-title">Marker Options</div>
            <table className="editsettings-table">
              <tbody>
                <tr>
                  <td>Symbol</td>
                  <td>
                    <select
                      value={markerSymbol}
                      onChange={(e) => this.onChangeInput(e, "markerSymbol")}
                    >
                      <option value="circle">&#9679; Circle</option>
                      <option value="square">&#9632; Square</option>
                      <option value="triangle">&#9650; Triangle</option>
                      <option value="arrow">Arrow</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>Size</td>
                  <td>
                    <select
                      value={markerFixedSize}
                      onChange={this.localMarkerFixedSizeChange}
                    >
                      <option value="true">Fixed</option>
                      <option value="false">By Value</option>
                    </select>
                  </td>
                  <td>
                    {markerFixedSize && (
                      <input
                        type="text"
                        value={markerSize}
                        onChange={(e) => this.onChangeInput(e, "markerSize")}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Show Labels</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={markerLabel}
                      onChange={() => this.toggle("markerLabel")}
                    ></input>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {["field", "group"].includes(mapplot) && (
          <div className="editsettings-fieldoptions">
            <div className="editsettings-title">Field Options</div>
            <table>
              <tbody>
                <tr>
                  <td>
                    <input
                      type="checkbox"
                      checked={vectorMagnitude}
                      onChange={() => this.toggle("vectorMagnitude")}
                    ></input>
                  </td>
                  <td>Magnitude Raster</td>
                </tr>
                <tr>
                  <td>
                    <input
                      type="checkbox"
                      checked={vectorArrows}
                      onChange={() => this.toggle("vectorArrows")}
                    ></input>
                  </td>
                  <td>Directional Arrows</td>
                  <td>
                    <select
                      value={vectorArrowColor}
                      onChange={this.localVectorArrowColorChange}
                    >
                      <option value="true">Color Ramp</option>
                      <option value="false">Fixed Color</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input
                      type="checkbox"
                      checked={vectorFlow}
                      onChange={() => this.toggle("vectorFlow")}
                    ></input>
                  </td>
                  <td>Flow Path</td>
                  <td>
                    <select
                      value={vectorFlowColor}
                      onChange={(e) => this.onChangeInput(e, "vectorFlowColor")}
                    >
                      <option value="white">White</option>
                      <option value="true">Color Ramp</option>
                      <option value="black">Black</option>
                      <option value="grey">Grey</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>Opacity</td>
                  <td>
                    <input
                      type="number"
                      value={opacity * 100}
                      onChange={this.localOpacityChange}
                      min="0"
                      max="100"
                      step="10"
                    />
                    %
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {movingAverage && (
          <div>
            <table>
              <tbody>
                <tr>
                  <td>Moving Averge:</td>
                  <td>
                    <select
                      value={movingAverage}
                      onChange={(e) => this.onChangeInput(e, "movingAverage")}
                    >
                      <option value="none">None</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                      <option value="7">7</option>
                      <option value="8">8</option>
                      <option value="9">9</option>
                      <option value="10">10</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {validpixelexpression !== "NA" && (
          <div>
            <table>
              <tbody>
                <tr>
                  <td>Valid Pixel Expression:</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={validpixelexpression}
                      onChange={() => this.toggle("validpixelexpression")}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        <div className="editsettings-title">Color Options</div>
        <ColorManipulation
          colors={colors}
          array={array}
          onChange={this.localColorChange}
        />
        Show in Legend{" "}
        <input
          type="checkbox"
          checked={legend}
          onChange={() => this.toggle("legend")}
        ></input>
        <div className="editsettings-button">
          <button
            type="button"
            title="Update mapplot settings"
            onClick={this.updateDisplay}
          >
            Update Plot
          </button>
          {removeSelected && (
            <button
              type="button"
              title="Delete layer"
              onClick={() => removeSelected(id)}
            >
              Delete Layer
            </button>
          )}
        </div>
      </div>
    );
  }
}

export default EditSettings;
