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
import alplakes from "../../img/alplakes.png";
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
            to facilitate the visualisation and dissemination of reproducible
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
                  Discover and explore datasets based on geographic location
                  using our interactive map viewer.
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
                          Discover a wide range of remote sensing products and
                          hydrodynamic model data on Alplakes, the dedicated
                          sister site of Datalakes.
                          <a href="https://www.alplakes.eawag.ch/">
                            <button>
                              <img src={alplakes} alt="Alplakes" />
                            </button>
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="section about" ref={this.about}>
            <h1>About</h1>
            <div className="home-text">
              <p>
                Datalakes is an open-access sensor-to-front-end platform
                designed to search, visualize, and download data on Swiss lakes.
                It offers an interactive map viewer, a comprehensive data
                portal, and an API that serve researchers, public authorities,
                and citizens alike. Built on the principles of open science and
                FAIR data, Datalakes ensures that environmental information is
                transparent, reproducible, and ready for advanced analysis.
              </p>
              <h2>Vison</h2>
              <p>
                Data is the foundation of informed environmental action.
                Scientists, policymakers, and stakeholders rely on accurate and
                timely information to make decisions that impact ecosystems and
                society. However, data must be accessible, understandable, and
                interoperable to unlock its full potential—especially in the
                context of surface waters, where disciplines such as chemistry,
                physics, and biology intersect. With Datalakes, our vision is to
                provide the most advanced, user-friendly platform for accessing
                and exploring lake data in Switzerland. Currently supported
                primarily by Eawag, Datalakes’ vision is to evolve into a
                nationwide data infrastructure for Swiss lakes.
              </p>
              <h2>Contributing projects</h2>
              <p>
                <b>FLAKE (2025)</b>. This project aims to improve data quality
                assurance and quality control by enabling direct user
                interaction with an informed community. PI: N. Pasche, EPFL
                Partners. ENAC4IT, Eawag Funding ETH domain
              </p>
              <p>
                <b>Lake Monitoring on Swiss Lakes (2019 - ongoing)</b>. This
                initiative aims to establish a national long-term monitoring
                system for lake water temperatures in response to climate change
                impacts. PI: M. Schmid & D. Bouffard , Eawag Partners. Eawag,
                FOEN, Cantons Aargau, Bern, Fribourg, Ticino, Zug. Funding:
                FOEN, Cantons Aargau, Bern, Fribourg, Ticino, Zug Link:
                <a href="https://www.bafu.admin.ch/bafu/en/home/topics/water/state-of-lakes/wassertemperatur-seen.html">
                  https://www.bafu.admin.ch/bafu/en/home/topics/water/state-of-lakes/wassertemperatur-seen.html
                </a>
              </p>
              <p>
                <b>LéXPLORE (2019 - ongoing)</b> is an innovative open-water
                research platform on Lake Geneva, delivering high-frequency,
                multidisciplinary observations. Partners: Eawag, EPFL, UNIL,
                UNIGE, INRAE Link:{" "}
                <a href="https://lexplore.info">https://lexplore.info</a>
              </p>
              <p>
                <b>Greifensee (2020- ongoing)</b> is an innovative open-water
                research platform on Lake Greifen, delivering high-frequency,
                multidisciplinary observations. Partners Eawag
              </p>
              <p>
                <b>Aquascope (2021 - ongoing)</b>. The goal of this project is
                to Icollect high frequency images of planktonic microbes in
                their natural environment with an underwater plankton camera PI:
                F. Pomati, Eawag Partners Eawag Link:{" "}
                <a href="http://aquascope.ch">http://aquascope.ch</a>
              </p>
              <p>
                <b>Alplakes (2016- ongoing)</b>is a research initiative that
                provides accurate predictions of the condition of lakes
                throughout the European Alpine region. We integrate models and
                remote sensing products developed by the research community to
                provide the most up-to-date and accurate information possible.
                Partners Eawag Link:{" "}
                <a href="https://www.alplakes.eawag.ch/about">
                  https://www.alplakes.eawag.ch/about
                </a>
              </p>
              <h2>Contributors 2025</h2>
              <ul>
                <li>Canton Aargau</li>
                <li>Canton Bern</li>
                <li>Canton Fribourg</li>
                <li>Canton Ticino</li>
                <li>Canton Vaud</li>
                <li>Canton Zug</li>
                <li>Eawag</li>
                <li>EPFL</li>
                <li>FOEN</li>
                <li>INRAE</li>
                <li>UNIGE</li>
                <li>UNIL</li>
              </ul>
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
