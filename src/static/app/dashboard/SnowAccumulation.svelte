{#if snowAccumulation > 0}
    <p class="m-1 p-1 shdx-badge-blue"><Icon icon="snowflake" /> {snowAccumulation.toFixed(1)}" snow</p>
{/if}

<script>
    import {Icon} from 'sheodox-ui';
    // need to sum the snow accumulation over hourly periods, as they're just the amount that hour
    export let hourly;

    $: snowAccumulation = hourly.reduce((sum, {values}) => {
        return sum + values.snowAccumulation
    }, 0);
</script>
