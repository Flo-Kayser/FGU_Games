const KEY_ID = 'fgu_player_id';
const KEY_NAME = 'fgu_player_name';

export function getOrCreatePlayerId() {
	try {
		let id = localStorage.getItem(KEY_ID);
		if (!id) {
			id = crypto.randomUUID();
			localStorage.setItem(KEY_ID, id);
		}
		return id;
	} catch {
		return crypto.randomUUID();
	}
}

export function getOrCreatePlayerName() {
	try {
		let name = localStorage.getItem(KEY_NAME);
		if (!name) {
			name = `Player_${Date.now()}`;
			localStorage.setItem(KEY_NAME, name);
		}
		return name;
	} catch {
		return `Player_${Date.now()}`;
	}
}
export function setPlayerName(name) {
	const n = String(name || '').trim();
	if (!n) return;
	try {
		localStorage.setItem(KEY_NAME, n);
	} catch {
		// ignore
	}
}
