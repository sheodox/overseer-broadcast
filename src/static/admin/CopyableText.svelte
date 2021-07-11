<TextInput {value} {id}>
    {label}
    <button type="button" slot="append" on:click={copy} class="primary">
        Copy
    </button>
</TextInput>

<script>
    import {TextInput} from 'sheodox-ui';
    export let value;
    export let label;
    export let id;

    function copy() {
        document.querySelector(`#text-input-${id}`).select();
        document.execCommand('copy');
    }
</script>