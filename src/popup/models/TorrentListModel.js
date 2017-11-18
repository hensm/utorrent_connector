"use strict";

import { observable
       , computed
       , action
       , runInAction } from "mobx";

import TorrentModel from "./TorrentModel";


class TorrentListModel {
    api;
    @observable torrents = [];
    @observable ui_pending = true;

    constructor (api) {
        this.api = api;
    }

    @action
    async fetch_torrents () {
        const { torrents } = await this.api.list();

        runInAction(() => {
            // Set torrents
            this.torrents = torrents.map(
                    torrent => new TorrentModel(this.api, torrent));

            this.ui_pending = false;
        });
    }

    @action
    add_torrent (details) {
        this.torrents.push(new TorrentModel(this.api, details));
    }

    @action
    async remove_torrent (hash) {
        this.api.remove(hash);
        this.torrents = this.torrents.filter(
                torrent => torrent.hash !== hash);
    }
}

export default TorrentListModel;
