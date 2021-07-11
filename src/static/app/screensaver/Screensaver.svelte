<style>
    .screensaver {
        position: fixed;
        background: black;
        z-index: 1000000;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
    }
    .danger {
        color: var(--shdx-red-400);
        font-size: var(--shdx-font-size-7);
    }
</style>

<div class="screensaver f-column align-items-center justify-content-center">
    <Clock size="large" />
    {#if $currentWeather}
        <div class="f-row align-items-baseline shdx-font-size-12">
            <Icon icon={weatherCodeToIcon($currentWeather.weatherCode)} />
            <Temperature temperature={$currentWeather.temperature} />
        </div>
        <div class="shdx-font-size-8">
            {weatherCodeToDescription($currentWeather.weatherCode)}
        </div>
    {/if}
    {#if $alerts.length === 1}
        <p class="danger">{$alerts[0].properties.event}</p>
    {:else if $alerts.length > 1}
        <p class="danger">{$alerts.length} Weather Alerts</p>
    {/if}
    <div class="muted shdx-font-size-5">tap to wake</div>
</div>

<script>
    import {Icon} from 'sheodox-ui';
    import {alerts, currentWeather, weatherCodeToIcon, weatherCodeToDescription} from "../stores/weather";
    import Clock from "../dashboard/Clock.svelte";
    import Temperature from "../dashboard/Temperature.svelte";
</script>