"use strict";

import React  from "react";
import moment from "moment";

import { observer, action } from "mobx-react";

import { format_size } from "../../lib/utils";


// getMessage alias
const _ = browser.i18n.getMessage;

// Set moment i18n
moment.locale(browser.i18n.getUILanguage());


@observer
class Torrent extends React.Component {
    constructor (props) {
        super(props);
    }
    
    // Event handlers
    handle_resume () { this.props.torrent.resume(); }
    handle_pause  () { this.props.torrent.pause();  }
    handle_stop   () { this.props.torrent.stop();   }
    
    handle_remove () {
        this.props.torrent_list.remove_torrent(
                this.props.torrent.hash);
    }


    render () {
        // Most appropriate single status for UI
        const status = do {
            if (this.props.torrent.is_started) {
                if (this.props.torrent.is_paused) {
                    _("popup_torrent_status_paused");
                } else if (this.props.torrent.is_completed) {
                    _("popup_torrent_status_uploading");
                } else {
                    _("popup_torrent_status_downloading");
                }
            } else {
                if (this.props.torrent.is_completed) {
                    _("popup_torrent_status_finished");
                } else {
                    _("popup_torrent_status_stopped");
                }
            }
        }

        // Multiple applicable styling statuses for the class list
        const class_list = [];

        if (this.props.torrent.is_started) {
            if (this.props.torrent.is_paused) {
                class_list.push("paused");
            }
        } else {
            class_list.push(this.props.torrent.is_completed
                ? "finished"
                : "stopped");
        }
        class_list.push(this.props.torrent.is_completed
            ? "uploading"
            : "downloading");


        return (
            <div className={ `torrent ${class_list.join(" ")}` }>
                <div className="torrent-name-line">
                    <div className="torrent-name">
                        { this.props.torrent.name }
                    </div>
                    <div className="torrent-controls">
                        <div className="torrent-control torrent-control-resume"
                             title={ _("popup_torrent_resume_title") }
                             onClick={ this.handle_resume.bind(this) }>
                            <img src="assets/ic_play_circle_outline_black_18px.svg" />
                        </div>
                        <div className="torrent-control torrent-control-pause"
                             title={ _("popup_torrent_pause_title") }
                             onClick={ this.handle_pause.bind(this) }>
                            <img src="assets/ic_pause_circle_outline_black_18px.svg" />
                        </div>
                        <div className="torrent-control torrent-control-stop"
                             title={ _("popup_torrent_stop_title") }
                             onClick={ this.handle_stop.bind(this) }>
                            <img src="assets/ic_stop_black_18px.svg" />
                        </div>
                        <div className="torrent-control torrent-control-remove"
                             title={ _("popup_torrent_remove_title") }
                             onClick={ this.handle_remove.bind(this) }>
                            <img src="assets/ic_clear_black_18px.svg" />
                        </div>
                    </div>
                </div>
                <div className="torrent-size-line">
                    <div className="torrent-size">
                        {
                            // downloaded of size (x%)
                            _("popup_torrent_size", [
                                format_size(this.props.torrent.downloaded)
                              , format_size(this.props.torrent.size)
                              , Math.floor(this.props.torrent.progress / 10)
                            ])
                        }
                    </div>
                    <div className="torrent-speed">
                        {
                            // U: **/s D: **/s
                            _("popup_torrent_speed", [
                                format_size(this.props.torrent.download_speed)
                              , format_size(this.props.torrent.upload_speed)
                            ])
                        }
                    </div>
                </div>
                <div className="torrent-progress">
                    <progress max="1000" value={ this.props.torrent.progress }></progress>
                </div>
                <div className="torrent-status-line">
                    <div className="torrent-status">
                        { status }
                    </div>
                    <div className="torrent-eta">
                        { do {
                            // Convert eta to milliseconds and add to current time
                            const eta_ms = (this.props.torrent.eta * 1000) + Date.now();

                            _("popup_torrent_eta_remaining"
                              , moment(eta_ms).fromNow(true));
                        }}
                    </div>
                </div>
            </div>
        );
    }
}

export default Torrent;
