<script>
	import { apiClient } from '$lib/api/ApiClient.js';
	import { versionIndexStore } from '$lib/storage/sessionStore.js';

	export let cardId;

	let playerId = null;
	let resourceId = null;
	let playerData = null;
	let loading = false;
	let error = null;
	let dynamicPos = false;

	$: if (cardId) {
		const parts = cardId.split('_');

		playerId = parts[0] || null;
		resourceId = parts[1] || null;
	}

	$: if (playerId) {
		loadPlayer(playerId);
	}

	async function loadPlayer(pid) {
		loading = true;
		error = null;

		try {
			const data = await apiClient.fetchData(`/players/${pid}.json`);

			playerData = {
				cardName: data.cardName,
				playerStats: data[resourceId]
			};
			dynamicPos = playerData?.playerStats?.hasDynamicImage ?? null;
		} catch (e) {
			error = e;
			playerData = null;
		} finally {
			loading = false;
		}
	}
	function handleError(e) {
		e.currentTarget.src = `https://cdn.easysbc.io/fc26/players/${playerId}.png`;
	}
	function checkRealSize(e) {
		const img = e.currentTarget;
		const ratio = img.naturalHeight / img.naturalWidth;
		console.log('Real size ratio:', ratio);
		if (ratio < 1.3 && ratio > 0.7) {
			dynamicPos = false;
		} else {
			dynamicPos = true;
		}
	}

	$: console.log(playerData?.playerStats?.rating);
	$: version = $versionIndexStore?.versions?.[playerData?.playerStats?.versionId] ?? {};
	$: primaryColor = version.details?.primaryColor;
</script>

<div class="relative overflow-hidden" style="color: {primaryColor}">
	<img src={version?.details?.url} class="h-full w-full" alt="cardBg" />
	<div class="absolute top-[64%] left-1/2 -translate-x-1/2 font-bold whitespace-nowrap text-[10px] 3xl:text-[14px]">
		{playerData?.cardName}
	</div>
	<img
		src={`https://cdn.easysbc.io/fc26/players/${resourceId}.png`}
		alt="playerImg"
		class="{dynamicPos ? '-top-1.5 left-1' : '-top-4.5 left-4 scale-60'} absolute text-[20px]"
		on:load={checkRealSize}
		on:error={(e) => {
			handleError(e);
		}}
	/>
	<div class="absolute top-[20%] left-[18%] flex flex-col -space-y-1 font-bold">
		<span class="text-[20px]">{playerData?.playerStats?.rating}</span>
		<span class="text-[10px]">{playerData?.playerStats?.preferredPosition}</span>
	</div>

	<div
		class="absolute top-[30.5%] left-1/2 flex -translate-x-1/2 items-center justify-center gap-8 scale-25"
	>
		<img
			src={`https://cdn.easysbc.io/fc26/countries/${playerData?.playerStats?.countryId}.png`}
			alt="."
			class="w-4.5 scale-y-[.95] text-[0px]"
		/>
		<img
			src={`https://cdn.easysbc.io/fc26/leagues/dark/${playerData?.playerStats?.leagueId}.png`}
			alt="."
			class="h-4 text-[0px]"
			on:error={(e) => {
				const img = e.currentTarget;
				img.src = `https://cdn.easysbc.io/fc26/leagues/${playerData?.playerStats?.leagueId}.png`;
				img.onerror = null;
			}}
		/>

		{#if playerData?.playerStats?.clubId !== 112658}
			<img
				src={`https://cdn.easysbc.io/fc26/clubs/dark/${playerData?.playerStats?.clubId}.png`}
				alt="."
				class="h-4 text-[0px]"
				on:error={(e) => {
					const img = e.currentTarget;
					img.src = `https://cdn.easysbc.io/fc26/clubs/${playerData?.playerStats?.clubId}.png`;
					img.onerror = null;
				}}
			/>
		{/if}
	</div>
</div>
