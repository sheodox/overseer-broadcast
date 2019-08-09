function touchSources() {
    document.querySelectorAll('source').forEach(source => {
        video = source.parentNode;
        source.src = source.src.replace(/stream.*/, '') +`stream-${Date.now()}.mp4`;
        video.load();
        video.play();
    })
}

setInterval(touchSources, 5000);
touchSources();
