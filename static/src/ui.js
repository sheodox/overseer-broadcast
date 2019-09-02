import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

window.req = (url) => fetch(url).then(res => res.json());
window.getPrettyBytes = (bytes) => {
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

    [[gb, 'GB'], [mb, 'MB'], [kb, 'KB']].some(info => checkUnit(...info));
    if (!unit) {
        size = bytes;
        unit = 'Bytes';
    }

    return `${size.toFixed(1)} ${unit}`;
};

window.addEventListener('load', async function() {
    ReactDOM.render(<App />, document.querySelector('#react-root'));
});

