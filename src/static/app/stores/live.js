import {writable} from "svelte/store";

export const cameras = writable(window.app.cameras)

//if the streams should be actively fetching data (false = pause streaming)
export const streamsActive = writable(false);
