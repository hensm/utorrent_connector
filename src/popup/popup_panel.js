"use strict";

const btn = document.querySelector("#show_all_torrents");

btn.addEventListener("click", ev => {
    window.open(browser.runtime.getURL("popup/popup_full.html"));
    window.close();
});
