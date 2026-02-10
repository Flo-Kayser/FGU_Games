<script>
    import { onMount, onDestroy } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { getSocket } from "$lib/socket.js";
    import { getOrCreatePlayerId } from "$lib/storage/playerStore.js";
    import {upsertRewards} from "$lib/storage/teamStore.js";

    import ListGame from "$lib/games/list/Game.svelte";

    let socket;
    let state = null;

    let storedForRun = new Set();


    let playerId = "";
    try {
        playerId = localStorage.getItem("fgu_player_id") || crypto.randomUUID();
        localStorage.setItem("fgu_player_id", playerId);
    } catch {
        playerId = crypto.randomUUID();
    }


    // URL Params
    $: runId = $page.url.searchParams.get("run");
    $: gameId = $page.url.searchParams.get("game");

    function send(payload) {
        socket.emit("game:event", {
            runId,
            playerId,
            payload
        });
    }

    function ackRules() {
        socket.emit("game:ack_rules", {
            runId,
            playerId
        });
    }

    function backToLobby() {
        const code = state?.roomCode;
        if (code) goto(`/lobby?code=${encodeURIComponent(code)}`);
    }

    const secondsLeft = (ms) =>
        Math.max(0, Math.ceil(ms / 1000));

    let tick;

    onMount(() => {
        socket = getSocket();

        socket.emit("game:join", { runId, playerId });

        const onState = (s) => {
            state = s;

            if (state?.phase === "result") {
                const myRewards = state?.result?.payout?.rewards?.[playerId] || [];
                const levelId = state?.result?.payout?.levelId || "demo";

                upsertRewards(levelId, myRewards);
            }
        };

        socket.on("game:state", onState);

        tick = setInterval(() => {
            socket.emit("game:tick", { runId });
        }, 250);

        return () => {
            socket.off("game:state", onState);
            clearInterval(tick);
        };
    });

</script>

<div style="position:fixed;top:0;left:0;z-index:9999;background:#000;color:#0f0;padding:6px;font:12px monospace;">
    run={runId || "-"} | game={gameId || "-"}
</div>


{#if !state}
    <div class="p-6 text-xl">Verbinde…</div>
{:else}

    <!-- RULES -->
    {#if state.phase === "rules"}
        <div class="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
            <div class="w-full max-w-xl rounded-2xl bg-zinc-900 p-6">
                <h2 class="text-2xl font-black">
                    {state.game.title}
                </h2>

                <ul class="mt-4 list-disc pl-6 space-y-1">
                    {#each state.game.rules as r}
                        <li>{r}</li>
                    {/each}
                </ul>

                <button
                        class="mt-6 w-full rounded-xl bg-white py-3 font-black text-black cursor-pointer"
                        on:click={ackRules}
                >
                    OK
                </button>
            </div>
        </div>
    {/if}

    <!-- COUNTDOWN -->
    {#if state.phase === "countdown"}
        <div class="fixed inset-0 z-40 grid place-items-center bg-black/70">
            <div class="text-7xl font-black">
                {secondsLeft(state.startAt - Date.now())}
            </div>
        </div>
    {/if}

    <!-- RUNNING -->
    {#if state.phase === "running"}
        <ListGame {state} {send} />
    {/if}

    <!-- RESULT -->
    {#if state.phase === "result"}
        <div class="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
            <div class="w-full max-w-xl rounded-2xl bg-zinc-900 p-6 text-center">
                <h2 class="text-3xl font-black mb-4">
                    Ergebnis
                </h2>

                {#if state.result?.payout?.outcome === "draw"}
                    <div class="text-2xl font-black">DRAW</div>
                {:else if state.result?.payout?.winnerId === playerId}
                    <div class="text-2xl font-black">GEWONNEN</div>
                {:else}
                    <div class="text-2xl font-black">VERLOREN</div>
                {/if}

                <button
                        class="mt-6 w-full rounded-xl bg-white py-3 font-black text-black"
                        on:click={backToLobby}
                >
                    Zurück zur Lobby
                </button>
            </div>
        </div>
    {/if}

{/if}
