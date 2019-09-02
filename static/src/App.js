import React from 'react';
import Nav from './Nav';
import Live from "./Live";
import Archive from "./Archive";
import {MemoryRouter as Router, Route} from 'react-router-dom';

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
            </Router> 
        );
    }
}

export default App;
