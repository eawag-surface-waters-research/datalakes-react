import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import ReactGA from "react-ga";
import asyncComponent from "./components/asynccomponent/asynccomponent";
import ErrorBoundary from "./errorboundary/errorboundary";
import Header from "./format/header/header";
import Footer from "./format/footer/footer";
import Home from "./pages/home/home";
import NotFound from "./pages/notfound/notfound";
import DataPortal from "./pages/dataportal/dataportal";
import AddDataset from "./pages/adddataset/adddataset";
import Monitor from "./pages/monitor/monitor";
import LakeMorphology from "./pages/lakemorphology/lakemorphology";
import Publish from "./pages/publish/publish";
import "./index.css";
import MapViewer from "./pages/mapviewer/mapviewer";

const AsyncDataDetail = asyncComponent(() =>
  import("./pages/datadetail/datadetail")
);
const AsyncAPI = asyncComponent(() => import("./pages/api/api"));

ReactGA.initialize("UA-186400369-1");
ReactGA.pageview(window.location.pathname + window.location.search);

class App extends Component {
  render() {
    var iframe = window.location.href.includes("?iframe");
    return (
      <BrowserRouter>
        {!iframe && <Header />}
        <main>
          <Switch>
            <Route
              path="/map"
              exact
              render={(props) => (
                <ErrorBoundary {...props}>
                  <MapViewer {...props} />
                </ErrorBoundary>
              )}
            />

            <Route
              path="/data"
              render={(props) => (
                <ErrorBoundary {...props}>
                  <DataPortal {...props} />
                </ErrorBoundary>
              )}
            />

            <Route
              path="/datadetail"
              render={(props) => (
                <ErrorBoundary {...props}>
                  <AsyncDataDetail {...props} />
                </ErrorBoundary>
              )}
            />

            <Route
              path="/lakemorphology"
              render={(props) => (
                <ErrorBoundary {...props}>
                  <LakeMorphology {...props} />
                </ErrorBoundary>
              )}
            />

            <Route
              path="/API"
              render={(props) => (
                <ErrorBoundary {...props}>
                  <AsyncAPI {...props} />
                </ErrorBoundary>
              )}
            />

            <Route
              path="/adddataset"
              render={(props) => (
                <ErrorBoundary {...props}>
                  <AddDataset {...props} />
                </ErrorBoundary>
              )}
            />

            <Route
              path="/monitor"
              render={(props) => (
                <ErrorBoundary {...props}>
                  <Monitor {...props} />
                </ErrorBoundary>
              )}
            />

            <Route
              path="/publish"
              render={(props) => (
                <ErrorBoundary {...props}>
                  <Publish {...props} />
                </ErrorBoundary>
              )}
            />

            <Route
              path="/"
              render={(props) => (
                <ErrorBoundary {...props}>
                  <Home {...props} />
                </ErrorBoundary>
              )}
              exact
            />

            <Route
              path="/"
              render={(props) => (
                <ErrorBoundary {...props}>
                  <NotFound {...props} />
                </ErrorBoundary>
              )}
            />
          </Switch>
        </main>
        {!iframe && <Footer />}
      </BrowserRouter>
    );
  }
}

export default App;
