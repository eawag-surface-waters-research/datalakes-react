import React from "react";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/browser";
import App from "./App";
import "./index.css";

Sentry.init({
  dsn: "https://5508326752474203bf9d35bb17d0f769@o1106970.ingest.sentry.io/6729365",
});

ReactDOM.render(<App />, document.getElementById("root"));
