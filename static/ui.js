let sources;
//if a video has finished playing, reload with the next video segment
function checkForFinishedVideos() {
    sources.forEach(source => {
        const video = source.parentNode;
        if (video.duration === video.currentTime) {
            touchSource(source);
        }
    });
    requestAnimationFrame(checkForFinishedVideos);
}
//use a different url each time, save video is served but prevents all caching
function touchSource(source) {
    const video = source.parentNode;
    source.src = source.src.replace(/stream.*/, '') + `stream-${Date.now()}.mp4`;
    video.load();
    video.play();
}

//if a video doesn't stream, try again
function streamError(source) {
    console.log(`streaming error on ${source}, retrying...`);
    setTimeout(function() {
        touchSource(source);
    }, 500);
}

window.addEventListener('load', function() {
    sources = document.querySelectorAll('source');
    sources.forEach(touchSource);
    checkForFinishedVideos();
});

