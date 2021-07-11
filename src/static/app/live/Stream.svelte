<video bind:this={video} {src} muted controls></video>

<script>
    import {onMount, onDestroy} from 'svelte';
    import {streamsActive} from "../stores/live";

    export let camera;

    let video,
        mediaSource = new MediaSource(),
        src = URL.createObjectURL(mediaSource),
        dead = false,
        segmentsRequested = 0,
        segmentsErrored = 0,
        segmentsTimedout = 0,
        totalBytes = 0,
        streaming,
        sourceBuffer;

    async function fetchNextSegment() {
        if (dead) {
            return;
        }
        //check activity
        if (!$streamsActive) {
            streaming = false;
            setTimeout(fetchNextSegment, 1000);
            return;
        }
        streaming = true;

        try {
            const buffer = await fetchArrayBuffer(`/relay/stream/${camera.id}/segment/${segmentsRequested++}`)

            if (dead) {
                return;
            }
            const newBuffer = new Uint8Array(buffer);

            sourceBuffer.timestampOffset = mediaSource.duration;
            sourceBuffer.appendBuffer(newBuffer);
        }
        catch(e) {
            console.log(e);
        }
        finally {
            //queue up next response
            fetchNextSegment();
        }
    }

    onMount(() => {
        mediaSource.addEventListener('sourceopen', () => {
            sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.640028"');
            mediaSource.duration = 0;
            fetchNextSegment();
        })
        video.play();
    })

    onDestroy(() => {
        dead = true;
    });

    function sleep(ms=500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function fetchArrayBuffer(url) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('get', url);
            xhr.responseType = 'arraybuffer';
            //segments are around 10 seconds, just give it a little more time than it should need to load
            xhr.timeout = 16000;
            xhr.onload = async evt => {
                if (xhr.status !== 200) {
                    // prevent spamming the server if something temporarily is down
                    await sleep();
                    return reject();
                }
                totalBytes += evt.loaded;
                resolve(xhr.response);
            };
            xhr.ontimeout = () => {
                segmentsTimedout++;
                reject();
            };
            //prevent flooding the server with requests if it's offline or something
            xhr.onerror = async e => {
                await sleep();
                segmentsErrored++;
                reject(e);
            };
            xhr.send();
        });
    }
</script>