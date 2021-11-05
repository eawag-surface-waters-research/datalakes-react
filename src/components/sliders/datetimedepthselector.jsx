import React, { Component } from "react";
import "./datetimedepthselector.css";
import "./slider.css";
import SliderSingleHorizontal from "./slidersinglehorizontal";
import SliderSingleVertical from "./slidersinglevertical";

class DatetimeDepthSelector extends Component {
  render() {
    var {
      files,
      mindepth,
      maxdepth,
      mindatetime,
      maxdatetime,
      datetime,
      depth,
      onChangeDepth,
      onChangeDatetime,
    } = this.props;
    return (
      <div className="ddselector">
        <div className="datetime">
          <div className="maintimeslider">
            <SliderSingleHorizontal
              value={datetime}
              min={mindatetime}
              max={maxdatetime}
              files={files}
              onChange={onChangeDatetime}
            />
          </div>
        </div>
        <div className="videocontrols"></div>
        <div className="depth">
          <div className="maindepthslider">
            <SliderSingleVertical
              value={depth}
              min={mindepth}
              max={maxdepth}
              files={files}
              onChange={onChangeDepth}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default DatetimeDepthSelector;
