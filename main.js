"use strict";

const _ = browser.i18n.getMessage;


chrome.runtime.onInstalled.addListener(() => {
    // Open options page to initialize storage and allow
    // user to set up the connection
    browser.runtime.openOptionsPage();
});


/**
 * Gets options key from storage
 */
async function get_options () {
    return (await browser.storage.sync.get("options")).options;
}

/**
 * Gets API endpoint URL.
 */
async function get_api_url () {
    const { protocol, host, port } = await get_options();
    return `${protocol}://${host}:${port}/gui`;
}

/**
 * Gets fetch init object for valid API requests. Includes
 * HTTP auth headers and correct cookie handling.
 */
async function get_api_info () {
    const { username, password } = await get_options();

    // Base64-encoded user:pass for HTTP auth
    const credentials = window.btoa(`${username}:${password}`);

    const headers = new Headers();
    headers.append("Authorization", `Basic ${credentials}`);

    return {
        headers,               // HTTP auth headers
        credentials: 'include' // Send cookies with request
    }
}



/**
 * Fetches and parses the token.html document to get a
 * request token for API requests.
 * 
 * Requires API params as it's always called from other
 * request functions that have already fetched them.
 *
 * @param api_url  API endpoint URL
 * @param api_info API fetch info
 */
async function get_token (api_url, api_info) {
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
async function do_api_request (url_params) {
    const api_url  = await get_api_url();
    const api_info = await get_api_info();

    // Append timestamp to request
    url_params.append("t", Date.now());

    // Token must come before other parameters for a valid request
    const token = await get_token(api_url, api_info);

    // Make request URL from params
    const url = `${api_url}/?token=${token}&${url_params.toString()}`;

    const res_body = await fetch(url, api_info);
    const res_json = await res_body.json();

    return res_json;
}



browser.menus.create({
    "id": "utorrent_add"
  , "title": "Add to uTorrent"
  , "contexts": [ "link" ]
    // Broken due to bug 1280370:
    // , "targetUrlPatterns": [ "magnet:*", "*://*/*.torrent" ]
});

browser.menus.onClicked.addListener(async info => {
    switch (info.menuItemId) {
        case "utorrent_add":
            // Notify user if not a valid torrent URL
            if (!/(^magnet:\?|\.torrent(\/?(\?.*)?)?$)/.test(info.linkUrl)) {
                browser.notifications.create("invalid-notification", {
                    type: "basic"
                  , title: _("notification_invalid_title")
                  , message: _("notification_invalid_message")
                });
                break;
            }

            const params = new URLSearchParams();               
            params.append("action", "add-url");
            params.append("s", info.linkUrl);

            try {
                await do_api_request(params);

                browser.notifications.create("success-notification", {
                    type: "basic"
                  , title: _("notification_success_title")
                  , message: _("notification_success_message")
                });
            } catch (err) {
                browser.notifications.create("failed-notification", {
                    type: "basic"
                  , title: _("notification_failed_title")
                  , message: err.toString()
                });
            }

            break;
    }
});
