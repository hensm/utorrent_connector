"use strict";

class utorrent_api {
    constructor (options) {
        // Fail without credentials
        if (!options.hasOwnProperty("username")) {
            throw `${this.constructor.name}: No username specified`;
        }
        if (!options.hasOwnProperty("password")) {
            throw `${this.constructor.name}: No password specified`;
        }

        // Defaults
        this.protocol = options.protocol || "http";
        this.host     = options.host     || "127.0.0.1";
        this.port     = options.port     || "8080";

        this.username = options.username;
        this.password = options.password;

        const self = this;

        /**
         * Generates a function with a predefined action for simple API
         * methods with a common pattern.
         *
         * @param type Type of action
         * @param multiple_hashes Whether function should accept multiple hashes
         */
        function action_base (type, use_multiple_hashes) {
            return function (hash) {
                const params = new URLSearchParams();
                params.append("action", type);

                const hashes = use_multiple_hashes
                    ? arguments
                    : [ hash ];

                for (const hash of hashes) {
                    params.append("hash", hash);
                }

                return self._do_api_request(params);
            }.bind(this);
        }


        // Common actions
        this.start       = action_base("start");
        this.stop        = action_base("stop");
        this.pause       = action_base("pause");
        this.unpause     = action_base("unpause");
        this.forcestart  = action_base("forcestart");
        this.recheck     = action_base("recheck");
        this.remove      = action_base("remove");
        this.removedata  = action_base("removedata");

        this.getprops    = action_base("getprops");
        this.getfiles    = action_base("getfiles", true);

        this.queuebottom = action_base("queuebottom", true);
        this.queuedown   = action_base("queuedown", true);
        this.queuetop    = action_base("queuetop", true);
        this.queueup     = action_base("queueup", true);
    }

    /**
     * Tests the configuration to see if a connection can be made.
     */
    async test () {
        try {
            const api_url  = await this._get_api_url();
            const api_info = await this._get_api_info();

            await this._get_token(api_url, api_info);

            return true;
        } catch (err) {
            return false;
        }
    }


    /**
     * Gets API endpoint URL.
     */
    _get_api_url () {
        return `${this.protocol}://${this.host}:${this.port}/gui`;
    }

    /**
     * Gets fetch init object for valid API requests. Includes HTTP
     * auth headers and correct cookie handling.
     */
    _get_api_info () {
        // Base64-encoded user:pass for HTTP auth
        const credentials = window.btoa(`${this.username}:${this.password}`);

        const headers = new Headers();
        headers.append("Authorization", `Basic ${credentials}`);

        return {
            headers,               // HTTP auth headers
            credentials: 'include' // Send cookies with request
        }
    }

    /**
     * Fetches and parses the token.html document to get a request
     * token for API requests.
     * 
     * Requires API params as it's always called from other request
     * functions that have already fetched them.
     *
     * @param api_url  API endpoint URL
     * @param api_info API fetch info
     */
    async _get_token (api_url, api_info) {
        const res_body = await fetch(`${api_url}/token.html`, api_info);
        const res_text = await res_body.text();

        const parser = new DOMParser();
        const token = parser
            .parseFromString(res_text, "text/html")
            .querySelector("#token")
            .textContent;

        // Return content of token div
        return token;
    }

    /**
     * Makes an API request and returns the result.
     *
     * @param url_params URLSearchParams object
     */
    async _do_api_request (url_params) {
        const api_url  = await this._get_api_url();
        const api_info = await this._get_api_info();

        // Append timestamp to request
        url_params.append("t", Date.now());

        // Token must come before other parameters for a valid request
        const token = await this._get_token(api_url, api_info);

        // Make request URL from params
        const url = `${api_url}/?token=${token}&${url_params.toString()}`;

        const res_body = await fetch(url, api_info);
        const res_json = await res_body.json();

        return res_json;
    }


    // API methods

    getsettings () {
        const params = new URLSearchParams();
        params.append("action", "getsettings");

        return this._do_api_request(params);
    }

    setsetting (settings) {
        const params = new URLSearchParams();
        params.append("action", "setsetting");

        for (const [ setting, value ] of Object.entries(settings)) {
            params.append("s", setting);
            params.append("v", value);
        }

        return this._do_api_request(params);
    }

    async list (cache_id) {
        const params = new URLSearchParams();
        params.append("list", "1");

        if (cache_id) {
            params.append("cid", cache_id);
        }

        const res = await this._do_api_request(params);
        const ret = { ...res };

        ret.torrents = res.torrents.map(
                torrent => new utorrent_api_torrent(torrent));

        if ("torrentp" in res) {
            ret.torrentp = res.torrentp.map(
                torrent => new utorrent_api_torrent(torrent));
        }

        return ret;
    }

    setprops (props) {
        const params = new URLSearchParams();
        params.append("action", "setprops");

        for (const [ hash, props_ ] of Object.entries(props)) {
            params.append("hash", hash);

            for (const [ prop, val ] of Object.entries(props_)) {
                params.append("s", prop);
                params.append("v", val);
            }
        }
        
        return this._do_api_request(params);
    }

    add_url (url) {
        const params = new URLSearchParams();
        params.append("action", "add-url");
        params.append("s", url);

        return this._do_api_request(params);
    }

    setprio (hash, priority, ...file_indicies) {
        const params = new URLSearchParams();
        params.append("action", "setprio");
        params.append("hash", hash);
        params.append("p", priority);

        for (const file_index of file_indicies) {
            params.append("f", file_index);
        }

        return this._do_api_request(params);
    }
}

// Bitwise flags for torrent status
utorrent_api.status = {
    STARTED: 1
  , CHECKING: 2
  , START_AFTER_CHECK: 4
  , CHECKED: 8
  , ERROR: 16
  , PAUSED: 32
  , QUEUED: 64
  , LOADED: 128
}


// Wrapper for property array
class utorrent_api_torrent {
    constructor (api_object) {
        [ this.hash
        , this.status
        , this.name
        , this.size
        , this.progress
        , this.downloaded
        , this.uploaded
        , this.ratio
        , this.upload_speed
        , this.download_speed
        , this.eta
        , this.label
        , this.peers_connected
        , this.peers_in_swarm
        , this.seeds_connected
        , this.seeds_in_swarm
        , this.availability
        , this.queue_order
        , this.remaining ] = api_object;
    }
}
