function key(levelId) {
	return `fgu_team_${levelId || 'demo'}`;
}

export function loadTeam(levelId) {
	try {
		const raw = localStorage.getItem(key(levelId));
		return raw ? JSON.parse(raw) : {};
	} catch {
		return {};
	}
}

export function saveTeam(levelId, team) {
	try {
		localStorage.setItem(key(levelId), JSON.stringify(team || {}));
	} catch {
		// ignore
	}
}

export function upsertRewards(levelId, rewards) {
	if (!Array.isArray(rewards) || rewards.length === 0) return;

	const team = loadTeam(levelId);

	for (const it of rewards) {
		if (!it?.pos || !it?.cardId) continue;
		team[it.pos] = it.cardId;

		saveTeam(levelId, team);
	}
}

export function teamFilledPositions(team) {
	return new Set(Object.keys(team || {}));
}
