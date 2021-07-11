<style>
    .integration {
        max-width: 30rem;
    }

</style>
<Header appName="Overseer Broadcast">
    <svg viewbox="0 0 100 100" slot="logo">
        <image xlink:href="/logo.svg"></image>
    </svg>
</Header>

<div class="page-content">
    <div class="integration">
        <RegisterCamera />
    </div>
    <UserPermissions />
</div>



<Toasts />

<script>
    import {Header, Toasts} from 'sheodox-ui';
    import RegisterCamera from "./RegisterCamera.svelte";
    import UserPermissions from "./UserPermissions.svelte";
</script>