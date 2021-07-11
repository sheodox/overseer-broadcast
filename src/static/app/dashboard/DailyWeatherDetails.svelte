<p class="m-0 mb-3 text-align-center">
    <span class="shdx-badge-yellow p-1">
        <Icon icon="sun" /> {shortTime(weather.values.sunriseTime)}
    </span>
    <span class="shdx-badge-blue p-1">
        <Icon icon="moon" /> {shortTime(weather.values.sunsetTime)}
    </span>
</p>
{#if hourly.length}
    <table>
        <thead>
        <tr>
            <th>Time</th>
            <th>Temperature</th>
            <th>Precip %</th>
        </tr>
        </thead>
        <tbody>
        {#each hourly as interval}
            <tr>
                <td>{shortTime(interval.startTime)}</td>
                <td><Temperature temperature={interval.values.temperature} /></td>
                <td>{interval.values.precipitationProbability}%</td>
            </tr>
        {/each}
        </tbody>
    </table>
{:else}
    <p class="muted">This day is too far in the future for detailed weather information</p>
{/if}

<script>
    import {Icon} from 'sheodox-ui';
    import {hourlyWeather} from "../stores/weather";
    import Temperature from "./Temperature.svelte";
    const shortTimeFormat = new Intl.DateTimeFormat('en-US', {timeStyle: 'short'});

    export let weather;
    export let hourly;

    function shortTime(dateStr) {
        return shortTimeFormat.format(new Date(dateStr));
    }
</script>