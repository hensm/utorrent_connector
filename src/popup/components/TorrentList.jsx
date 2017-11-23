"use strict";

import React from "react";
import { observer } from "mobx-react";

import Torrent from "./Torrent";


@observer
class TorrentList extends React.Component {
    constructor (props) {
        super(props);
    }

    componentDidMount () {
        // Fetch initial data
        this.props.store.fetch_torrents();

        // Refresh data
        window.setInterval(() => {
            this.props.store.fetch_torrents();
        }, 1000);
    }

    render () {
        return (
            <div className="torrents-list">
                {
                    this.props.store.torrents.map(torrent => (
                        <Torrent
                            torrent={torrent}
                            torrent_list={this.props.store} />))
                }
            </div>
        );
    }
}

export default TorrentList;
