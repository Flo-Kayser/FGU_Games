<script>
    export let state;
    export let send;

    let value = "";

    function submit() {
        const v = (value || "").trim();
        if (!v) return;
        send({ type: "answer", value: v });
        value = "";
    }

    const secondsLeft = (ms) => Math.max(0, Math.ceil(ms / 1000));
</script>

<div class="p-6">
    <div class="flex items-center justify-between">
        <h1 class="text-2xl font-black">{state.game.title}</h1>
        <div class="font-black">
            {secondsLeft(state.endAt - Date.now())}s
        </div>
    </div>

    <div class="mt-4 flex gap-2">
        <input
                class="w-full rounded-xl bg-zinc-900 p-3 text-xl"
                bind:value
                placeholder="Name eingeben…"
                on:keydown={(e) => e.key === "Enter" && submit()}
        />
        <button class="rounded-xl bg-white px-4 font-black text-black" on:click={submit}>
            OK
        </button>
    </div>

    <div class="mt-6 grid grid-cols-2 gap-3">
        <div class="rounded-2xl bg-zinc-900 p-4">
            <div class="text-sm opacity-70">Du</div>
            <div class="text-3xl font-black">{state.game.view.me}</div>
        </div>
        <div class="rounded-2xl bg-zinc-900 p-4">
            <div class="text-sm opacity-70">Gegner</div>
            <div class="text-3xl font-black">{state.game.view.other}</div>
        </div>
    </div>
</div>

{#if state?.game?.view?.debugAllowed}
    <details class="mt-6 rounded-xl bg-black/40 p-3 text-xs">
        <summary class="cursor-pointer font-bold">
            DEBUG Allowed ({state.game.view.debugAllowed.length})
        </summary>
        <div class="mt-2 font-mono opacity-80">
            input: "{value}"<br />
        </div>
        <ul class="mt-2 max-h-48 overflow-auto space-y-1">
            {#each state.game.view.debugAllowed as a}
                <li class="font-mono opacity-70">{a}</li>
            {/each}
        </ul>
    </details>
{/if}

