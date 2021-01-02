import React from 'react';
import {Link, withRouter} from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faMoon} from "@fortawesome/free-solid-svg-icons";
import lsCache from "./lsCache";
const settings = lsCache('settings');

class Nav extends React.Component {
    constructor(props) {
        super(props);

        this.list = [
            {text: 'Live', id: 'live', link: '/'},
            {text: 'Archives', id: 'archives', link: '/archive'},
            {text: 'Dashboard', id: 'dashboard', link: '/dashboard'},
            {text: 'Settings', id: 'settings', link: '/settings'}
        ];
    }
    createLink(item) {
        return <li key={item.id}><Link className={item.link === this.props.location.pathname ? 'active-route' : ''} to={item.link}>{item.text}</Link></li>
    }
    render() {
        const list = this.list.map(this.createLink.bind(this));
        return <header>
            <div>
                <img alt="logo" className="logo" src="logo.png" />
                <h1>{document.title}</h1>
            </div>
            <nav>
                <ul>
                    {list}
                </ul>
            </nav>
            {settings.touchpadMode &&
                <button onClick={this.props.inactive}>
                    <FontAwesomeIcon icon={faMoon}/> Sleep
                </button>
            }
        </header>
    }
}

export default withRouter(Nav);
