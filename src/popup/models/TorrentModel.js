"use strict";

import { observable
       , computed
       , action
       , runInAction } from "mobx";


class TorrentModel {
    api;

    @observable hash
    @observable name;
    @observable size;
    @observable progress;
    @observable download_speed;
    @observable downloaded;
    @observable upload_speed;
    @observable uploaded;
    @observable eta;
    @observable status;

    constructor (api, details) {
        this.api = api;

        this.hash           = details.hash;
        this.name           = details.name;
        this.size           = details.size;
        this.progress       = details.progress;
        this.download_speed = details.download_speed;
        this.downloaded     = details.downloaded;
        this.upload_speed   = details.upload_speed;
        this.uploaded       = details.uploaded;
        this.eta            = details.eta;
        this.status         = details.status;
    }


    @computed
    get is_started () {
        return this.status & utorrent_api.status.STARTED;
    }

    @computed
    get is_paused () {
        return this.status & utorrent_api.status.PAUSED;
    }

    @computed
    get is_completed () {
        return this.progress >= 1000;
    }


    @action
    async update () {
        const { torrents } = await this.api.list();
        const details = torrents.find(
                torrent => torrent.hash === this.hash);

        runInAction(() => {
            // Update props
            this.hash           = details.hash;
            this.name           = details.name;
            this.size           = details.size;
            this.progress       = details.progress;
            this.download_speed = details.download_speed;
            this.downloaded     = details.downloaded;
            this.upload_speed   = details.upload_speed;
            this.uploaded       = details.uploaded;
            this.eta            = details.eta;
            this.status         = details.status;
        });
    }


    @action
    async resume () {
        try {
            await this.api.start(this.hash);
            runInAction(this.update());
        } catch (err) {}
    }

    @action
    async pause () {
        try {
            await this.api.pause(this.hash);
            await this.update();
        } catch (err) {}
    }

    @action
    async stop () {
        try {
            await this.api.stop(this.hash);
            await this.update();
        } catch (err) {}
    }
}

export default TorrentModel;
