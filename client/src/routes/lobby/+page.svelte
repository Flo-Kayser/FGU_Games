<script>
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { getSocket } from '$lib/socket.js';

	import { ensurePreFilledInTeam } from '$lib/logic/applyPreFilled.js';
	import Wheel from '$lib/components/Wheel.svelte';

	import '$lib/Utils.js';
	import { getWheelSize } from '$lib/Utils.js';
	import { browser } from '$app/environment';

	import { transitionGoto } from '$lib/Transtion/transitionGoto.js';

	let code = '';
	let levelId = '';
	let socket;

	let room = null;
	let error = '';

	let meId = '';
	let meName = '';

	let myPicks = [];
	let ready = false;

	let team = {};
	let filled = new Set();

	// Wheel UI State
	let wheelSpinning = false;
	let wheelWinnerIndex = 0;
	let wheelRunId = '';

	let ro;
	let wheelSize = 0;

	/* ---------------- Picks ---------------- */

	function pick(posId) {
		if (ready) return;
		if (myPicks.includes(posId)) return;
		if (myPicks.length >= 2) return;

		myPicks = [...myPicks, posId];
		socket.emit('room:pick', { code, picks: myPicks });
	}

	function unpick(posId) {
		if (ready) return;
		myPicks = myPicks.filter((p) => p !== posId);
		socket.emit('room:pick', { code, picks: myPicks });
	}

	function setReady(v) {
		ready = v;
		socket.emit('room:ready', { code, ready: v });
	}

	function leaveRoom() {
		try {
			socket?.emit('room:leave', { code, playerId: meId });
		} catch {}
	}

	let offUpdate, offError, offSpin, offStart;

	/* ---------------- Mount ---------------- */

	onMount(() => {
		const url = $page.url;
		code = (url.searchParams.get('code') || '').toUpperCase();
		levelId = url.searchParams.get('level') || 'demo';

		try {
			meId = localStorage.getItem('fgu_player_id') || crypto.randomUUID();
			localStorage.setItem('fgu_player_id', meId);

			meName = localStorage.getItem('fgu_player_name') || `Player_${Date.now()}`;
			localStorage.setItem('fgu_player_name', meName);
			localStorage.setItem("fgu_level_id", levelId);

		} catch {
			meId = crypto.randomUUID();
			meName = `Player_${Date.now()}`;
		}

		socket = getSocket();

		/* ---------- Room Update ---------- */

		const onRoomUpdate = (snap) => {
			room = snap;

			const me = room?.players?.find((p) => p.id === meId);
			if (me) {
				myPicks = me.picks || [];
				ready = !!me.ready;
			}

			const lvl = room?.levelId || 'demo';
			const pf = room?.level?.preFilled || [];
			team = ensurePreFilledInTeam(lvl, pf);
			filled = new Set(Object.keys(team));
		};

		/* ---------- Errors ---------- */

		const onRoomError = (e) => {
			if (typeof e === 'string') error = e;
			else if (e?.message) error = e.message;
			else error = JSON.stringify(e);
		};

		/* ---------- Wheel Spin ---------- */

		const onWheelSpin = (p) => {
			wheelSpinning = true;
			wheelWinnerIndex = p?.winnerIndex ?? 0;
			wheelRunId = p?.runId || `${Date.now()}`;

			setTimeout(() => {
				wheelSpinning = false;
			}, 3400);
		};

		/* ---------- ✅ GAME START (NEU & WICHTIG) ---------- */

		const onGameStart = ({ gameId, runId }) => {
			// 👉 EINZIGE Navigation zur Play-Seite
			goto(`/play?game=${encodeURIComponent(gameId)}&run=${encodeURIComponent(runId)}`);
		};

		socket.on('room:update', onRoomUpdate);
		socket.on('room:error', onRoomError);
		socket.on('wheel:spin', onWheelSpin);
		socket.on('game:start', onGameStart);

		socket.emit('room:join', {
			code,
			name: meName,
			playerId: meId,
			levelId
		});

		offUpdate = () => socket.off('room:update', onRoomUpdate);
		offError = () => socket.off('room:error', onRoomError);
		offSpin = () => socket.off('wheel:spin', onWheelSpin);
		offStart = () => socket.off('game:start', onGameStart);

		/* ---------- Wheel Resize ---------- */

		const el = document.querySelector('.wheel-wrapper');
		if (!el) return;

		const update = () => {
			wheelSize = getWheelSize();
		};

		update();
		ro = new ResizeObserver(update);
		ro.observe(el);
	});

	onDestroy(() => {
		leaveRoom();

		offUpdate?.();
		offError?.();
		offSpin?.();
		offStart?.();
		ro?.disconnect();
	});

	/* ---------------- Derived ---------------- */

	$: positions = room?.level?.positions || [];
	$: preFilled = new Set((room?.level?.preFilled || []).map((x) => x.posId));

	// ⚠️ IDs bleiben IDs – Titel kommen später aus Registry
	$: wheelItems = (room?.level?.games || []).map((id) => ({ id, label: id }));

	function showPopup() {
		const popup = document.querySelector('.copy-popup');
		popup.classList.add('!opacity-100');
		setTimeout(() => {
			popup.classList.remove('!opacity-100');
		}, 2000);
	}
