import React, { Component } from "react";
import "./errorboundary.css";

class ErrorBoundary extends Component {
  state = { error: null, errorInfo: null };

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    // You can also log error messages to an error reporting service here
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.setState({ error: null, errorInfo: null });
    }
  }

  render() {
    if (this.state.errorInfo) {
      // Error path
      return (
        <div className="errorboundary">
          <h2>Something went wrong.</h2>{" "}
          <h4>
            This information is currently unavailable, please try again later.
          </h4>
          <details style={{ whiteSpace: "pre-wrap" }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    // Normally, just render children
    return this.props.children;
  }
}

export default ErrorBoundary;
