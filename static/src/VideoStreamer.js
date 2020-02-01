import React from 'react';

class VideoStreamer extends React.Component {
    constructor(props) {
        super(props);
        this.start = Date.now();
        this.video = React.createRef();
        this.videoId = this.props.stream;
        this.lastBuffer = new Uint8Array([]);
        this.segmentNumber = 0;
        this.segmentsRequested = 0;
        this.segmentsErrored = 0;
        this.segmentsTimedout = 0;
        this.totalBytes = 0;
        this.ms = new MediaSource();
        this.src = URL.createObjectURL(this.ms);
        this.state = {
            stats: '',
            streaming: true
        }
    }
    componentWillUnmount() {
        this.dead = true;
    }
    componentDidMount() {
        this.ms.addEventListener('sourceopen', this.sourceOpen.bind(this));
        this.video.current.play();
        this.fetchNextSegment();
    }
    componentDidUpdate(prevProps) {
        // we've reactivated now, restart the stream
        if (this.props.active && !prevProps.active) {
            this.segmentNumber = 0;
            this.fetchNextSegment()
        }
    }
    render() {
        return <div className="stream-container">
            <video src={this.src} ref={this.video} className="stream" controls autoPlay data-stream-id={this.props.stream} muted />
            <span className="stats">{this.state.stats}</span>
        </div>
    }
    fetchArrayBuffer(url) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('get', url);
            xhr.responseType = 'arraybuffer';
            //segments are around 10 seconds, just give it a little more time than it should need to load
            xhr.timeout = 16000;
            xhr.onload = evt => {
                if (xhr.status !== 200) {
                    return reject();
                }
                this.totalBytes += evt.loaded;
                resolve(xhr.response);
            };
            xhr.ontimeout = () => {
                this.segmentsTimedout++;
                reject();
            };
            //prevent flooding the server with requests if it's offline or something
            xhr.onerror = () => {
                setTimeout(() => {
                    this.segmentsErrored++;
                    reject();
                }, 500);
            };
            xhr.send();
        })
    }
    sourceOpen() {
        this.buffer = this.ms.addSourceBuffer('video/mp4; codecs="avc1.640028"');
        this.ms.duration = 0;
    }
    fetchNextSegment() {
        if (this.dead) {
            return;
        }
        //check activity
        if (!this.props.active) {
            this.setState({streaming: false});
            return;
        }
        this.setState({
            streaming: true
        });

        this.segmentsRequested++;
        this.fetchArrayBuffer(`broadcaster/${this.videoId}/stream/segment/${this.segmentNumber++}`)
            .then(buffer => {
                if (this.dead) {
                    return;
                }
                const newBuffer = new Uint8Array(buffer),
                    isDifferent = newBuffer.length !== this.lastBuffer.length || newBuffer.some((num, i) => num !== this.lastBuffer[i]);

                if (isDifferent) {
                    this.buffer.timestampOffset = this.ms.duration;
                    this.buffer.appendBuffer(newBuffer);
                    this.lastBuffer = newBuffer;
                }

                this.updateStats();
                //queue up next response
                this.fetchNextSegment();
            })
            .catch(() => {
                this.updateStats();
                this.fetchNextSegment()
            })
    }
    updateStats() {
        const averageSize = getPrettyBytes(this.totalBytes / this.segmentNumber),
            //don't show hourly bandwidth until after a few segments have been requested,
            //the first segment comes back immediately so we'd otherwise show some absurd estimate
            hourlyBandwidth = this.segmentNumber > 5 ? `\n${getPrettyBytes((this.totalBytes / (Date.now() - this.start)) * 60 * 60 * 1000)}/hr` : '',
            showFailed = this.segmentsTimedout || this.segmentsErrored,
            failedSegments = `(${this.segmentsErrored} errored, ${this.segmentsTimedout} timed out)`;
        this.setState({stats: `${this.segmentsRequested} segments ${showFailed ? failedSegments : ''}\ntotal ${getPrettyBytes(this.totalBytes)}\navg ${averageSize}${hourlyBandwidth}`});
    }
}

export default VideoStreamer;
