<style>
    video {
        max-width: 100%;
    }
</style>
{#if !$cameras.length}
    <NoCameras />
{/if}

<div class="page-content mt-2">
    {#if $activeRouteParams.clipFileName}
        <video src={activeVideoSrc} muted controls />
        <div class="mb-8">
            {#if viewingClipDetails}
                <h2>{clipTitle}</h2>
                <p class="has-inline-links">
                    <a href={activeVideoSrc} download="{clipTitle}"><Icon icon="download" /> Download ({viewingClipDetails.size})</a>
                </p>
            {/if}
        </div>
    {/if}

    {#if $archivesByDay.length}
        <div class="mt-4 f-row justify-content-center">
            <TabList bind:selectedTab {tabs} />
        </div>
        {#each $archivesByDay as dayOfArchives}
            <Tab tabId={dayOfArchives.date} {selectedTab}>
                {#each $cameras as camera}
                    <CameraArchive {camera} archives={dayOfArchives.clips}/>
                {/each}
            </Tab>
        {/each}
    {/if}
    {#if $archives.length}
        <p class="text-align-center m-6">Total archive size {getPrettyBytes($archiveSize)} in {$archives.length} clips.</p>
    {/if}
</div>
<script>
    import {activeRouteParams} from "../stores/routing";
    import {archivesByDay, archives, archiveSize} from "../stores/archive";
    import {cameras} from "../stores/live";
    import {getPrettyBytes} from "../stores/archive";
    import CameraArchive from "./CameraArchive.svelte";
    import {Icon, TabList, Tab} from 'sheodox-ui';
    import NoCameras from "../NoCameras.svelte";

    const videoTitleFormat = new Intl.DateTimeFormat('en-US', {dateStyle: 'long', timeStyle: 'short'});

    $: viewingClip = $archives.find(archive => archive.file === $activeRouteParams.clipFileName)
    $: viewingClipDetails = viewingClip ? {
        date: videoTitleFormat.format(new Date(viewingClip.date)),
        size: getPrettyBytes(viewingClip.size),
        cameraName: $cameras.find(({id}) => id === viewingClip.camera).name
    } : null;
    $: clipTitle = viewingClipDetails && `${viewingClipDetails.cameraName} - ${viewingClipDetails.date}`;

    $: tabs = $archivesByDay.map(dayOfArchives => ({
        id: dayOfArchives.date,
        title: dayOfArchives.date
    }));

    $: activeVideoSrc = `/video/${$activeRouteParams.clipFileName}.mp4`;

    //auto-select the last tab if none has been selected yet, so we're looking
    // at today's archives by default
    $: selectedTab = !selectedTab && tabs.length ? tabs[tabs.length - 1].id : selectedTab;
</script>