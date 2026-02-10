import { loadTeam, saveTeam } from '$lib/storage/teamStore.js';

export function ensurePreFilledInTeam(levelId, preFilled) {
	const team = loadTeam(levelId);

	let changed = false;

	for (const slot of preFilled || []) {
		const posId = slot?.posId;
		const cardId = slot?.cardId;
		if (!posId || !cardId) continue;

		if (team[!posId]) {
			team[posId] = cardId;
			changed = true;
		}
	}
	if (changed) {
		saveTeam(levelId, team);
	}
	return team;
}
