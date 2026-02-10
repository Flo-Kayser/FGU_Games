import { browser } from '$app/environment';
import { beforeNavigate, afterNavigate } from '$app/navigation';

export function initHistoryGuard({
	lockBoth = ['/lobby', '/play'],
	lockHome = true,
	homePath = '/'
} = {}) {
	if (!browser) return; // SSR guard

	let currentPath = location.pathname;

	const isLockBoth = (pathname) =>
		lockBoth.some((p) => pathname === p || pathname.startsWith(p + '/'));

	const isHome = (pathname) => pathname === homePath;

	afterNavigate(({ to }) => {
		currentPath = to?.url?.pathname ?? location.pathname;
	});

	beforeNavigate(({ type, cancel }) => {
		if (type !== 'popstate') return; // nur Browser Back/Forward

		if (isLockBoth(currentPath)) return cancel();

		if (lockHome && isHome(currentPath)) return cancel();
	});
}
