import { browser } from '$app/environment';

export function getWheelSize() {
	const wheelWrapper = document.querySelector('.wheel-wrapper');

	if (!wheelWrapper) return 0;

	const rect = wheelWrapper.getBoundingClientRect();

	return Math.min(rect.width, rect.height);
}

export function getPlayerName() {
	if (!browser) return null;

	const name = localStorage.getItem('fgu_player_name');

	return name ? String(name) : null;
}

export function getPlayerImgPath(imgType) {
	if (!browser) return null;

	const name = getPlayerName().toLowerCase().split(' ')[0];
	const shortName = name ? name[0] + name[name.length - 1] : '';

	if (imgType === 'head' || imgType === 'full')
		return `/charImg/${shortName}_${imgType === 'head' ? 'quad' : 'bg_rem'}.png`;
}
