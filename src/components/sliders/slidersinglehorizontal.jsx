import React, { Component } from "react";
import { Slider, Rail, Handles, Tracks, Ticks } from "react-compound-slider";
import { SliderRail, Handle, Track, Tick } from "./components";
import { scaleTime } from "d3";
import DateTimePicker from "react-datetime-picker";
import AvailbilityBar from "./availabilitybar";
import { format } from "date-fns";
import "./slider.css";

class SliderSingleHorizontal extends Component {
  state = {
    dt: this.props.value,
  };
  formatTick = (ms) => {
    const { min, max } = this.props;
    const diff = max.getTime() / 1000 - min.getTime() / 1000;
    if (diff < 172800) {
      // 3 Days
      return format(ms, "hh:mm:ss");
    } else if (diff < 31556952) {
      // 1 Year
      return format(ms, "dd MMM");
    } else if (diff < 157784760) {
      // 5 Years
      return format(ms, "MMM yy");
    } else {
      return format(ms, "yyyy");
    }
  };

  onUpdate = (event) => {
    this.setState({ dt: new Date(event[0]) });
  };

  render() {
    const sliderStyle = {
      position: "relative",
      width: "100%",
      height: 42,
      margin: "auto",
      marginTop: 10,
      boxSizing: "border-box",
    };
    var { value, onChange, min, max, files } = this.props;
    if (min.getTime() === max.getTime()) {
      min = new Date(min.getTime() - 5 * 24 * 60 * 60 * 1000);
      max = new Date(max.getTime() + 5 * 24 * 60 * 60 * 1000);
    } else if (min > max) {
      var tempmin = min;
      var tempmax = max;
      min = tempmax;
      max = tempmin;
    }
    var { dt } = this.state;
    var dateTicks = scaleTime()
      .domain([min, max])
      .ticks(10)
      .map((d) => +d);
    return (
      <React.Fragment>
        {" "}
        <div className="horizontalslider" title="Select your desired datetime">
          <Slider
            mode={1}
            step={1}
            domain={[+min, +max]}
            rootStyle={sliderStyle}
            values={[value]}
            onChange={onChange}
            onUpdate={this.onUpdate}
          >
            <AvailbilityBar min={min} max={max} files={files} />
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
        <div className="maintime" title="Map reference time">
          <div>Date & Time</div>
          <DateTimePicker
            value={dt}
            clearIcon={null}
            calendarIcon={null}
            maxDate={max}
            minDate={min}
            disableClock={true}
            onChange={onChange}
            format="h:mm:ss dd-MM-y"
          />
        </div>
      </React.Fragment>
    );
  }
}

export default SliderSingleHorizontal;
