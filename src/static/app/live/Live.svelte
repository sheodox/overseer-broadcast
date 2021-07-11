<style>
</style>
{#if !$streamsActive && !showInactivePrompt}
    <button on:click={activate}>Resume Streaming</button>
{/if}

{#if $settings.uninterruptedStreams}
    <p class="text-align-center has-inline-links">
        Streaming will not be automatically paused because of your <Link href="/settings">settings</Link>.
    </p>
{/if}

<div id="live" class="f-row f-wrap justify-content-center">
    {#each $cameras as camera}
        <Stream {camera} />
    {:else}
        <NoCameras />
    {/each}
</div>

{#if showInactivePrompt}
    <Modal bind:visible={showInactivePrompt} title="Live">
        <div class="modal-body">
            <p>
                Do you want to keep watching?
            </p>
        </div>
        <div class="modal-footer">
            <button on:click={() => showInactivePrompt = false}>No</button>
            <button class="primary" on:click={activate}>Yes</button>
        </div>
    </Modal>
{/if}

<script>
    import {onMount, onDestroy} from 'svelte';
    import {Modal} from 'sheodox-ui';
    import {settings} from "../stores/app";
    import {cameras, streamsActive} from "../stores/live";
    import Stream from "./Stream.svelte";
    import NoCameras from "../NoCameras.svelte";
    import './live.scss';
    import Link from "../Link.svelte";

    let showInactivePrompt = false,
        inactiveTimeout;

    const STREAM_ACTIVITY_TIMEOUT = 1000 * 60 * 10;

    function setInactive() {
        if ($settings.uninterruptedStreams) {
            scheduleInactive();
        } else {
            $streamsActive = false;
            showInactivePrompt = true;
        }
    }

    function activate() {
        $streamsActive = true;
        showInactivePrompt = false;
        scheduleInactive();
    }

    function scheduleInactive() {
        inactiveTimeout = setTimeout(setInactive, STREAM_ACTIVITY_TIMEOUT);
    }

    onMount(() => {
        $streamsActive = true;
        scheduleInactive();
    })
    onDestroy(() => {
        clearTimeout(inactiveTimeout);
    })
</script>