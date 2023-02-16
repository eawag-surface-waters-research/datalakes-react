import React, { Component } from "react";
import { Link } from "react-router-dom";
import epfl from "../../img/epfl.png";
import epflc from "../../img/epflc.png";
import eawag from "../../img/eawag.png";
import eawagc from "../../img/eawagc.png";
import unil from "../../img/unil.png";
import unilc from "../../img/unilc.png";
import geneve from "../../img/geneve.png";
import genevec from "../../img/genevec.png";
import carrtel from "../../img/carrtel.png";
import carrtelc from "../../img/carrtelc.png";
import sdsc from "../../img/sdsc.png";
import sdscc from "../../img/sdscc.png";
import james from "../../img/james.png";
import damien from "../../img/damien.jpg";
import map from "../../img/map.png";
import data from "../../img/data.png";
import api from "../../img/api.png";
import "./home.css";

class PartnerBanner extends Component {
  state = {};
  render() {
    return (
      <React.Fragment>
        <div className="home-partners" title="Our partners">
          <a
            className="partner-logo"
            rel="noopener noreferrer"
            href="https://www.eawag.ch/en/department/siam/projects/datalakes/"
            target="_blank"
            title="Visit the Eawag project page for datalakes"
          >
            <img alt="Eawag Logo" src={eawag} className="black" />
            <img alt="Eawag Logo" src={eawagc} className="color" />
          </a>
          <a
            className="partner-logo"
            rel="noopener noreferrer"
            href="https://datascience.ch/project/data-platform-and-bayesian-forecasting-of-swiss-lakes-datalakes/"
            target="_blank"
            title="Visit the SDSC project page for datalakes"
          >
            <img alt="SDSC Logo" src={sdsc} className="black" />
            <img alt="SDSC Logo" src={sdscc} className="color" />
          </a>
          <a
            className="partner-logo"
            rel="noopener noreferrer"
            href="https://www.epfl.ch/research/domains/limnc/projects/lexplore/"
            target="_blank"
            title="Visit the EPFL project page for the L'EXPLORE platform"
          >
            <img alt="EPFL Logo" src={epfl} className="black" />
            <img alt="EPFL Logo" src={epflc} className="color" />
          </a>
          <a
            className="partner-logo"
            rel="noopener noreferrer"
            href="https://wp.unil.ch/lexplore/"
            target="_blank"
            title="Visit the UNIL project page for the L'EXPLORE platform"
          >
            <img alt="UNIL Logo" src={unil} className="black" />
            <img alt="UNIL Logo" src={unilc} className="color" />
          </a>
          <a
            className="partner-logo"
            rel="noopener noreferrer"
            href="https://www.unige.ch/sciences/terre/en/highlights/lexplore-floating-laboratory-study-lake-geneva/"
            target="_blank"
            title="Visit the UNIGE news page for the L'EXPLORE platform"
          >
            <img
              alt="Universite de Geneve Logo"
              src={geneve}
              className="black"
            />
            <img
              alt="Universite de Geneve Logo"
              src={genevec}
              className="color"
            />
          </a>
          <a
            className="partner-logo"
            rel="noopener noreferrer"
            href="https://www6.lyon-grenoble.inrae.fr/carrtel"
            target="_blank"
            title="Visit the CARRTEL news page for the L'EXPLORE platform"
          >
            <img alt="Carrtel Logo" src={carrtel} className="black" />
            <img alt="Carrtel Logo" src={carrtelc} className="color" />
          </a>
        </div>
      </React.Fragment>
    );
  }
}

class Home extends Component {
  constructor(props) {
    super(props);
    this.home = React.createRef();
    this.ourdata = React.createRef();
    this.accessoptions = React.createRef();
    this.about = React.createRef();
    this.contact = React.createRef();
    this.insitu = React.createRef();
    this.simulation = React.createRef();
    this.rs = React.createRef();
  }
  componentDidMount() {
    this.parseSearch();
  }
  componentDidUpdate() {
    this.parseSearch();
  }

  parseSearch = () => {
    try {
      var { search } = this.props.location;
      if (search) {
        if (search === "?home") this.scrollTo(this.home, -50);
        if (search === "?ourdata") this.scrollTo(this.ourdata, -50);
        if (search === "?accessoptions") this.scrollTo(this.accessoptions, -50);
        if (search === "?about") this.scrollTo(this.about, -100);
        if (search === "?contact") this.scrollTo(this.contact, -50);
      }
    } catch (e) {
      console.log(e);
    }
  };

  scrollTo = (rf, plus) => {
    window.scrollTo({
      top: rf.current.offsetTop + plus,
      behavior: "smooth",
    });
  };

