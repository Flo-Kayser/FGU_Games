<script>
	import { getWheelSize } from '$lib/Utils.js';
	export let items = [];
	export let spinning = false;
	export let winnerIndex = 0;

	export let size;
	export let runId = '';

	export let spinSeconds = 3.2;

	let rotation = 0;
	let lastRunId = '';

	$: n = items?.length || 0;
	$: slice = n ? 360 / n : 0;

	// Labels (fallback)
	$: labels = items.map((x) => x.label || x.id || '?');

	// Hintergrund-Gradient (simple alternating shades)
	$: gradient = n
		? `conic-gradient(${labels
				.map((_, i) => {
					const a = i * slice;
					const b = (i + 1) * slice;
					const c1 = i % 2 === 0 ? 'var(--color-bgBaseC)' : 'var(--color-bgAccentC)';
					return `${c1} ${a}deg ${b}deg`;
				})
				.join(',')})`
		: 'conic-gradient(rgba(255,255,255,0.15), rgba(255,255,255,0.15))';

	$: if (spinning && runId && runId !== lastRunId && n > 0) {
		lastRunId = runId;

		const extraSpins = 5;
		const centerOffset = slice / 2;

		const target = 360 * extraSpins + (360 - (winnerIndex * slice + centerOffset)) + 90;

		const base = rotation % 360;
		const needed = target - base;
		rotation = rotation + (needed <= 0 ? needed + 360 : needed);
	}
</script>

<div class="wrap" style="--size:{size}px">
	<div class="pointer"></div>

	<div
		class="wheel"
		style="
      background: {gradient};
      transform: rotate({rotation}deg);
      transition: {spinning ? `transform ${spinSeconds}s cubic-bezier(.12,.72,.18,1)` : 'none'};
    "
	>
		{#if n > 0}
			{#each items as it, i}
				<div
					class="label"
					style="
            transform: rotate({i * slice +
						slice / 2}deg) translateY(calc(var(--size) * -0.36)) rotate(90deg);
          "
				>
					{it.label || it.id}
				</div>
			{/each}
		{/if}
	</div>

	<div class="hub"></div>
</div>
