<style>
    .alert-description {
        white-space: pre-line;
    }
</style>

<div class="modal-body">
    {#if tabs}
        <TabList bind:selectedTab {tabs} />

        {#each $alerts as alert}
            <Tab {selectedTab} tabId={alert.id}>
                <p>{alert.properties.headline}</p>
                <p class="alert-description">{alert.properties.description}</p>
            </Tab>
        {/each}
    {/if}
</div>

<script>
    import {TabList, Tab} from 'sheodox-ui';
    import {alerts} from "../stores/weather";

    $: tabs = $alerts.map(alert => {
        return {id: alert.id, title: alert.properties.event}
    });
    let selectedTab;
</script>