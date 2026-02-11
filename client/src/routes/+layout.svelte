<script>
	import "$lib/Css/App.css"
    import {onMount} from "svelte";
	import favicon from '$lib/assets/favicon.svg';

    import TransitionOverlay from "$lib/Transtion/TransitionOverlay.svelte";
    import {transition} from "$lib/Transtion/stores/pageTranstion.js";

    import {initHistoryGuard} from "$lib/navigation/historyGuard.js";
    import {apiClient} from "$lib/api/ApiClient.js";
    import {versionIndexStore} from "$lib/storage/sessionStore.js";

	let { children } = $props();

    onMount(() => {
        initHistoryGuard({
            lockBoth: ['/lobby', '/play'],
            lockHome: true,
            homePath: '/'
        });

        apiClient.fetchData('index-data/versionIndex.json').then(versionIndexStore.set)
    })
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<TransitionOverlay phase={$transition.phase} mode={$transition.mode}/>
{@render children()}
