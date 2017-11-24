"use strict";

/**
 * Takes a size in bytes and returns it in a human readable
 * string format. Supports units up to a petabyte.
 *
 * @param bytes     Size
 * @param precision Decimal precision for conversions
 */
function format_size (bytes, precision = 1) {
    // Sizes in bytes
    const kilobyte = 1024;
    const megabyte = kilobyte * 1024;
    const gigabyte = megabyte * 1024;
    const terabyte = gigabyte * 1024;
    const petabyte = terabyte * 1024;

    if (bytes >= 0 && bytes < kilobyte) {
        return `${bytes} B`;

    } else if (bytes >= kilobyte && bytes < megabyte) {
        return `${(bytes / kilobyte).toFixed(precision)} KB`;

    } else if (bytes >= megabyte && bytes < gigabyte) {
        return `${(bytes / megabyte).toFixed(precision)} MB`;

    } else if (bytes >= gigabyte && bytes < terabyte) {
        return `${(bytes / gigabyte).toFixed(precision)} GB`;

    } else if (bytes >= terabyte && bytes < petabyte) {
        return `${(bytes / terabyte).toFixed(precision)} TB`;

    } else if (bytes >= petabyte) {
        return `${(bytes / petabyte).toFixed(precision)} PB`;
    }
}


export {
    format_size
};
