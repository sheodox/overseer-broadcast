<style>
    #lights {
        max-width: 30rem;
    }
    button {
        height: 4rem;
    }
    :global(.touchpad-mode) button:not(.primary):hover {
        background: transparent;
    }
</style>

<div id="lights">
    <div class="f-row justify-content-between align-items-baseline">
        <h2 class="m-0">Lights</h2>
        <button on:click={() => showBrightness = true}>
            <Icon icon="sliders-h" noPadding={true}/>
            <span class="sr-only">Brightness</span>
        </button>
    </div>
    <div class="f-column">
        {#each $lights as light}
            <button
                aria-pressed={light.on}
                class:primary={light.on}
                on:click={() => toggle(light)}
            >
        <span>
            {light.name}
        </span>
            </button>
        {/each}
    </div>
</div>

{#if showBrightness}
    <Modal title="Brightness" bind:visible={showBrightness}>
        <div class="modal-body">
            {#each $lights as light}
                <LightsBrightness {light} />
            {/each}
        </div>
    </Modal>
{/if}

<script>
    import {Icon, Modal} from 'sheodox-ui';
    import {lights} from "../stores/lights";
    import LightsBrightness from "./LightsBrightness.svelte";

    let showBrightness = false;

    async function toggle(light) {
        $lights = await fetch(`/lights/${light.id}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                on: !light.on
            })
        }).then(res => res.json());
    }
</script>