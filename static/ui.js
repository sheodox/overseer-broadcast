const activeMaxTime = 1000 * 60 * 10;
let inactivePrompt, streamers,
    videos = [],
    active = true,
    activeEndTime = Date.now() + activeMaxTime;

function showInactivePrompt() {
    //prevent double activating the inactive prompt and duplicating subsequent stream activations
    if (inactivePrompt.classList.contains('hidden')) {
        inactivePrompt.classList.remove('hidden');
        const reactivateButton = document.getElementById('confirm-active');

        function reactivate() {
            activeEndTime = Date.now() + activeMaxTime;
            reactivateButton.removeEventListener('click', reactivate);
            streamers.forEach(streamer => streamer.fetchNextSegment());
            inactivePrompt.classList.add('hidden');
        }

        reactivateButton.addEventListener('click', reactivate);
    }
}

class VideoStreamer {
    constructor(container) {
        this.start = Date.now();
        const find = sel => container.querySelector(sel);
        this.video = find('video');
        this.stats = find('.stats');
        this.videoId = this.video.getAttribute('data-stream-id');
        this.ms = new MediaSource();
        this.video.src = URL.createObjectURL(this.ms);
        this.ms.addEventListener('sourceopen', this.sourceOpen.bind(this));
        this.video.play();
        this.lastBuffer = new Uint8Array([]);
        this.segmentNumber = 0;
        this.totalBytes = 0;
        this.fetchNextSegment();
    }
    getPrettyBytes(bytes) {
        let size, unit;
        const kb = 1024,
            mb = 1024 * kb,
            gb = 1024 * mb,
            checkUnit = (base, u) => {
                if (bytes / base > 1) {
                    size = bytes / base;
                    unit = u;
                    return true;
                }
            };

        [[gb, 'GB'], [mb, 'MB'], [kb, 'KB'], [1, 'Bytes']].some(info => checkUnit(...info));
        
        return `${size.toFixed(1)} ${unit}`;
    }
    updateStats() {
        const averageSize = this.getPrettyBytes(this.totalBytes / this.segmentNumber),
            //don't show hourly bandwidth until after a few segments have been requested,
            //the first segment comes back immediately so we'd otherwise show some absurd estimate
            hourlyBandwidth = this.segmentNumber > 5 ? `\n${this.getPrettyBytes((this.totalBytes / (Date.now() - this.start)) * 60 * 60 * 1000)}/hr` : '';
        this.stats.textContent = `${this.segmentNumber} segments\ntotal ${this.getPrettyBytes(this.totalBytes)}\navg ${averageSize}${hourlyBandwidth}`
    }
    sourceOpen() {
        this.buffer = this.ms.addSourceBuffer('video/mp4; codecs="avc1.640028"');
        this.ms.duration = 0;
    }
    fetchNextSegment() {
        //check activity
        if (activeEndTime < Date.now()) {
            active = false;
            return showInactivePrompt();
        }
        
        this.fetchArrayBuffer(`broadcaster/${this.videoId}/stream/segment/${this.segmentNumber++}`)
            .then(buffer => {
                const newBuffer = new Uint8Array(buffer),
                    isDifferent = newBuffer.length !== this.lastBuffer.length || newBuffer.some((num, i) => num !== this.lastBuffer[i]);
                
                if (isDifferent) {
                    this.buffer.timestampOffset = this.ms.duration;
                    this.buffer.appendBuffer(newBuffer);
                    this.lastBuffer = newBuffer;
                }

                //queue up next response
                this.updateStats();
                this.fetchNextSegment();
            })
            .catch(() => {
                this.fetchNextSegment()
            })
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
            xhr.ontimeout = reject;
            //prevent flooding the server with requests
            xhr.onerror = () => {
                setTimeout(() => {
                    reject();
                }, 500);
            };
            xhr.send();
        })
    }
}

window.addEventListener('load', function() {
    inactivePrompt = document.getElementById('inactive-prompt');
    videos = [].slice.call(document.querySelectorAll('.stream-container'));
    streamers = videos.map(video => new VideoStreamer(video));
});

