{#each links as link}
    <li>
        <a
            on:click|preventDefault={() => page(link.path)}
            class:active={link.app === $activeApp}
            href={link.path}
        >
            {link.text}
        </a>
    </li>
{/each}
<li>
    <NavDropdown showOpenIcon={false}>
        <span slot="button">
            <Icon icon="user-circle" noPadding={true} />
            <span class="sr-only">User Options</span>
        </span>

        <div slot="menu">
            <ul>
                {#each window.app.links as link}
                    <li>
                        <a class="button" href={link.path}>
                            <Icon icon={link.icon} />
                            {link.text}
                        </a>
                    </li>
                {/each}
                {#if $settings.touchpadMode}
                    <li>
                        <button on:click|stopPropagation={setUserInactive}>
                            <Icon icon="moon" />
                            Sleep
                        </button>
                    </li>
                {/if}
                <li>
                    <Link href="/settings" classes="button">
                        <Icon icon="cog" />
                        Settings
                    </Link>
                </li>
                <li>
                    <a href="/auth/logout" class="button">
                        <Icon icon="sign-out-alt"/>
                        Logout
                    </a>
                </li>
            </ul>
        </div>
    </NavDropdown>
</li>

<script>
    import {NavDropdown, Icon} from 'sheodox-ui';
    import {setUserInactive} from "./stores/app";
    import page from 'page';
    import {activeApp} from "./stores/routing";
    import {settings} from "./stores/app";
    import Link from "./Link.svelte";

    const links = [{
        path: '/',
        app: 'live',
        text: 'Live',
    }, {
        path: '/archive',
        app: 'archive',
        text: 'Archive'
    }, {
        path: '/dashboard',
        app: 'dashboard',
        text: 'Dashboard'
    }]
</script>