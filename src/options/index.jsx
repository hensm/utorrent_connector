"use strict";

import React    from "react";
import ReactDOM from "react-dom";

const _ = browser.i18n.getMessage;


class App extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            is_testing: false
          , is_test_pending: false
          , is_test_valid: false

          , protocol: "http"
          , host: "localhost"
          , port: 8080
          , username: "admin"
          , password: ""
        }

        this.handle_test = this.handle_test.bind(this);
        this.handle_submit = this.handle_submit.bind(this);
        this.handle_input_change = this.handle_input_change.bind(this);
    }

    set_storage () {
        return browser.storage.sync.set({
            options:{
                protocol: this.state.protocol
              , host: this.state.host
              , port: this.state.port
              , username: this.state.username
              , password: this.state.password
            }
        });
    }

    async componentDidMount () {
        const { options } = await browser.storage.sync.get("options");
        if (options) {
            this.setState(options);
        } else {
            try {
                await this.set_storage();
            } catch (err) {
                // TODO
            }
        }
    }

    async handle_test (ev) {
        ev.preventDefault();

        this.setState({
            is_testing: true
          , is_test_pending: true
        });

        const api = new utorrent_api({
            protocol: this.state.protocol
          , host: this.state.host
          , port: this.state.port
          , username: this.state.username
          , password: this.state.password
        });

        this.setState({
            is_test_pending: false
          , is_test_valid: await api.test()
        });

        window.setTimeout(() => {
            this.setState({
                is_testing: false
            });
        }, 2000);
    }

    async handle_submit (ev) {
        ev.preventDefault();
        ev.target.reportValidity();

        this.setState({
            is_testing: false
          , is_test_pending: false
          , is_test_valid: false
        });

        try {
            await this.set_storage();
            browser.runtime.sendMessage({
                subject: "options_updated"
            });
        } catch (err) {
            // TODO
        }

    }


    handle_input_change (ev) {
        const val = do {
            if (ev.target.type === "checkbox") {
                ev.target.checked
            } else {
                ev.target.value
            }
        };

        this.setState({
            [ ev.target.name ]: val
        });
    }


    render () {
        return (
            <form id="form" onSubmit={ this.handle_submit }>
                <fieldset>
                    <legend>
                        { _("options_page_connection") }
                    </legend>

                    <label>
                        <div class="label">
                            { _("option_protocol") }
                        </div>
                        <select name="protocol" class="browser-style"
                                value={ this.state.protocol }
                                onChange={ this.handle_input_change }>
                            <option>http</option>
                            <option>https</option>
                        </select>
                    </label>
                    <label class="browser-style">
                        <div class="label">
                            { _("option_host") }
                        </div>
                        <input name="host" type="text"
                                value={ this.state.host }
                                onChange={ this.handle_input_change } />
                    </label>
                    <label class="browser-style">
                        <div class="label">
                            { _("option_port") }
                        </div>
                        <input name="port" type="number"
                                value={ this.state.port }
                                onChange={ this.handle_input_change } />
                    </label>
                </fieldset>

                <fieldset>
                    <legend>
                        { _("options_page_auth") }
                    </legend>

                    <label class="browser-style">
                        <div class="label">
                            { _("option_username") }
                        </div>
                        <input name="username" type="text"
                                value={ this.state.username }
                                onChange={ this.handle_input_change } />
                    </label>
                    <label class="browser-style">
                        <div class="label">
                            { _("option_password") }
                        </div>
                        <input name="password" type="password"
                                value={ this.state.password }
                                onChange={ this.handle_input_change } />
                    </label>
                </fieldset>

                <div id="buttons">
                    <button class="browser-style"
                            disabled={this.state.is_testing }
                            onClick={ this.handle_test }>
                        { do {
                            if (this.state.is_testing) {
                                if (this.state.is_test_pending) {
                                    _("options_page_test_pending")
                                } else {
                                    if (this.state.is_test_valid) {
                                        _("options_page_test_valid");
                                    } else {
                                        _("options_page_test_invalid")
                                    }
                                }
                            } else {
                                _("options_page_test")
                            }
                        }}
                    </button>
                    <button type="submit" class="browser-style">
                        { _("options_page_submit") }
                    </button>
                </div>
            </form>
        );
    }
}


ReactDOM.render(
    <App />
  , document.querySelector("#root"));
