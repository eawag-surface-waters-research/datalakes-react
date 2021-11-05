import React, { Component } from "react";
import "./addlayers.css";
import FilterBox from "../filterbox/filterbox";

class AddLayersInnerInner extends Component {
  state = {
    open: false,
  };
  toggle = () => {
    this.setState({ open: !this.state.open });
  };
  render() {
    var { open } = this.state;
    var {
      parameters_id,
      parameters,
      datasets_ids,
      datasets,
      addSelected,
    } = this.props;
    var parameter = parameters.find((p) => p.id === parameters_id);
    var subdatasets = datasets.filter((d) => datasets_ids.includes(d.id));
    var datasetslink = subdatasets.map((s) => ({
      datasets_id: s.id,
      parameters_id,
    }));

    return (
      <div key={parameters_id} className="addlayers-layer">
        <div className="addlayers-titlebar">
          <div
            className="addlayers-title"
            onClick={() => addSelected(datasetslink)}
            title="Add layer group"
          >
            {parameter.name}
          </div>
          <div
            className="addlayers-symbol"
            title="See individual layers"
            onClick={this.toggle}
          >
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
                  {sd.title}
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
    var {
      datasets,
      parameters,
      datasetparameters,
      addSelected,
      type,
    } = this.props;

    var subdatasets = datasets.filter((d) => d.origin === type);
    var ids = subdatasets.map((s) => s.id);

    var subparameters = datasetparameters.filter(
      (p) =>
        ids.includes(p.datasets_id) && ![1, 2, 3, 4, 27, 28, 29, 30].includes(p.parameters_id)
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
      <React.Fragment>
        <FilterBox
          title="Measured Values"
          inner="true"
          content={
            <AddLayersInner
              datasets={datasets}
              parameters={parameters}
              datasetparameters={datasetparameters}
              addSelected={addSelected}
              type="measurement"
            />
          }
        />
        <FilterBox
          title="Satellite Data"
          inner="true"
          content={
            <AddLayersInner
              datasets={datasets}
              parameters={parameters}
              datasetparameters={datasetparameters}
              addSelected={addSelected}
              type="satellite"
            />
          }
        />
        <FilterBox
          title="Lake Simulations"
          inner="true"
          content={
            <AddLayersInner
              datasets={datasets}
              parameters={parameters}
              datasetparameters={datasetparameters}
              addSelected={addSelected}
              type="model"
            />
          }
        />
      </React.Fragment>
    );
  }
}

export default AddLayers;
