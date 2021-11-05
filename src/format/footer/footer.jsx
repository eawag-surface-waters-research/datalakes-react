import React, { Component } from 'react';
import epfl from './img/epfl.png';
import eawag from './img/eawag.png';
import geneve from './img/geneve.png';
import carrtel from './img/carrtel.png';
import sdsc from './img/sdsc.png';
import unil from './img/unil.png';
import twitter from './img/twitter.png';
import './footer.css';

class Footer extends Component {
    render() { 
         return ( 
            <footer>
              <div className="container">
                  <div className="partners">
                      <a className="partner-logo" rel="noopener noreferrer" href="https://www.eawag.ch/en/department/siam/projects/datalakes/" target="_blank" title="Visit the Eawag project page for datalakes">
                          <img alt="Eawag Logo" src={eawag} />
                      </a>
                      <a className="partner-logo" rel="noopener noreferrer" href="https://datascience.ch/project/data-platform-and-bayesian-forecasting-of-swiss-lakes-datalakes/" target="_blank" title="Visit the SDSC project page for datalakes">
                          <img alt="SDSC Logo" src={sdsc} />
                      </a>
                      <a className="partner-logo" rel="noopener noreferrer" href="https://www.epfl.ch/research/domains/limnc/projects/lexplore/" target="_blank" title="Visit the EPFL project page for the L'EXPLORE platform">
                          <img alt="EPFL Logo" src={epfl} />
                      </a>
                      <a className="partner-logo" rel="noopener noreferrer" href="https://wp.unil.ch/lexplore/" target="_blank" title="Visit the UNIL project page for the L'EXPLORE platform">
                          <img alt="UNIL Logo" src={unil} />
                      </a>
                      <a className="partner-logo" rel="noopener noreferrer" href="https://www.unige.ch/sciences/terre/en/highlights/lexplore-floating-laboratory-study-lake-geneva/" target="_blank" title="Visit the UNIGE news page for the L'EXPLORE platform">
                          <img alt="Universite de Geneve Logo" src={geneve} />
                      </a>
                      <a className="partner-logo" rel="noopener noreferrer" href="https://www6.dijon.inrae.fr/thonon/" target="_blank" title="Visit the CARRTEL news page for the L'EXPLORE platform">
                          <img alt="Carrtel Logo" src={carrtel} />
                      </a>
                  </div>
                  <div className="copyright">
                      <span className="contact">
                          <a href="https://twitter.com/Datalakes1" title="Check out our Twitter page" className="contact-inner">
                              <img src={twitter} alt="Twitter" />
                          </a>
                      </span>
                      <div className="inline">Version 0.1 | Copyright © 2020 Datalakes | </div><div className="inline">&nbsp; Developed @ Eawag</div>
                </div>

              </div>
          </footer>
        );
    }
}
 
export default Footer;