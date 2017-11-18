"use strict";

/**
 * Loop through all elements with the data-i18n attribute and
 * set their content to the current locale message specified by
 * the attribute value.
 * 
 * If there are other attributes with a data-i18n prefix, set
 * the corresponding attribute without the prefix to the
 * current locale message specified by that attribute value.
 */
for (const el of document.querySelectorAll("[data-i18n]")) {
    const val = el.dataset.i18n;

    if (val !== "") {
        el.textContent = browser.i18n.getMessage(el.dataset["i18n"]);
    }

    // Get data-i18n-* attributes
    const entries = Object.entries(el.dataset)
        .filter(([ key ]) => key.startsWith("i18n-"));

    for (const [ key, value ] of entries) {
        const attr = key.match(/i18n-(\w+)/)[1];

        // If no match, skip attribute
        if (!attr) continue;

        // Set localized attribute
        el.setAttribute(attr, browser.i18n.getMessage(value));
    }
}
