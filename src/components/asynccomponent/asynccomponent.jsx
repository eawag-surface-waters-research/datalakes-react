import React, { Component } from "react";
import Loading from "../loading/loading";

export default function asyncComponent(importComponent) {
  class AsyncComponent extends Component {
    state = {
      component: null,
    };

    async componentDidMount() {
      const { default: component } = await importComponent();

      this.setState({
        component: component,
      });
    }

    render() {
      const C = this.state.component;

      return C ? (
        <C {...this.props} />
      ) : (
        <table style={{ width: "100%", height: "400px", textAlign: "center" }}>
          <tbody>
            <tr>
              <td>
                <Loading />
                Loading Data
              </td>
            </tr>
          </tbody>
        </table>
      );
    }
  }

  return AsyncComponent;
}
