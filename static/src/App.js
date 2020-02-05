import React from 'react';
import Nav from './Nav';
import Live from "./Live";
import Archive from "./Archive";
import {HashRouter as Router, Route} from 'react-router-dom';
import Dashboard from "./dashboard/Dashboard";
import Settings from './Settings';
import Screensaver from './Screensaver';
import lsCache from './lsCache';
const settings = lsCache('settings');

const SCREENSAVER_TIMEOUT = 10 * 60 * 1000; // ten minutes
const META_POLL_INTERVAL = 5 * 60 * 1000; // five minutes

//poll occasionally for the server being rebooted, probably means updated code, reload the page
let lastBoot = null;
async function pollMeta() {
    const meta = await fetch( 'meta')
        .then(res => res.json());

    if (lastBoot && meta.bootTime > lastBoot) {
        location.reload();
    }
    else {
        lastBoot = meta.bootTime;
    }
}
pollMeta();
setInterval(pollMeta, META_POLL_INTERVAL);

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: true
        };
        this.scheduleInactiveTimout();
    }
    scheduleInactiveTimout() {
        clearTimeout(this.inactiveTimeout);
        if (settings.touchpadMode) {
            this.inactiveTimeout = setTimeout(this.inactive.bind(this), SCREENSAVER_TIMEOUT)
        }
    }
    inactive() {
        this.setState({
            active: false
        });
    }
    active() {
        if (!this.state.active) {
            this.setState({
                active: true
            });
        }
        this.scheduleInactiveTimout();
    }

    render() {
        return (
            <div onClick={this.active.bind(this)}>
                <Router>
                    <Nav />
                    <Route path={"/"} exact component={Live} />
                    <Route path={"/archive"} component={Archive} />
                    <Route path={"/dashboard"} component={Dashboard} />
                    <Route path={"/settings"} component={Settings} />
                    {(settings.touchpadMode && !this.state.active) && <Screensaver />}
                </Router>
            </div>
        );
    }
}

export default App;
