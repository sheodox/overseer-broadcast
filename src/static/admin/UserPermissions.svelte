{#if users}
    <h2>User Permissions</h2>
    <table>
        <thead>
            <tr>
                <th>User</th>
                <th>Permitted</th>
            </tr>
        </thead>
        <tbody>
            {#each users as user (user.id)}
                <tr>
                    <td>
                        {user.firstName} {user.lastName}
                        <br>
                        {user.email}
                    </td>
                    <td>
                        <Checkbox bind:checked={user.permitted} on:change={(e) => togglePermitted(user.id, e.target.checked)} id="permitted-{user.id}">
                            Permitted
                        </Checkbox>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
{/if}
<script>
    import {onMount} from 'svelte';
    import {Checkbox} from 'sheodox-ui';
    let users;

    async function togglePermitted(userId, permitted) {
        await fetch(`/admin/users/${userId}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({permitted})
        })
    }

    onMount(async () => {
        users = await fetch('/admin/users').then(res => res.json());
        console.log({users})
    })
</script>