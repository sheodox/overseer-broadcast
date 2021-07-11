import {writable, derived} from 'svelte/store';

const INACTIVE_TIME_MS = 10 * 60 * 1000,
    ACTIVITY_UPDATE_MS = 1000,
    SETTINGS_STORAGE_KEY = 'overseer-broadcast-settings';

const timeSinceLastActivity = writable(0);

export function setUserInactive() {
    timeSinceLastActivity.set(INACTIVE_TIME_MS);
}

export const settings = writable({});
try {
    const initialSettings = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY));
    settings.set(initialSettings || {});
} catch(e) {}

settings.subscribe(settings => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));

    const touchpadModeClass = 'touchpad-mode';
    settings.touchpadMode
        ? document.body.classList.add(touchpadModeClass)
        : document.body.classList.remove(touchpadModeClass);
});

setInterval(() => {
    timeSinceLastActivity.update(time => time + ACTIVITY_UPDATE_MS);
}, ACTIVITY_UPDATE_MS);

export const userActive = derived(timeSinceLastActivity, time => {
    return time < INACTIVE_TIME_MS;
})

export function onUserActivity() {
    timeSinceLastActivity.set(0);
}
document.addEventListener('click', onUserActivity);
document.addEventListener('keydown', onUserActivity);

const META_POLL_INTERVAL = 5 * 60 * 1000;
//poll occasionally for the server being rebooted, probably means updated code, reload the page
let lastBoot = null;
async function pollMeta() {
    const meta = await fetch( 'meta')
        .then(res => res.json());

    if (lastBoot && meta.bootTime > lastBoot) {
        location.reload();
    }
    else {
        lastBoot = meta.bootTime;
    }
}
pollMeta();
setInterval(pollMeta, META_POLL_INTERVAL);
