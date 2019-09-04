const React = require('react');

class If extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const hasProp = prop => this.props.hasOwnProperty(prop);

        if (hasProp('renderWhen')) {
            if (!this.props.renderWhen) {
                return null;
            }
            return this.props.children;
        }

        //to not change structure between showing and not, return a containing div either way if using show
        if (hasProp('showWhen')) {
            const className = this.props.showWhen ? '' : 'hidden';
            return <div className={className}>
                {this.props.children}
            </div>
        }
    }

}

export default If;
