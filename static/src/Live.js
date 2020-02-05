import React from 'react';
import VideoComponent from "./VideoStreamer";
import lsCache from './lsCache';
const settings = lsCache('settings');

class Live extends React.Component {
    constructor(props) {
        super(props);
        this.activeTimeout = 10 * 60 * 1000;
        this.state = {
            active: true,
            broadcasters: [],
            forever: false,
            large: settings.largeStreamPlayers
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
    toggleState(stateKey, settingsKey) {
        return e => {
            this.setState({
                [stateKey]: e.target.checked
            });

            if (settingsKey) {
                settings[settingsKey] = e.target.checked;
            }
        }
    }
    render() {
        const videos = this.state.broadcasters.map((b, i) => <VideoComponent active={this.state.active} key={i} stream={i} large={this.state.large}/>);

        return (
            <React.Fragment>
                <div className="centered-controls">
                    <input type="checkbox" onChange={this.toggleState('forever')} id="stream-forever" />
                    <label htmlFor="stream-forever">Uninterrupted streaming</label>

                    <div id="large-player-checkbox-container">
                        <input type="checkbox" onChange={this.toggleState('large', 'largeStreamPlayers')} id="large-player-checkbox" defaultChecked={settings.largeStreamPlayers} />
                        <label htmlFor="large-player-checkbox">Large stream players</label>
                    </div>
                </div>

                <div id="inactive-prompt" className={this.state.active ? 'hidden' : ''}>
                    <p>Are you still watching?</p>
                    <button id="confirm-active" onClick={this.resetTimeout.bind(this)}>Yes</button>
                </div>

                <section className="streams">
                    {videos}
                </section>
            </React.Fragment>
        )
    }
}

export default Live;
