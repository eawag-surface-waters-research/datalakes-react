import React, { Component } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import "./datetimedepthselector.css";
import DepthSelector from "./depthselector";

class TimeModal extends Component {
  scrollHour = (event) => {
    var { changeTime } = this.props;
    if (event.deltaY < 0) {
      changeTime(3600);
    } else if (event.deltaY > 0) {
      changeTime(-3600);
    }
  };
  scrollMins = (event) => {
    var { changeTime } = this.props;
    if (event.deltaY < 0) {
      changeTime(60);
    } else if (event.deltaY > 0) {
      changeTime(-60);
    }
  };
  escFunction = (event) => {
    if (event.keyCode === 27) {
      this.props.closeTime();
    }
  };
  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }
  render() {
    var { datetime, changeTime, closeTime } = this.props;
    var hours = datetime.getHours();
    var hstring = hours < 10 ? "0" + hours : hours.toString();
    var mins = datetime.getMinutes();
    var mstring = mins < 10 ? "0" + mins : mins.toString();
    return (
      <div className="selectorbox">
        <div className="closemodal" onClick={closeTime}>
          <div className="icon">&#10005;</div>
        </div>
        <div className="editor time">
          <table>
            <tbody>
              <tr>
                <td className="modalarrow" onClick={() => changeTime(3600)}>
                  &#9650;
                </td>
                <td></td>
                <td className="modalarrow" onClick={() => changeTime(60)}>
                  &#9650;
                </td>
                <td></td>
              </tr>
              <tr>
                <td onWheel={this.scrollHour}>{hstring}</td>
                <td>:</td>
                <td onWheel={this.scrollMins}>{mstring}</td>
                <td>{hours < 12 ? "AM" : "PM"}</td>
              </tr>
              <tr>
                <td className="modalarrow" onClick={() => changeTime(-3600)}>
                  &#9660;
                </td>
                <td></td>
                <td className="modalarrow" onClick={() => changeTime(-60)}>
                  &#9660;
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

class DateModal extends Component {
  changeDate = (datetime) => {
    var { toggleModal, onChangeDatetime, datetime: datetimeold } = this.props;
    var hours = datetimeold.getHours();
    var mins = datetimeold.getMinutes();
    datetime = new Date(datetime.getTime() + (hours * 3600 + mins * 60) * 1000);
    toggleModal();
    onChangeDatetime(datetime);
  };
  escFunction = (event) => {
    var { toggleModal } = this.props;
    if (event.keyCode === 27) {
      toggleModal();
    }
  };
  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }
  render() {
    var { datetime, toggleModal } = this.props;
    return (
      <div className="selectorbox">
        <div className="closemodal" onClick={toggleModal}>
          <div className="icon">&#10005;</div>
        </div>
        <div className="editor date">
          <Calendar onChange={this.changeDate} value={datetime} />
        </div>
      </div>
    );
  }
}

class DepthModal extends Component {
  changeDepth = (depth) => {
    var { toggleModal, onChangeDepth } = this.props;
    toggleModal();
    onChangeDepth(depth);
  };
  escFunction = (event) => {
    if (event.keyCode === 27) {
      this.close();
    }
  };
  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }
  render() {
    var { depth, selectedlayers, mindepth, maxdepth, toggleModal } = this.props;
    return (
      <div className="selectorbox">
        <div className="closemodal" onClick={toggleModal}>
          <div className="icon">&#10005;</div>
        </div>
        <div className="editor depth">
          <DepthSelector
            depth={depth}
            onChangeDepth={this.changeDepth}
            selectedlayers={selectedlayers}
            mindepth={mindepth}
            maxdepth={maxdepth}
          />
        </div>
      </div>
    );
  }
}

class TimestepModal extends Component {
  changeTimestep = (timestep) => {
    var { toggleModal, onChangeTimestep } = this.props;
    toggleModal();
    onChangeTimestep(timestep);
  };

  escFunction = (event) => {
    if (event.keyCode === 27) {
      this.close();
    }
  };
  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }
  render() {
    var { lableTimestep, timestep, toggleModal } = this.props;
    var timesteps = [
      5,
      10,
      20,
      30,
      60,
      3 * 60,
      6 * 60,
      12 * 60,
      24 * 60,
      2 * 24 * 60,
      7 * 24 * 60,
      4 * 7 * 24 * 60,
    ];
    return (
      <div className="selectorbox">
        <div className="closemodal" onClick={toggleModal}>
          <div className="icon">&#10005;</div>
        </div>
        <div className="editor timestep">
          <div className="timesteplist">
            {timesteps.map((t) => (
              <div
                className={t === timestep ? "item selected" : "item"}
                key={t}
                onClick={() => this.changeTimestep(t)}
              >
                {lableTimestep(t)}
              </div>
            ))}
          </div>
          Animation Timestep
        </div>
      </div>
    );
  }
}

class SelectorModal extends Component {
  state = {
    datetime: this.props.datetime,
  };
  changeTime = (interval) => {
    var { datetime } = this.state;
    datetime = new Date(datetime.getTime() + interval * 1000);
    this.setState({ datetime });
  };
  closeModal = (event) => {
    var { toggleModal, onChangeDatetime } = this.props;
    if (event.target.className === "modalfull") {
      toggleModal();
      if (this.state.datetime.getTime() !== this.props.datetime.getTime()) {
        onChangeDatetime(this.state.datetime);
      }
    }
  };
  closeTime = () => {
    var { toggleModal, onChangeDatetime } = this.props;
    toggleModal();
    onChangeDatetime(this.state.datetime);
  };
  render() {
    var {
      datetime,
      depth,
      timestep,
      onChangeDatetime,
      onChangeTimestep,
      onChangeDepth,
      modal,
      toggleModal,
      lableTimestep,
      mindepth,
      maxdepth,
      selectedlayers,
    } = this.props;
    var { datetime: time } = this.state;
    return (
      <div className="selectormodal" onClick={this.closeModal}>
        <table>
          <tbody>
            <tr>
              <td className="modalfull">
                {modal === "time" && (
                  <TimeModal
                    datetime={time}
                    toggleModal={toggleModal}
                    changeTime={this.changeTime}
                    closeTime={this.closeTime}
                  />
                )}
                {modal === "date" && (
                  <DateModal
                    datetime={datetime}
                    toggleModal={toggleModal}
                    onChangeDatetime={onChangeDatetime}
                  />
                )}
                {modal === "depth" && (
                  <DepthModal
                    depth={depth}
                    toggleModal={toggleModal}
                    onChangeDepth={onChangeDepth}
                    mindepth={mindepth}
                    maxdepth={maxdepth}
                    selectedlayers={selectedlayers}
                  />
                )}
                {modal === "timestep" && (
                  <TimestepModal
                    timestep={timestep}
                    toggleModal={toggleModal}
                    onChangeTimestep={onChangeTimestep}
                    lableTimestep={lableTimestep}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default SelectorModal;
