import '../../node_modules/sheodox-ui/style.scss';
import App from './app/App.svelte';
import "./app/stores/routing";

new App({
    target: document.getElementById('app-root')
});
