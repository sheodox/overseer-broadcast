import {writable} from "svelte/store";

export const lights = writable([], set => {
    function update() {
        fetch('/lights/state')
            .then(res => res.json())
            .then(state => {
                set(state);
            })
    }

    update();
    const updateInterval = setInterval(update, 10 * 1000);
    return () => clearInterval(updateInterval);
});
