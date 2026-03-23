import React, { Component } from "react";
import eawag from "./img/eawag.png";
import node from "./img/node.png";
import react from "./img/react.png";
import "./footer.css";

class Footer extends Component {
  render() {
    return (
      <footer>
        <div className="container">
          <div className="copyright">
            <span className="contact">
              <a
                href="https://github.com/eawag-surface-waters-research/datalakes-react"
                title="Check out our open-source frontend (React-App) code."
                className="contact-inner"
              >
                <img src={react} alt="React" />
              </a>
              <a
                href="https://github.com/eawag-surface-waters-research/datalakes-nodejs"
                title="Check out our open-source backend (NodeJS) code"
                className="contact-inner"
              >
                <img src={node} alt="NodeJS" />
              </a>
            </span>
            <div className="inline">
              v2.0 | Copyright © {new Date().getFullYear()} Datalakes |{" "}
            </div>
            <div className="inline">
              &nbsp; Developed @{" "}
              <a
                className="partner-logo"
                rel="noopener noreferrer"
                href="https://www.eawag.ch/en/department/siam/projects/datalakes/"
                target="_blank"
                title="Visit the Eawag project page for datalakes"
              >
                <img alt="Eawag Logo" src={eawag} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    );
  }
}

export default Footer;
