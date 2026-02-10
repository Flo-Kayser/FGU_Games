<script>
	import { getPlayerImgPath } from '$lib/Utils.js';
	import { onMount,onDestroy } from 'svelte';
	import {browser} from "$app/environment";

	export let phase = 'idle',
		mode = 'vertical';

	let imgPath = null;

	function refreshImg() {
		imgPath = getPlayerImgPath('full');
	}

	onMount(() => {
		if (!browser) return;

		refreshImg();
		window.addEventListener('fgu:playerChanged', refreshImg);
	});

	onDestroy(() => {
		if (!browser) return;
		window.removeEventListener('fgu:playerChanged', refreshImg);
	});
</script>

{#if mode === 'vertical'}
	<div class="overlay overlay-vertical {phase}">
		<img src={imgPath} alt="PlayerImage" />
	</div>
{:else if mode === 'sides'}
	<div class="overlay-sides {phase}">
		<div class="panel left"></div>
		<div class="panel right"></div>
	</div>
{/if}
