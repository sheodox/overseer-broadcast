<h2>Register a camera</h2>

<form on:submit|preventDefault={submit} class="m-3">
    <TextInput id="camera-name" bind:value={name}>
        Camera Name
        <button slot="append" class="primary">Add</button>
    </TextInput>
</form>

{#if jwt}
    <div class="m-3">
        <CopyableText value={jwt} label="Camera JWT" id="camera-jwt" />
    </div>
{/if}

<script>
    import {createAutoExpireToast, TextInput} from 'sheodox-ui';
    import CopyableText from "./CopyableText.svelte";

    let name, jwt;

    async function submit() {
        const res = await fetch('/admin/integration/broadcaster', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name})
        });

        if (res.status === 200) {
            jwt = (await res.json()).jwt;
        }
        else {
            createAutoExpireToast({
                variant: 'error',
                title: 'Error',
                message: `Integration creation returned status code ${res.status}`
            })
        }
    }
</script>