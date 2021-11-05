import React, { Component } from "react";
import { apiUrl } from "../../config.json";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import "./api.css";

class API extends Component {
  render() {
    document.title = "API - Datalakes";
    return (
      <React.Fragment>
        <h1>Datalakes API</h1>
        <div className="doc-desc">
          Documentation for the Datalakes API is generated automatically using {" "}
          <a
            href="https://swagger.io/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Swagger.
          </a>
          <p>[ Base URL: https://api.datalakes-eawag.ch ]</p>
        </div>
        <div className="api-container">
          <SwaggerUI url={apiUrl + "/docs"} docExpansion="list" />
        </div>
      </React.Fragment>
    );
  }
}

export default API;
