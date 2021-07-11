<style>
    @media (max-width: 700px) {
        div {
            flex-direction: column;
        }
    }
</style>

<div class="f-row">
    <CurrentWeather />
    <WeatherGraph />
</div>
<DailyWeather />

<script>
    import './weather.scss';
    import CurrentWeather from "./CurrentWeather.svelte";
    import DailyWeather from "./DailyWeather.svelte";
    import WeatherGraph from "./WeatherGraph.svelte";

</script>