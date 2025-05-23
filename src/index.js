import React from "react";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/browser";
import { Provider } from 'react-redux';
import store from './store';
import App from "./App";
import "./index.css";

Sentry.init({
  dsn: "https://5508326752474203bf9d35bb17d0f769@o1106970.ingest.sentry.io/6729365",
});

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
