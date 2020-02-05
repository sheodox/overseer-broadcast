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

// ten minutes
// const SCREENSAVER_TIMEOUT = 10 * 60 * 1000;
const SCREENSAVER_TIMEOUT = 2 * 1000;

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
