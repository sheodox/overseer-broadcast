<h2>{camera.name}</h2>
<div class="f-row f-wrap justify-content-center gap-2">
    {#each clips as clip}
        <Link href="/archive/{clip.file}" classes="card clickable p-2">
            <img src="/thumbnail/{clip.file}.webp" />
            <br>
            <p class="m-0 text-align-center">
                {prettyTime(clip.date)}
            </p>
        </Link>
    {/each}
</div>
<script>
    import Link from "../Link.svelte";
    export let archives;

    const timeDateFormat = new Intl.DateTimeFormat('en-US', {timeStyle: 'short'});

    function prettyTime(dateMs) {
        const date = new Date(dateMs);

        return timeDateFormat.format(date);
    }

    export let camera;
    $: clips = archives.filter(clip => clip.camera === camera.id)
</script>