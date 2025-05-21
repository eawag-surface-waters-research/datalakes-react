import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import asyncComponent from "./components/asynccomponent/asynccomponent";
import ErrorBoundary from "./errorboundary/errorboundary";
import Header from "./format/header/header";
import Footer from "./format/footer/footer";
import Home from "./pages/home/home";
import NotFound from "./pages/notfound/notfound";
import DataPortal from "./pages/dataportal/dataportal";
import AddDataset from "./pages/adddataset/adddataset";
import Monitor from "./pages/monitor/monitor";
import User from "./pages/user/user";
import RenkuUser from "./pages/user/renku";
import GitlabUser from "./pages/user/gitlab";
import LakeMorphology from "./pages/lakemorphology/lakemorphology";
import MapViewer from "./pages/mapviewer/mapviewer";
import "./index.css";

const AsyncDataDetail = asyncComponent(() =>
  import("./pages/datadetail/datadetail")
);
const AsyncAPI = asyncComponent(() => import("./pages/api/api"));

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
              path="/user"
              render={(props) => (
                <ErrorBoundary {...props}>
                  <User {...props} />
                </ErrorBoundary>
              )}
            />

            <Route
              path="/renku"
              render={(props) => (
                <ErrorBoundary {...props}>
                  <RenkuUser {...props} />
                </ErrorBoundary>
              )}
            />

            <Route
              path="/gitlab"
              render={(props) => (
                <ErrorBoundary {...props}>
                  <GitlabUser {...props} />
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
