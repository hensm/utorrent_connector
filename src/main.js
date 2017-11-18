"use strict";

const _ = browser.i18n.getMessage;


browser.runtime.onInstalled.addListener(details => {
    switch (details) {
        case "install":
            /**
             * Open options page to initialize storage and allow user to
             * set up the connection.
             */
            browser.runtime.openOptionsPage();
            break;

        case "update":
            // TODO: Storage migration
            break;
    }
});


async function make_api_instance () {
    const { options } = await browser.storage.sync.get("options");

    if (!options) return null;
    
    return new utorrent_api({
        protocol : options.protocol
      , host     : options.host
      , port     : options.port
      , username : options.username
      , password : options.password
    });
}


let api;

// Initialize API
make_api_instance()
    .then(instance => {
        api = instance;
    });

browser.runtime.onMessage.addListener(async msg => {
    switch (msg.subject) {
        // Update API instance when options change
        case "options_updated":
            api = await make_api_instance();
            break;
    }
});


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

            try {
                await api.test();
                await api.add_url(info.linkUrl);

                browser.notifications.create("success-notification", {
                    type: "basic"
                  , title: _("notification_success_title")
                  , message: _("notification_success_message")
                });
            } catch (err) {
                browser.notifications.create("failed-notification", {
                    type: "basic"
                  , title: _("notification_failed_title")
                  , message: _("notification_failed_message")
                  , contextMessage: err.toString()
                });
            }

            break;
    }
});
