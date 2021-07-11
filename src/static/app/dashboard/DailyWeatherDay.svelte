<style>
    .card {
        line-height: 1.5;
        border-radius: 3px;
    }
    p {
        margin: 0;
    }
</style>

<button class="card clickable fw-normal text-align-left p-3 f-column" on:click={() => showDetails = true}>
    <p class="fw-bold">{dateTitle}</p>
    <span class="shdx-font-size-8 align-self-center">
        <Icon icon={weatherCodeToIcon(weather.values.weatherCode)} />
    </span>
    <span class="shdx-font-size-8">
        <Temperature temperature={weather.values.temperature} />
    </span>
    {#if hourly.length}
        <p class="shdx-font-size-2">
            Low <Temperature temperature={temperatureLow} />
        </p>
    {/if}
    <p>
        {weatherCodeToDescription(weather.values.weatherCode)}
    </p>
    <SnowAccumulation {hourly} />
</button>

{#if showDetails}
    <Modal title="{dateTitle} Weather Details" bind:visible={showDetails}>
        <div class="modal-body">
            <DailyWeatherDetails {weather} {hourly} />
        </div>
    </Modal>
{/if}

<script>
    import {Icon, Modal} from 'sheodox-ui';
    import {getDayName, weatherCodeToIcon, weatherCodeToDescription, hourlyWeather} from "../stores/weather";
    import Temperature from "./Temperature.svelte";
    import DailyWeatherDetails from "./DailyWeatherDetails.svelte";
    import SnowAccumulation from "./SnowAccumulation.svelte";

    export let weather;
    let showDetails = false;

    $: shortDate = getShortDate(new Date(weather.startTime));
    $: dateTitle = `${getDayName(weather.startTime)} ${shortDate}`
    $: hourly = $hourlyWeather.filter(interval => {
        return new Date(interval.startTime).toLocaleDateString() === new Date(weather.startTime).toLocaleDateString()
    })
    $: temperatureLow = Math.min(...hourly.map(({values}) => values.temperature))

    function getShortDate(date) {
        return `${date.getMonth() + 1}/${date.getDate()}`
    }
</script>