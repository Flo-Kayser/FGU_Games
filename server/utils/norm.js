export function normCode(code) {
    return String(code || "").trim().toUpperCase().slice(0,6)
}

export function normName(name) {
    return String(name || "").trim() || "???"
}