import React from 'react';
import {Link, withRouter} from 'react-router-dom';

class Nav extends React.Component {
    constructor(props) {
        super(props);

        this.list = [
            {text: 'Live', id: 'live', link: '/', path: '/'},
            {text: 'Archives', id: 'archives', link: 'archive', path: '/archive'},
        ];
    }
    createLink(item) {
        return <li key={item.id}><Link className={item.path === this.props.location.pathname ? 'active-route' : ''} to={item.link}>{item.text}</Link></li>
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
