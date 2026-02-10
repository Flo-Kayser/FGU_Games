import { writable } from 'svelte/store';

export const transition = writable({
	phase: 'idle', // idle | cover | uncover
	mode: 'vertical' // vertical | slides
});

export function setTransition(phase, mode) {
	transition.set({ phase, mode });
}
