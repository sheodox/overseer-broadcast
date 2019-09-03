import React from 'react';
import {Link} from 'react-router-dom';

class Nav extends React.Component {
    constructor(props) {
        super(props);
        this.list = [
            {text: 'Live', id: 'live', link: '/'},
            {text: 'Archives', id: 'archives', link: 'archive'},
        ];
        this.active = this.list[0].id;
    }
    createLink(item) {
        return <li key={item.id}><Link to={item.link}>{item.text}</Link></li>
    }
    render() {
        const list = this.list.map(this.createLink.bind(this));
        return <header>
            <img className="logo" src="logo.png" />
            <h1>{document.title}</h1>
            <nav>
                <ul>
                    {list}
                </ul>
            </nav>
        </header>
    }
}

export default Nav;
