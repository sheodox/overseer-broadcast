<div>
    <label>
        {light.name}
        <br>
        <input type="range" on:change={brightnessChange} bind:value={brightness} step=0 min=0 max="254"/>
    </label>
</div>

<script>
    import {lights} from "../stores/lights";

    export let light;
    let brightness = light.brightness;

    let debounceTimeout;
    function brightnessChange() {
        clearTimeout(debounceTimeout);

        debounceTimeout = setTimeout(async () => {
            $lights = await fetch(`/lights/${light.id}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    brightness
                })
            }).then(res => res.json());
        })
    }
</script>