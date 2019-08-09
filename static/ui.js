const activeMaxTime = 1000 * 60 * 10;
let sources, inactivePrompt,
    activeEndTime = Date.now() + activeMaxTime;
//if a video has finished playing, reload with the next video segment
function checkForFinishedVideos() {
    //stop checking if they're inactive, to save bandwidth
    if (activeEndTime < Date.now()) {
        showInactivePrompt();
        return;
    }
    sources.forEach(source => {
        const video = source.parentNode;
        if (video.duration === video.currentTime) {
            touchSource(source);
        }
    });
    requestAnimationFrame(checkForFinishedVideos);
}

function showInactivePrompt() {
    inactivePrompt.classList.remove('hidden');
    const reactivateButton = document.getElementById('confirm-active');
    function reactivate() {
        activeEndTime = Date.now() + activeMaxTime;
        reactivateButton.removeEventListener('click', reactivate);
        sources.forEach(touchSource);
        checkForFinishedVideos();
        inactivePrompt.classList.add('hidden');
    }
    reactivateButton.addEventListener('click', reactivate);
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
    inactivePrompt = document.getElementById('inactive-prompt');
    sources = document.querySelectorAll('source');
    sources.forEach(touchSource);
    checkForFinishedVideos();
});

