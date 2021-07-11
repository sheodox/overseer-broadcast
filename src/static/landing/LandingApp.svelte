<Header appName="Overseer Broadcast" slim={false}>
    <svg viewbox="0 0 100 100" slot="logo">
        <image xlink:href="/logo.svg"></image>
    </svg>
</Header>
<div class="account-form m-5 p-5 f-column align-items-center">
    {#if showLogin}
        <Login />
        <button on:click={() => showLogin = false}>Don't have an account yet?</button>
    {:else}
        <SignUp />
        <button on:click={() => showLogin = true}>Already have an account?</button>
    {/if}
</div>
<Toasts />

<script>
    import {Header, Toasts} from 'sheodox-ui';
    import SignUp from "./SignUp.svelte";
    import Login from "./Login.svelte";

    let showLogin = true;
</script>