<style>
    p {
        white-space: nowrap;
    }
</style>
<p class="shdx-font-size-{size === 'small' ? '7' : '9'} m-0">
    {date}
</p>
<p class="shdx-font-size-{size === 'small' ? '9' : '12'} m-0">
    {time}
</p>

<script>
    import {onDestroy} from 'svelte';

    export let size = 'small';
    let time, date, timeUpdateInterval;

    timeUpdateInterval = setInterval(updateTime, 100);

    function updateTime() {
        time = new Date().toLocaleTimeString();
        date = new Date().toDateString();
    }

    updateTime();
    onDestroy(() => clearInterval(timeUpdateInterval))
</script>