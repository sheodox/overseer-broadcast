import React from 'react';
import {Link, withRouter} from 'react-router-dom';

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
            <img alt="logo" className="logo" src="logo.png" />
            <h1>{document.title}</h1>
            <nav>
                <ul>
                    {list}
                </ul>
            </nav>
        </header>
    }
}

export default withRouter(Nav);
