<style>
    .settings {
        max-width: 30rem;
    }
</style>

<div class="page-content settings">

    <h2>Settings</h2>
    <p>These settings are for this device only.</p>

    <Checkbox id="touchpad-mode" bind:checked={$settings.touchpadMode}>
        Touchpad mode
    </Checkbox>

    <p class="hint px-6"><Icon icon="info-circle" /> Touchpad mode is intended for wall mounted always-on displays. It includes some features like a screen saver during periods of inactivity, disabling archive downloading, and hidden cursors.</p>

    <Checkbox id="uninterrupted-streams" bind:checked={$settings.uninterruptedStreams}>
        Don't automatically pause streams after a period of inactivity.
    </Checkbox>

    <hr class="my-6">

    <button on:click={reload}>Reload</button>
    <button on:click={toggleFullscreen}>Toggle Fullscreen</button>
</div>



<script>
    import {settings} from "../stores/app";
    import {Checkbox, Icon} from 'sheodox-ui';

    function reload() {
        location.reload();
    }

    function toggleFullscreen() {
        document.fullscreenElement
            ? document.exitFullscreen()
            : document.documentElement.requestFullscreen();
    }
</script>