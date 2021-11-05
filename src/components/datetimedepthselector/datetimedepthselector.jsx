import React, { Component } from "react";
import { setIntervalAsync } from "set-interval-async/dynamic";
import { clearIntervalAsync } from "set-interval-async";
//import * as d3 from "d3";
import "./datetimedepthselector.css";
import pauseicon from "./img/pause.svg";
import playicon from "./img/play.svg";
import skipbackwardsicon from "./img/skipbackwards.svg";
import skipforwardsicon from "./img/skipforwards.svg";
import clockicon from "./img/clock.svg";
import depthicon from "./img/depth.svg";
import SelectorModal from "./selectormodal";
import TimeSelector from "./timeselector";

class DatetimeDepthSelector extends Component {
  state = {
    modal: false,
    play: false,
  };
  skipForwards = () => {
    var { datetime, timestep, onChangeDatetime } = this.props;
    onChangeDatetime(new Date(datetime.getTime() + timestep * 60 * 1000));
  };
  skipBackwards = () => {
    var { datetime, timestep, onChangeDatetime } = this.props;
    onChangeDatetime(new Date(datetime.getTime() - timestep * 60 * 1000));
  };
  moveOneTimestep = async () => {
    var {
      datetime,
      timestep,
      maxdatetime,
      mindatetime,
      onChangeDatetime,
    } = this.props;
    if (
      datetime.getTime() >= mindatetime.getTime() &&
      datetime.getTime() <= maxdatetime.getTime()
    ) {
      await onChangeDatetime(
        new Date(datetime.getTime() + timestep * 60 * 1000)
      );
    } else {
      clearIntervalAsync(this.timer);
      this.setState({ play: !this.state.play });
    }
  };

  togglePlay = () => {
    var { play } = this.state;
    if (!play) {
      //this.timer = d3.interval(this.moveOneTimestep, 3000);
      this.timer = setIntervalAsync(async () => {
        await this.moveOneTimestep();
      }, 1500);
    } else {
      //this.timer.stop();
      clearIntervalAsync(this.timer);
    }
    this.setState({ play: !play });
  };
  toggleModal = (modal) => {
    if (this.state.modal) {
      this.setState({ modal: false });
    } else {
      this.setState({ modal });
    }
  };
  lableTimestep = (mins) => {
    if (Number.isInteger(mins / (60 * 24 * 7))) {
      var weeks = mins / (60 * 24 * 7);
      if (weeks === 1) {
        return "1 week";
      } else {
        return weeks + " weeks";
      }
    } else if (Number.isInteger(mins / (60 * 24))) {
      var days = mins / (60 * 24);
      if (days === 1) {
        return "1 day";
      } else {
        return days + " days";
      }
    } else if (Number.isInteger(mins / 60)) {
      var hours = mins / 60;
      if (hours === 1) {
        return "1 hour";
      } else {
        return hours + " hours";
      }
    } else {
      return mins + " mins";
    }
  };

  render() {
    var {
      datetime,
      depth,
      timestep,
      onChangeDatetime,
      onChangeDepth,
      onChangeTimestep,
      mindatetime,
      maxdatetime,
      mindepth,
      maxdepth,
      selectedlayers,
    } = this.props;
    var { modal, play } = this.state;
    var months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return (
      <React.Fragment>
        <div className="shading" />
        <div className="datetimedepthselector">
          <div className="timeselectionbar">
            <TimeSelector
              datetime={datetime}
              onChangeDatetime={onChangeDatetime}
              selectedlayers={selectedlayers}
              mindatetime={mindatetime}
              maxdatetime={maxdatetime}
            />
          </div>
          <div className="controlbar">
            <div className="playpause" title={play ? "Pause" : "Play"}>
              <img
                src={play ? pauseicon : playicon}
                onClick={this.togglePlay}
                alt="Play/ Pause button"
              />
            </div>
            <div
              className="skip"
              title="Skip Backwards"
              onClick={this.skipBackwards}
            >
              <img src={skipbackwardsicon} alt="Skip Backwards button" />
            </div>
            <div
              className="skip right"
              title="Skip Forwards. Edit period using the settings."
              onClick={this.skipForwards}
            >
              <img src={skipforwardsicon} alt="Skip Forwards button" />
              <div className="timestep-text right">
                {this.lableTimestep(timestep)}
              </div>
            </div>
            <div className="datetime">
              <div
                className="time text"
                title="Edit time"
                onClick={() => this.toggleModal("time")}
              >
                {datetime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div
                className="date text"
                title="Edit date"
                onClick={() => this.toggleModal("date")}
              >{`${datetime.getDate()} ${
                months[datetime.getMonth()]
              } ${datetime.getFullYear()}`}</div>
            </div>
            <div className="depthtimestep">
              <div
                className="depth text"
                title="Edit depth"
                onClick={() => this.toggleModal("depth")}
              >
                <img src={depthicon} alt="depth icon" />
                {` ${depth}m`}
              </div>
              <div
                className="timestep text"
                title="Edit timestep"
                onClick={() => this.toggleModal("timestep")}
              >
                <img src={clockicon} alt="clock icon" className="clock" />
              </div>
            </div>
          </div>
        </div>
        {modal && (
          <SelectorModal
            modal={modal}
            toggleModal={this.toggleModal}
            datetime={datetime}
            depth={depth}
            mindepth={mindepth}
            maxdepth={maxdepth}
            timestep={timestep}
            selectedlayers={selectedlayers}
            onChangeDatetime={onChangeDatetime}
            onChangeDepth={onChangeDepth}
            onChangeTimestep={onChangeTimestep}
            lableTimestep={this.lableTimestep}
          />
        )}
      </React.Fragment>
    );
  }
}

export default DatetimeDepthSelector;
