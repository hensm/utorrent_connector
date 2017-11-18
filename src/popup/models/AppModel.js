"use strict";

import { observable
       , computed
       , action
       , runInAction } from "mobx";


class AppModel {
    api;

    @observable loading = true;
    @observable failed  = false;

    @computed
    get loaded () {
        return !this.loading && !this.failed;
    }

    constructor () {
        this.initialize_api();
    }


    @action
    async initialize_api () {
        const { options } = await browser.storage.sync.get("options");

        runInAction(async () => {
            this.api = new utorrent_api({
                protocol : options.protocol
              , host     : options.host
              , port     : options.port
              , username : options.username
              , password : options.password
            });

            if (await this.api.test()) {
                runInAction(() => {
                    this.loading = false;
                });
            } else {
                runInAction(() => {
                    this.loading = false;
                    this.failed = true;
                });
            }
        });
    }
}

export default AppModel;
