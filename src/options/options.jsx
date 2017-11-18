"use strict";

// TODO: Rewrite with react
import React from "react";
import ReactDOM from "react-dom";

const _ = browser.i18n.getMessage;


const form = document.querySelector("#form");
const btn_test = document.querySelector("#test");
const btn_submit = document.querySelector("#submit");

const option_protocol = document.querySelector("#protocol");
const option_host     = document.querySelector("#host");
const option_port     = document.querySelector("#port");
const option_username = document.querySelector("#username");
const option_password = document.querySelector("#password");

function get_values () {
    return {
        protocol : option_protocol.options[option_protocol.selectedIndex].value
      , host     : option_host.value
      , port     : parseInt(option_port.value)
      , username : option_username.value
      , password : option_password.value
    };
}

function set_values (values) {
    for (const [ key, value ] of Object.entries(values)) {
        switch (key) {
            case "protocol":
                let index = 0;
                for (const option of option_protocol.options) {
                    if (option.value === value) {
                        option_protocol.selectedIndex = index;
                        break;
                    }
                    index++;
                }
                break;

            case "host"     : option_host.value     = value; break;
            case "port"     : option_port.value     = value; break;
            case "username" : option_username.value = value; break;
            case "password" : option_password.value = value; break;
        }
    }
}


const defaults = get_values();

browser.storage.sync.get("options")
    .then(storage => {
        if ("options" in storage) {
            // Set controls with values from storage
            set_values(storage.options);
        } else {
            // If storage is empty, set defaults from DOM
            browser.storage.sync.set({
                options: defaults
            });
        }
    });


btn_test.addEventListener("click", async ev => {
    btn_test.disabled = "true";
    btn_test.textContent = _("options_page_test_pending");

    const api = new utorrent_api(get_values());
    if (await api.test()) {
        btn_test.textContent = _("options_page_test_valid");
    } else {
        btn_test.textContent = _("options_page_test_invalid");
    }

    window.setTimeout(() => {
        btn_test.textContent = _("options_page_test");
        btn_test.removeAttribute("disabled");
    }, 2000);
});

form.addEventListener("submit", async ev => {
    form.reportValidity();
    browser.storage.sync.set({
        options: get_values()
    });

    browser.runtime.sendMessage({
        subject: "options_updated"
    });

    ev.preventDefault();
});
