"use strict";

import React    from "react";
import ReactDOM from "react-dom";

import App      from "./components/App";
import AppModel from "./models/AppModel";


/**
 * When API details change, refresh page for a new API
 * connection.
 */
browser.runtime.onMessage.addListener(
        ({ subject, payload }) => {

    switch (subject) {
        case "options_updated":
            window.location.reload();
            break;
    }
});

ReactDOM.render(
    <App store={new AppModel()} />
  , document.querySelector("#root"));
