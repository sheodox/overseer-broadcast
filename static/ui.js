const activeMaxTime = 1000 * 60 * 10;
let inactivePrompt, streamers,
    videos = [],
    active = true,
    activeEndTime = Date.now() + activeMaxTime;

function showInactivePrompt() {
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

class VideoStreamer {
    constructor(videoElement) {
        this.video = videoElement;
        this.videoId = this.video.getAttribute('data-stream-id');
        this.ms = new MediaSource();
        this.video.src = URL.createObjectURL(this.ms);
        this.ms.addEventListener('sourceopen', this.sourceOpen.bind(this));
        this.video.play();
        this.lastBuffer = new Uint8Array([]);
        this.fetchNextSegment();
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
        
        fetchArrayBuffer(`/broadcaster/${this.videoId}/stream`)
            .then(buffer => {
                const newBuffer = new Uint8Array(buffer),
                    isDifferent = newBuffer.length !== this.lastBuffer.length || newBuffer.some((num, i) => num !== this.lastBuffer[i]);
                
                if (isDifferent) {
                    this.buffer.timestampOffset = this.ms.duration;
                    this.buffer.appendBuffer(newBuffer);
                    this.lastBuffer = newBuffer;
                }
                
                //queue up next response
                this.fetchNextSegment();
            })
    }
}
function fetchArrayBuffer(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('get', url);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
            if (xhr.status !== 200) {
                return reject();
            }
            resolve(xhr.response);
        };
        xhr.send();
    })
}

window.addEventListener('load', function() {
    inactivePrompt = document.getElementById('inactive-prompt');
    videos = [].slice.call(document.querySelectorAll('video'));
    streamers = videos.map(video => new VideoStreamer(video));
});

