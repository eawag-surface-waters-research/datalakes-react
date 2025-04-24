import React, { Component } from "react";
import "./addlayers.css";

class AddLayersInnerInner extends Component {
  state = {
    open: false,
  };
  toggle = () => {
    this.setState({ open: !this.state.open });
  };
  getLake = (id) => {
    var { lakes } = this.props;
    return lakes.find((l) => l.id === id).name;
  };
  formatDate = (datetime) => {
    var a = new Date(datetime);
    var year = a.getFullYear();
    var month = a.getMonth() + 1;
    var date = a.getDate();
    return `${date < 10 ? "0" + date : date}.${
      month < 10 ? "0" + month : month
    }.${String(year).slice(-2)}`;
  };
  render() {
    var { open } = this.state;
    var { parameters_id, parameters, datasets_ids, datasets, addSelected } =
      this.props;
    var parameter = parameters.find((p) => p.id === parameters_id);
    var subdatasets = datasets.filter((d) => datasets_ids.includes(d.id));

    return (
      <div key={parameters_id} className="addlayers-layer">
        <div className="addlayers-titlebar" onClick={this.toggle}>
          <div className="addlayers-title">{parameter.name}</div>
          <div className="addlayers-symbol" title="See individual layers">
            {open ? "-" : "+"}
          </div>
        </div>

        {open && (
          <div className="addlayers-content">
            {subdatasets.map((sd) => {
              return (
                <div
                  onClick={() =>
                    addSelected([{ datasets_id: sd.id, parameters_id }])
                  }
                  className="addlayers-detail"
                  key={sd.id}
                  title="Add layer"
                >
                  <table>
                    <tbody>
                      <tr>
                        <td>{sd.title}</td>
                        <td>{this.getLake(sd.lakes_id)}</td>
                        <td>
                          {this.formatDate(sd.mindatetime)} :{" "}
                          {this.formatDate(sd.maxdatetime)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}

class AddLayersInner extends Component {
  render() {
    var { datasets, parameters, datasetparameters, addSelected, type } =
      this.props;

    var subdatasets = datasets.filter((d) => d.origin === type);
    var ids = subdatasets.map((s) => s.id);

    var subparameters = datasetparameters.filter(
      (p) =>
        ids.includes(p.datasets_id) &&
        ![1, 2, 3, 4, 27, 28, 29, 30].includes(p.parameters_id)
    );

    function filterparam(pid, params) {
      return params.filter((p) => p.parameters_id === pid);
    }

    function paramIndex(pid, params) {
      return params.findIndex((p) => p.parameters_id === pid);
    }

    var paramd = [];
    for (var i = 0; i < subparameters.length; i++) {
      var pd = filterparam(subparameters[i].parameters_id, paramd);
      if (pd.length === 0) {
        paramd.push({
          parameters_id: subparameters[i].parameters_id,
          datasets: [subparameters[i].datasets_id],
        });
      } else {
        var index = paramIndex(subparameters[i].parameters_id, paramd);
        paramd[index].datasets.push(subparameters[i].datasets_id);
      }
    }

    return (
      <div className="addlayers-box">
        {paramd.map((param) => (
          <AddLayersInnerInner
            key={param.parameters_id}
            parameters_id={param.parameters_id}
            datasets_ids={param.datasets}
            parameters={parameters}
            datasets={datasets}
            addSelected={addSelected}
            lakes={this.props.lakes}
          />
        ))}
      </div>
    );
  }
}

class AddLayers extends Component {
  state = {};
  render() {
    var { datasets, parameters, datasetparameters, addSelected } = this.props;
    return (
      <div className="addlayers">
        <AddLayersInner
          datasets={datasets}
          parameters={parameters}
          datasetparameters={datasetparameters}
          addSelected={addSelected}
          lakes={this.props.lakes}
          type="measurement"
        />
      </div>
    );
  }
}

export default AddLayers;
