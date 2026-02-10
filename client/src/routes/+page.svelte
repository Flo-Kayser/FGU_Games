<script>
	import { transitionGoto } from '$lib/Transtion/transitionGoto.js';
	import { onMount } from 'svelte';
	import {getPlayerName} from "$lib/Utils.js";


	let name = '';
	let code = '';
	let levelId = 'demo';


	onMount(() => {
		const storedName = getPlayerName();
		if (storedName) {
			name = storedName;
		}
	});

	async function join() {
		const n = (name || '').trim() || `Player_${Date.now()}`;
		const c = (code || '').trim().toUpperCase() || 'Lobby#1';

		let playerId;

		try {
			playerId = localStorage.getItem('fgu_player_id');

			if (!playerId) {
				playerId = crypto.randomUUID();
				localStorage.setItem('fgu_player_id', playerId);
			}

			localStorage.setItem('fgu_player_name', n);
			window.dispatchEvent(new Event('fgu:playerChanged'));

		} catch {
			playerId = crypto.randomUUID();
		}

		await transitionGoto(
				`/lobby?code=${encodeURIComponent(c)}&level=${encodeURIComponent(levelId)}`,
				{ mode: 'vertical' }
		);
	}

	const chars = [
		{
			name: 'Max Malle',
			img: '/charImg/mx_quad.png',
			video: '/charVideo/mx_clip.mp4',
			skills: ['regelmäßig neue Videos', 'Jule Brand als BackUp']
		},
		{
			name: 'Julian FGU',
			img: '/charImg/jn_quad.png',
			video: '/charVideo/jn_clip.mp4',
			skills: ['kennt jede SBC auswendig', 'folgt flo.kysr auf Instagram']
		},
		{
			name: 'Julius FGU',
			img: '/charImg/js_quad.png',
			video: '/charVideo/js_clip.mp4',
			skills: ['erkennt Spieler nur an der Frisur', 'hat im Account-Battle die Nase vorn']
		},
		{
			name: 'Tim Latka',
			img: '/charImg/tm_quad.png',
			video: '/charVideo/tm_clip.mp4',
			skills: ['unverschämt gutes Packluck', 'holt mit "Spaßteam" 15 Siege']
		}
	];

</script>

<section class="flex h-full flex-col items-center gap-4 bg-bgBaseC p-4 py-20">
	<h2 class="flex flex-col gap-2 text-center text-5xl font-black">
		Willkommen bei den ersten offiziellen <span class="text-7xl text-bgAccentC">FGU-Spielen</span>
	</h2>
	<div class="my-2 w-2/3 border-b-2 border-textC/40"></div>
	<p class="text-2xl font-bold">Wähle deinen Charakter, aber wähle weise:</p>

	<div
		class="container mx-auto grid w-full grid-cols-2 place-items-center gap-30 py-10 pb-16 xl:grid-cols-3 2xl:grid-cols-4"
	>
		{#each chars as char}
			<label
				class="charCard"
				class:active={name === char.name}
				on:mouseenter={() => char._video?.play?.().catch?.(() => {})}
				on:mouseleave={() => {
					char._video?.pause();
					char._video && (char._video.currentTime = 0);
				}}
			>
				<div class="charBanner">
					<div class="vidBox">
						<video
							src={char.video}
							type="video/mp4"
							muted
							loop
							bind:this={char._video}
							playsinline
							preload="metadata"
						></video>
					</div>
				</div>
				<div class="charStats">
					<div class="charInfo">
						<span class="name">
							{char.name}
						</span>
						<div>
							<span class="SkillsTitle">Skills:</span>
							<ul class="SkillsList">
								{#each char.skills as skill}
									<li>{skill}</li>
								{/each}
							</ul>
						</div>
					</div>
					<div class="fakeBtn">{name === char.name ? 'Ausgewählt' : 'Auswählen'}</div>
				</div>
				<div class="charImg">
					<div class="imgBox">
						<img src={char.img} alt={char.name} />
					</div>
				</div>
				<input type="radio" class="sr-only" bind:group={name} value={char.name} />
			</label>
		{/each}
	</div>

	<div class="flex w-2/3 flex-col items-center gap-4 border-t-2 border-textC/40 px-10 py-10">
		<div class="flex w-full gap-4">
			<span class="w-full text-start">Level wählen und LobbyCode eingeben:</span>
			<div class="flex flex-col gap-4 rounded-md bg-textC/40 p-4">
				<label class="grid w-full grid-cols-2 items-center gap-2 whitespace-nowrap">
					<span class="">Level:</span>
					<select bind:value={levelId} class="border-2 px-2 py-1 text-black">
						<option value="demo">Demo</option>
					</select>
				</label>
				<label class="grid w-full grid-cols-2 items-center gap-2 whitespace-nowrap">
					<span class="">Lobby Code:</span>
					<input
							bind:value={code}
							type="password"
							placeholder="Lobby-Code"
							autocomplete="off"
							name="lobby-code"
							inputmode="text"
							class="border-2 px-2 py-1"
					/>
				</label>
			</div>
		</div>

		<button
			class="w-full cursor-pointer rounded-md bg-white/40 py-2 text-2xl font-bold transition-all duration-150 hover:bg-white/60 disabled:pointer-events-none disabled:opacity-15"
			disabled={name === '' || code.trim() === ''}
			on:click={join}>Lobby beitreten</button
		>
	</div>
</section>
