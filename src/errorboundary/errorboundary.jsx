import React, { Component } from "react";
import * as Sentry from "@sentry/browser";
import bug from "./img/bug.svg";
import "./errorboundary.css";

class ErrorBoundary extends Component {
  state = { error: null, errorInfo: null };

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    Sentry.withScope((scope) => {
      Object.keys(errorInfo).forEach((key) => {
        scope.setExtra(key, errorInfo[key]);
      });
      Sentry.captureException(error);
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.setState({ error: null, errorInfo: null });
    }
  }

  render() {
    if (this.state.errorInfo) {
      return (
        <div className="errorboundary">
          <img src={bug} alt="bug" />
          You found a bug!
          <div className="error-inner">
            The developer has been notified. In the meantime try refreshing the
            page.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
