{#if $activeApp === 'live'}
    <Live />
{:else if $activeApp === 'archive'}
    <Archive />
{:else if $activeApp === 'dashboard'}
    <Dashboard />
{:else if $activeApp === 'settings'}
    <Settings />
{/if}

<script>
    import {activeApp} from "./stores/routing";
    import Live from "./live/Live.svelte";
    import Archive from "./archive/Archive.svelte";
    import Dashboard from "./dashboard/Dashboard.svelte";
    import Settings from "./settings/Settings.svelte";
</script>