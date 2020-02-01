import React from 'react';
import VideoComponent from "./VideoStreamer";

class Live extends React.Component {
    constructor(props) {
        super(props);
        this.activeTimeout = 10 * 60 * 1000;
        this.state = {
            active: true,
            broadcasters: []
        };
    }
    async componentDidMount() {
        this.scheduleInactive();
        this.setState({
            broadcasters: await req('info/broadcasts')
        });
    }
    scheduleInactive() {
        setTimeout(() => {
            this.setState({active: false});
        }, this.activeTimeout);
    }
    resetTimeout() {
        this.setState({active: true});
        this.scheduleInactive();
    }
    render() {
        const videos = this.state.broadcasters.map((b, i) => <VideoComponent active={this.state.active} key={i} stream={i}/>);
        
        return (
            <section className="streams">
                <div id="inactive-prompt" className={this.state.active ? 'hidden' : ''}>
                    <p>Are you still watching?</p>
                    <button id="confirm-active" onClick={this.resetTimeout.bind(this)}>Yes</button>
                </div>
                {videos}
            </section>
        )
    }
}

export default Live;
