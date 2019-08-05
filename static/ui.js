function streamError(img) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'stream-error';
    errorDiv.textContent = `Error connecting to stream ${img.src}`;
    img.replaceWith(errorDiv);
}

