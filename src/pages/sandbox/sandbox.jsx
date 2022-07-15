import React, { Component } from "react";
import Loading from "../../components/loading/loading";
import sandbox_2 from "./img/sandbox_2.svg";
import "./sandbox.css";

class Sandbox extends Component {
  state = {
    menu: window.screen.width < 900 ? false : true,
    loading: false,
  };
  hideMenu = () => {
    this.setState({ menu: false }, () => {
      window.dispatchEvent(new Event("resize"));
    });
  };

  showMenu = () => {
    this.setState({ menu: true }, () => {
      window.dispatchEvent(new Event("resize"));
    });
  };
  render() {
    document.title = "Sandbox - Datalakes";
    var { menu } = this.state;
    return (
      <div className="sandbox">
        <div
          className={menu ? "sidebar" : "sidebar min"}
          onClick={!menu ? this.showMenu : () => {}}
        >
          <div className="boundary" />
          <div
            className={menu ? "siderbar-mini hide" : "siderbar-mini"}
            title="Click to open menu."
          >
            &#9776;
            <div className="rotate">Edit Datasets</div>
          </div>
          <div className={menu ? "sidebar-inner" : "sidebar-inner hide"}>

          </div>
          <div className={menu ? "sidebar-buttons" : "sidebar-buttons hide"}>
            <button className="hidemenu" onClick={this.hideMenu}>
              Hide Menu
            </button>
            <button className="addlayers">Add Dataset</button>
          </div>
        </div>
        <div className={menu ? "plot" : "plot min"}>
          <div className="empty">
            <img src={sandbox_2} alt="Sandbox" />
            <div>Add some datasets to start plotting.</div>
          </div>
          {this.state.loading && (
            <div className="plot-loading">
              <div className="plot-loading-inner">
                <Loading />
                Loading Layers
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Sandbox;
