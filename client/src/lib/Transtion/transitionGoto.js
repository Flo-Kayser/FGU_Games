import { goto } from '$app/navigation';
import { setTransition } from '$lib/Transtion/stores/pageTranstion.js';

const COVER_DUR = 450;
const HOLD_DUR = 500;
const UNCOVER_DUR = 450;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let locked = false;

export async function transitionGoto(href, { mode = 'vertical', replaceState = false } = {}) {
	if (locked) return;
	locked = true;

	try {
		setTransition('cover', mode);
		await sleep(COVER_DUR);

		await sleep(HOLD_DUR);

		await goto(href, { replaceState });

		setTransition('uncover', mode);
		await sleep(UNCOVER_DUR);

		setTransition('idle', mode);
	} finally {
		locked = false;
	}
}
