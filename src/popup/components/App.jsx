"use strict";

import React from "react";

import { observer } from "mobx-react";

import TorrentList from "./TorrentList";
import TorrentListModel from "../models/TorrentListModel";


const _ = browser.i18n.getMessage;

@observer
class App extends React.Component {
    constructor (props) {
        super(props);
    }

    render () {
        return do {
            if (this.props.store.loaded) {
                <TorrentList
                    api={this.props.store.api}
                    store={new TorrentListModel(this.props.store.api)} />
            } else {
                if (this.props.store.loading) {
                    <div className="loading">
                        { _("popup_loading") }
                    </div>
                } else if (this.props.store.failed) {
                    <div className="error">
                        { _("popup_loading_failed") }
                    </div>
                }
            }
        }
    }
}

export default App;
