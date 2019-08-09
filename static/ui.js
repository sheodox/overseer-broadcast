const sources = document.querySelectorAll('source');
function checkForFinishedVideos() {
    sources.forEach(source => {
        const video = source.parentNode;
        if (video.duration === video.currentTime) {
            touchSources(source);
        }
    });
    requestAnimationFrame(checkForFinishedVideos);
}
function touchSources(source) {
    const video = source.parentNode;
    source.src = source.src.replace(/stream.*/, '') + `stream-${Date.now()}.mp4`;
    video.load();
    video.play();
}

sources.forEach(touchSources);
checkForFinishedVideos();
