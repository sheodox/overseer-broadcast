import {writable} from 'svelte/store';
import page from 'page';

export const activeApp = writable();
export const activeRouteParams = writable({});

function setRoute(app) {
    return pageData => {
        activeApp.set(app);
        activeRouteParams.set(pageData.params);
    }
}

page('/', setRoute('live'))
page('/archive', setRoute('archive'))
page('/archive/:clipFileName', setRoute('archive'))
page('/dashboard', setRoute('dashboard'))
page('/settings', setRoute('settings'))
page();