</script>


<section class="lobby-wrapper">
	<div class="lobby-container">
		<div class="col-span-2 flex h-full flex-col justify-between">
			<div class="flex items-center gap-4 text-2xl font-bold">
				<h1>Lobby</h1>
				<span>-</span>
				<h2>Level: {levelId.toUpperCase()}</h2>
				<span>-</span>
				<h2>LobbyCode: {'*'.repeat(code.length)}</h2>
				<button
					class=" relative flex cursor-pointer items-center"
					on:click={() => {
						navigator.clipboard.writeText(code);
						showPopup();
					}}
				>
					<span
						class="copy-popup pointer-events-none absolute left-8 rounded-md border-1 p-1 text-sm whitespace-nowrap opacity-0 transition-all duration-200"
						>LobbyCode kopiert</span
					>
					<img src="/lobby/copy.png" alt="copy" class="h-6 w-6" />
				</button>
			</div>

			<div class="pitch">
				<img class="pitchImg" src="/lobby/pitch.png" alt="pitch" />

				{#each positions as pos}
					{@const locked = preFilled.has(pos.id) || filled.has(pos.id)}
					{@const selected = myPicks.includes(pos.id)}

					<button
						class="position"
						class:locked
						class:picked={myPicks.includes(pos.id)}
						style={`left:${pos.x}%; top:${pos.y}%;`}
						on:click={() => (selected ? unpick(pos.id) : pick(pos.id))}
						disabled={(ready && myPicks.length !== 2) || locked}
					>
						<img src="https://assets.easysbc.io/fc26/cards/s_102_0.png" alt="card_placeholder" />
						<span>{pos.label}</span>
					</button>
				{/each}
			</div>
		</div>
		<div class="flex h-full flex-col gap-2">
			<div class="flex flex-col gap-4 border-b-2 border-l-2 p-4">
				<button
					class="btn-lobby bg-white/30 py-2"
					on:click={async () => {
						await transitionGoto('/', { mode: 'vertical' });
						location.reload();
					}}>Hauptmenü</button
				>
				<div class="flex flex-col gap-2 bg-white/30 p-2">
					<h3 class="flex justify-between">
						<span>Spieler online:</span> &gt;&gt; {room?.players?.length} / 2 &lt;&lt;
					</h3>
					<ul>
						{#each room?.players as p}
							<li class="flex items-center justify-end">
								<div>
									{p.name}
									{#if meName === p.name}(Du){/if}
									{p.ready ? '- Bereit' : '- Nicht Bereit'}
								</div>
							</li>
						{/each}
					</ul>
				</div>
			</div>

			<div class="mt-2 w-full text-center text-sm font-bold">
				<p>Wähle Zwei Postionen und mach dich bereit für das Auslosen des Minispiels!</p>
				<div class="flex flex-col items-center gap-4 p-4 text-base">
					<span>PostionsPicks: {myPicks.length}/2</span>
					<button
						class="btn-lobby w-2/3 bg-white/30 py-2"
						on:click={() => setReady(!ready)}
						disabled={myPicks.length !== 2}
					>
						{ready ? 'Nicht bereit' : 'Bereit'}
					</button>
				</div>
			</div>

			<div class="wheel-wrapper mb-2 flex h-full w-full items-center justify-center">
				{#if browser}
					<Wheel
						items={wheelItems}
						spinning={wheelSpinning || room?.phase === 'spinning'}
						winnerIndex={wheelWinnerIndex}
						runId={wheelRunId}
						size={wheelSize}
						spinSeconds={3.2}
					/>
				{/if}
			</div>
		</div>
	</div>
</section>
