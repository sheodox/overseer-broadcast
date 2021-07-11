<Header appName="Overseer Broadcast" breakpoint="medium">
    <svg viewbox="0 0 100 100" slot="logo">
        <image xlink:href="/logo.svg"></image>
    </svg>
    <nav slot="nav">
        <ul>
            <HeaderNav />
        </ul>
    </nav>
</Header>

<Routing />
<Toasts />
{#if !$userActive && $settings.touchpadMode}
    <Screensaver />
{/if}

<script>
    import {Header, Toasts} from 'sheodox-ui';
    import HeaderNav from "./HeaderNav.svelte";
    import Routing from "./Routing.svelte";
    import Screensaver from "./screensaver/Screensaver.svelte";
    import {userActive, settings} from "./stores/app";
    import './app.scss';
</script>