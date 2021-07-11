<style>
    div {
        white-space: nowrap;
    }
    p {
        margin: 0;
    }
</style>
{#if $currentWeather}
    <div class="m-3">
        <div class="f-column">
            <h2 class="m-0">Now</h2>
            <p class="shdx-font-size-9">
                <Temperature temperature={Math.round($currentWeather.temperature)} />
            </p>
            <p class="shdx-font-size-2">Feels like <Temperature temperature={$currentWeather.temperatureApparent} /></p>
            <p class="shdx-font-size-9">
                <Icon icon={weatherCodeToIcon($currentWeather.weatherCode)} />
            </p>
            <p>{weatherCodeToDescription($currentWeather.weatherCode)}</p>
            <SnowAccumulation hourly={remainingHourly} />
        </div>
    </div>
{/if}
<script>
    import {Icon} from 'sheodox-ui';
    import {currentWeather, hourlyWeather, weatherCodeToIcon, weatherCodeToDescription} from "../stores/weather";
    import Temperature from "./Temperature.svelte";
    import SnowAccumulation from "./SnowAccumulation.svelte";

    $: remainingHourly = getRemainingHourly($hourlyWeather)

    function getRemainingHourly(hourly) {
        const today = new Date().toLocaleDateString();
        return hourly.filter(({startTime}) => {
            return new Date(startTime).toLocaleDateString() === today;
        });
    }
</script>