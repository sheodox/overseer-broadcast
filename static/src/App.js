import React from 'react';
import Nav from './Nav';
import Live from "./Live";
import Archive from "./Archive";
import {HashRouter as Router, Route} from 'react-router-dom';
import Dashboard from "./dashboard/Dashboard";

class App extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Router>
                <Nav />
                <Route path={"/"} exact component={Live} />
                <Route path={"/archive"} component={Archive} />
                <Route path={"/dashboard"} component={Dashboard} />
            </Router> 
        );
    }
}

export default App;
