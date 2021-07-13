<style>
    .dashboard {
        max-width: 100vw;
        margin: 0 auto;
        overflow: auto;
    }
    @media (max-width: 700px) {
        .dashboard {
            flex-direction: column;
        }
    }
    @media (min-width: 1300px) {
        .dashboard {
            width: 1300px;
        }
    }
</style>
<div class="dashboard f-row">
    <div class="f-column m-1">
        <Clock />
        <Lights />
    </div>
    <div class="f-column f-1 m-1">
        <Weather />
    </div>
</div>

<script>
    import Clock from "./Clock.svelte";
    import Lights from "./Lights.svelte";
    import Weather from "./Weather.svelte";
</script>
