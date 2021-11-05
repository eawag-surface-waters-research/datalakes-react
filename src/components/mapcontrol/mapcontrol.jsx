import React, { Component } from "react";
import "./mapcontrol.css";
import print from "./img/print.svg";
import info from "./img/info.svg";

class MapControl extends Component {
  state = {};
  print = () => {
    window.print();
  };
  render() {
    var {
      zoomIn,
      zoomOut,
      toggleFullsize,
      fullsize,
      controls,
      help,
      toggleHelp,
    } = this.props;
    var fulllabel = "Fullscreen";
    var fullicon = "\u21F1";
    if (fullsize) {
      fulllabel = "Shrink Map";
      fullicon = "\u21F2";
    }
    var othercontrol = [];
    if (Array.isArray(controls)) {
      for (var i = 0; i < controls.length; i++) {
        var { active, onClick, img, title } = controls[i];
        var classes = ["mapcontrol-item"];
        if (active) {
          classes.push("active");
        } else {
          classes.push("outline");
        }
        if (i === 0) {
          classes.push("top");
        } else if (i === controls.length - 1) {
          classes.push("bottom");
        } else {
          classes.push("middle");
        }
        othercontrol.push(
          <div key={title} className={classes.join(" ")} onClick={onClick}>
            <img src={img} alt={title} />
            <span>{title}</span>
          </div>
        );
      }
    }
    return (
      <div className="mapcontrol">
        <div className="zoomcontrol">
          <div className="mapcontrol-item one" onClick={zoomIn} title="Zoom In">
            +
          </div>
          <div
            className="mapcontrol-item two"
            onClick={zoomOut}
            title="Zoom Out"
          >
            −
          </div>
          <div
            className="mapcontrol-item three"
            onClick={toggleFullsize}
            title={fulllabel}
          >
            {fullicon}
          </div>
        </div>
        <div className="othercontrol">{othercontrol}</div>
        {toggleHelp ? (
          <div className="othercontrol">
            <div
              className="mapcontrol-item top outline"
              onClick={this.print}
              title="Print"
            >
              <img src={print} alt="print" />
              <span>Print</span>
            </div>
            <div
              className={
                help
                  ? "mapcontrol-item bottom active"
                  : "mapcontrol-item bottom outline"
              }
              onClick={toggleHelp}
              title="Info"
            >
              <img src={info} alt="info" />
              <span>Info</span>
            </div>
          </div>
        ) : (
          <div
            className="mapcontrol-item outline"
            onClick={window.print()}
            title="Print"
          >
            <img src={print} alt="print" />
            <span>Print</span>
          </div>
        )}
      </div>
    );
  }
}

export default MapControl;
