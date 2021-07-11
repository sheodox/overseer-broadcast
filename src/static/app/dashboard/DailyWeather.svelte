<div class="f-row f-wrap gap-2">
    {#if $alerts.length}
        <button class="danger" on:click={() => showAlerts = true}>
            <p class="mb-4">
                {$alerts.length} Weather Alert{$alerts.length === 1 ? '' : 's'}
            </p>
            <br>
            <small>
                {#each $alerts as alert}
                    {alert.properties.event}
                    <br>
                {/each}
            </small>
        </button>
    {/if}
    {#each $dailyWeather as daily (daily.startTime)}
        <DailyWeatherDay weather={daily} />
    {/each}
</div>

{#if showAlerts}
    <Modal title="Weather Alerts" bind:visible={showAlerts}>
        <WeatherAlerts />
    </Modal>
{/if}

<script>
    import {Modal} from 'sheodox-ui';
    import DailyWeatherDay from './DailyWeatherDay.svelte';
    import {dailyWeather, alerts} from "../stores/weather";
    import WeatherAlerts from "./WeatherAlerts.svelte";

    let showAlerts = false;
</script>