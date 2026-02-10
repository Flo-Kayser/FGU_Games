// server/config/validateLevel.js

function isNum(n) {
  return Number.isFinite(n);
}

export function validateLevel(level) {
  const errors = [];

  if (!level || typeof level !== "object") {
    return { ok: false, errors: ["Level is missing."] };
  }

  const { id, label, games, positions, winnerIds, loserIds, preFilled } = level;
  const picksPerRound = Number.isFinite(level.picksPerRound)
    ? level.picksPerRound
    : 2;

  if (!id || typeof id !== "string") errors.push("id must be a string.");
  if (!label || typeof label !== "string")
    errors.push("label must be a string.");

  if (!Array.isArray(games) || games.length === 0)
    errors.push("games must be a non-empty array.");

  // positions objects
  if (!Array.isArray(positions) || positions.length === 0) {
    errors.push("positions must be a non-empty array.");
  } else {
    const ids = positions.map((p) => p?.id);
    const set = new Set(ids);

    if (ids.some((x) => !x || typeof x !== "string"))
      errors.push("every position must have id: string.");
    if (set.size !== ids.length)
      errors.push("positions contains duplicate ids.");

    for (const p of positions) {
      if (!p?.label || typeof p.label !== "string")
        errors.push(`position '${p?.id}' label must be a string.`);
      if (!isNum(p?.x) || p.x < 0 || p.x > 100)
        errors.push(`position '${p?.id}' x must be 0..100.`);
      if (!isNum(p?.y) || p.y < 0 || p.y > 100)
        errors.push(`position '${p?.id}' y must be 0..100.`);
    }

    // winner/loser arrays match positions length
    if (!Array.isArray(winnerIds) || winnerIds.length !== positions.length) {
      errors.push("winnerIds length must equal positions length.");
    }
    if (!Array.isArray(loserIds) || loserIds.length !== positions.length) {
      errors.push("loserIds length must equal positions length.");
    }

    // preFilled validity
    const pf = Array.isArray(preFilled) ? preFilled : [];
    const pfSet = new Set();

    for (const slot of pf) {
      const pid = slot?.posId;
      if (!pid || typeof pid !== "string")
        errors.push("preFilled.posId must be a string.");
      else {
        if (!set.has(pid))
          errors.push(`preFilled.posId '${pid}' not in positions.`);
        if (pfSet.has(pid)) errors.push(`preFilled.posId '${pid}' duplicated.`);
        pfSet.add(pid);
      }
      if (!slot?.cardId || typeof slot.cardId !== "string")
        errors.push("preFilled.cardId must be a string.");
    }

    // slot math: availablePositions == games * picksPerRound
    if (!Number.isFinite(picksPerRound) || picksPerRound <= 0) {
      errors.push("picksPerRound must be > 0.");
    } else {
      const available = positions.filter((p) => !pfSet.has(p.id));
      const expected = (games?.length || 0) * picksPerRound;

      // if (expected > 0 && available.length !== expected) {
      //   errors.push(
      //     `availablePositions (${available.length}) must equal games.length * picksPerRound (${expected}).`,
      //   );
      // }
    }
  }

  return { ok: errors.length === 0, errors };
}
