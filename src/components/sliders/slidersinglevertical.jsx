import React, { Component } from "react";
import { Slider, Rail, Handles, Tracks, Ticks } from "react-compound-slider";
import { SliderRail, Handle, Track, Tick } from "./componentsvertical";
import { scaleLinear } from "d3";
import "./slider.css";
import AvailbilityBarV from "./availabilitybarv";
import BlurInput from "../blurinput/blurinput";

class SliderSingleVertical extends Component {
  formatTick = (ms) => {
    return ms;
  };

  onUpdate = (event) => {
    this.setState({ dt: event[0] });
  };

  render() {
    const sliderStyle = {
      position: "relative",
      width: "100%",
      height: "100%",
      margin: "auto",
      marginTop: 10,
      boxSizing: "border-box",
    };
    var { value, onChange, min, max, files } = this.props;
    var dateTicks = scaleLinear()
      .domain([min, max])
      .ticks(8)
      .map((d) => +d);
    return (
      <React.Fragment>
        <div className="maindepth" title="Map reference depth">
          <div>Depth</div>
          <BlurInput value={value} type="number" onBlur={onChange} min={0} />
          <span className="unit">m</span>
        </div>
        <div className="verticalslider" title="Select your desired depth">
          <Slider
            vertical
            mode={1}
            step={0.1}
            domain={[+min, +max]}
            rootStyle={sliderStyle}
            values={[value]}
            onChange={onChange}
            onUpdate={this.onUpdate}
          >
            <AvailbilityBarV min={min} max={max} files={files} />
            <Rail>
              {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
            </Rail>
            <Handles>
              {({ handles, activeHandleID, getHandleProps }) => (
                <div className="slider-handles">
                  {handles.map((handle) => (
                    <Handle
                      key={handle.id}
                      handle={handle}
                      domain={[min, max]}
                      isActive={handle.id === activeHandleID}
                      getHandleProps={getHandleProps}
                    />
                  ))}
                </div>
              )}
            </Handles>
            <Tracks left={false} right={false}>
              {({ tracks, getTrackProps }) => (
                <div className="slider-tracks">
                  {tracks.map(({ id, source, target }) => (
                    <Track
                      key={id}
                      source={source}
                      target={target}
                      getTrackProps={getTrackProps}
                    />
                  ))}
                </div>
              )}
            </Tracks>
            <Ticks values={dateTicks}>
              {({ ticks }) => (
                <div>
                  {ticks.map((tick) => (
                    <Tick
                      key={tick.id}
                      tick={tick}
                      count={ticks.length}
                      format={this.formatTick}
                    />
                  ))}
                </div>
              )}
            </Ticks>
          </Slider>
        </div>
      </React.Fragment>
    );
  }
}

export default SliderSingleVertical;
