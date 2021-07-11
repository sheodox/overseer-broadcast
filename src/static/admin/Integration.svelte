<style>
    fieldset {
        border: none;
    }
</style>

<div>
    <h2>Generic Integration</h2>
    <fieldset>
        <legend>Scope</legend>
        {#each scopes as scopeType}
            <label>
                <input type="radio" bind:group={scope} value={scopeType} />
                {scopeType}
            </label>
        {/each}
    </fieldset>
    <button on:click={generate} class="primary">Add</button>
</div>
{#if jwt}
    <div class="m-3">
        <CopyableText value={jwt} label="{scope} JWT" id="generic-scope-jwt" />
    </div>
{/if}
<script>
    import CopyableText from "./CopyableText.svelte";
    const scopes = ['logs', 'lights'];

    let scope, jwt;

    async function generate() {
        jwt = (await fetch('/admin/integration/generate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                scope
            })
        }).then(res => res.json())).jwt
    }
</script>