  render() {
    document.title =
      "Datalakes - Search, visualise and download data on Swiss lakes";
    return (
      <React.Fragment>
        <div className="home" ref={this.home}>
          <div id="home-banner" className="home-banner">
            <div className="home-tagline">
              Search, visualise and download data on Swiss lakes.
            </div>

            <button onClick={() => this.scrollTo(this.ourdata, -50)}>
              Find out more
            </button>
          </div>

          <PartnerBanner />

          <div className="sectiontitle" ref={this.ourdata}>
            Datalakes is a collaboration between a number of Swiss institutions
            to facilitate the visualisation and dissemination of reproducable
            datasets for Swiss lakes.
          </div>

          <div className="section access">
            <Link to="/map">
              <div className="box">
                <div className="box-header">Map Viewer</div>
                <div className="box-img">
                  <img src={map} alt="map" />
                </div>
                <div className="box-text">
                  Build multi-layered maps of insitu-data, remote sensing and 3d
                  models in our Web-GIS application.
                </div>
              </div>
            </Link>
            <Link to="/data">
              <div className="box">
                <div className="box-header">Data Portal</div>
                <div className="box-img">
                  <img src={data} alt="data" />
                </div>
                <div className="box-text">
                  Find interesting datasets, visualise the data, download and
                  access each datasets reproducable data pipeline.
                </div>
              </div>
            </Link>
            <Link to="/api">
              <div className="box">
                <div className="box-header">API</div>
                <div className="box-img">
                  <img src={api} alt="api" />
                </div>
                <div className="box-text">
                  Build automated applications that connect to Datalakes through
                  our API.
                </div>
              </div>
            </Link>
          </div>

          <div className="section insitudata" ref={this.insitu}>
            <div className="img">
              <div className="outer">
                <div className="inner">
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          Discover years of sampling and insitu data
                          measurements from across Switzerland.
                          <Link to="/data">
                            <button>Explore our data portal</button>
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="sectiontitle" ref={this.accessoptions}>
            Datalakes is helping drive limnology into the digital era with a
            step change in reproducability.
            <div className="acc">
              <div className="lw">
                <div className="letter">F</div>
                <div className="word">indable</div>
              </div>
              <div className="lw">
                <div className="letter">A</div>
                <div className="word">ccessible</div>
              </div>
              <div className="lw">
                <div className="letter">I</div>
                <div className="word">nteroperable</div>
              </div>
              <div className="lw">
                <div className="letter">R</div>
                <div className="word">eusable</div>
              </div>
            </div>
          </div>

          <div className="section rs" ref={this.rs}>
            <div className="img">
              <div className="outer">
                <div className="inner">
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          Access years of remotely sensed water quality
                          parameters for water bodies across Switerland.
                          <Link to="/datadetail/20">
                            <button>Chlorophyll Concentration</button>
                          </Link>
                          <Link to="/datadetail/21">
                            <button>Total Suspended Matter</button>
                          </Link>
                          <Link to="/datadetail/19">
                            <button>Secchi Depth</button>
                          </Link>
                          <Link to="/datadetail/25">
                            <button>Whiting</button>
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="section about" ref={this.about}>
            <h1>About Datalakes</h1>
            <div className="home-text">
              <div>
                <b>
                  Heterogeneous data platform for operational modeling and
                  forecasting of Swiss lakes
                </b>
              </div>
              <p>
                Developer:{" "}
                <a
                  href="https://www.eawag.ch/en/aboutus/portrait/organisation/staff/profile/james-runnalls/show/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  James Runnalls
                </a>
              </p>
              <p>
                Principle Investigators:{" "}
                <a
                  href="https://www.eawag.ch/en/aboutus/portrait/organisation/staff/profile/damien-bouffard/show/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Damien Bouffard
                </a>{" "}
                &{" "}
                <a
                  href="https://www.eawag.ch/en/aboutus/portrait/organisation/staff/profile/jonas-sukys/show/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Jonas Šukys
                </a>
              </p>
              <p>
                Remote Sensing:{" "}
                <a
                  href="https://www.eawag.ch/en/aboutus/portrait/organisation/staff/profile/daniel-odermatt/show/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Daniel Odermatt
                </a>
              </p>
              <p>
                This project is a collaboration between Eawag and the Swiss Data
                Science Center (SDSC)
              </p>
              <p>
                Predicting the evolution of freshwater systems is the impetus of
                many limnologists. Technological developments have opened
                countless ways to investigate these systems, with the drawback
                that scientists are today overwhelmed by data. Efficiently
                utilizing the benefits of present-day data and technology
                requires optimizing the way data is shared and reused. The means
                of acquisition and computational processing of third-party data
                are often non transparent, and hence irreproducible after the
                end of the project’s timeframe.
              </p>
              <p>
                With the recent development of an operational interdisciplinary
                in-situ floating laboratory (LéXPLORE, https://lexplore.info/)
                on Lake Geneva, we identified the need for a user-friendly web
                based open access data platform to foster scientific data
                exchange: https://www.datalakes-eawag.ch/. The main objective
                was to provide a fully open access sensor-to-front end platform
                for scientific data in Swiss lakes. The Datalakes platform
                incorporates continuous in-situ acquisition, storage, curation,
                patching, visualization, and extraction frameworks of
                environmental data and model output, together with an accessible
                online interface for visualization of historical data, future
                predictions, and user-friendly online data extraction.
              </p>
              <p>
                We invite interested scientists to use Datalakes, and to
                visualize and download our initial datasets. We also welcome
                feedback and the inclusion of new data, products or models that
                will be of use to the Swiss freshwater community via this newly
                developed open access data infrastructure.
              </p>
            </div>
            <div className="contacts">
              <div className="contact">
                <img src={james} alt="Portrait James" />
                <div className="text">
                  For all queries regarding the functioning of the Datalakes web
                  application please email James Runnalls.
                  <p>
                    <b>James.Runnalls@eawag.ch</b>
                  </p>
                </div>
              </div>
              <div className="contact">
                <img src={damien} alt="Portrait Damien" />
                <div className="text">
                  For all queries regarding the Datalakes project and for
                  possible collaborations please email Damien Bouffard.
                  <p>
                    <b>Damien.Bouffard@eawag.ch</b>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Home;
