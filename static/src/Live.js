import React from 'react';
import VideoComponent from "./VideoStreamer";

class Live extends React.Component {
    constructor(props) {
        super(props);
        this.activeTimeout = 10 * 60 * 1000;
        this.state = {
            active: true,
            broadcasters: [],
            forever: false
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
            if (this.state.forever) {
                this.scheduleInactive();
            }
            else {
                this.setState({active: false});
            }
        }, this.activeTimeout);
    }
    resetTimeout() {
        this.setState({active: true});
        this.scheduleInactive();
    }
    foreverToggle(e)  {
        this.setState({
            forever: e.target.checked
        })
    }
    render() {
        const videos = this.state.broadcasters.map((b, i) => <VideoComponent active={this.state.active} key={i} stream={i}/>);

        return (
            <React.Fragment>
                <section className="streams">
                    <div id="inactive-prompt" className={this.state.active ? 'hidden' : ''}>
                        <p>Are you still watching?</p>
                        <button id="confirm-active" onClick={this.resetTimeout.bind(this)}>Yes</button>
                    </div>
                    {videos}

                </section>

                <div className="centered-controls">
                    <input type="checkbox" onChange={this.foreverToggle.bind(this)} id="stream-forever"/>
                    <label htmlFor="stream-forever">Stream forever</label>
                </div>
            </React.Fragment>
        )
    }
}

export default Live;
