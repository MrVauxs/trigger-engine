import { TriggerHook } from "engine";
import {
    ActorPF2e,
    AuraData,
    R,
    ScenePF2e,
    TokenAura,
    TokenDocumentPF2e,
    activateHooksAndWrappers,
    createToggleWrapper,
    deleteInMemory,
    disableHooksAndWrappers,
    getInMemory,
    setInMemory,
} from "foundry-helpers";

class AuraHook extends TriggerHook<AuraEventOptions> {
    #active: boolean = false;

    #wrappers = [
        createToggleWrapper(
            "WRAPPER",
            "CONFIG.Token.documentClass.prototype.prepareBaseData",
            this.#tokenPrepareBaseData,
            { context: this },
        ),
        createToggleWrapper(
            "WRAPPER",
            "CONFIG.Token.documentClass.prototype.simulateUpdate",
            this.#tokenSimulateUpdate,
            { context: this },
        ),
        createToggleWrapper("WRAPPER", "CONFIG.Scene.documentClass.prototype.prepareData", this.#scenePF2ePrepareData, {
            context: this,
        }),
    ];

    get events(): ["aura-enter-event", "aura-leave-event"] {
        return ["aura-enter-event", "aura-leave-event"];
    }

    get otherNodes(): ["inside-aura"] {
        return ["inside-aura"];
    }

    _enable(): void {
        this.#active = true;
        this._listen();
    }

    _disable(): void {
        this.#active = false;

        disableHooksAndWrappers(this.#wrappers);

        const tokens = getSceneTokens();
        const sceneActors = getTokensActors(tokens);

        for (const actor of sceneActors) {
            deleteInMemory(actor, "auras");
        }
    }

    _listen(): void {
        activateHooksAndWrappers(this.#wrappers);

        const scene = game.scenes.current;
        if (!scene || !canvas.ready || !scene.isInFocus || scene.grid.type !== CONST.GRID_TYPES.SQUARE) return;

        const tokens = getSceneTokens();
        const auras = tokens.flatMap((token) => Array.from(token.auras.values()));

        for (const aura of auras) {
            const auraActor = aura.token.actor;
            const auraData = auraActor?.auras.get(aura.slug);

            if (!auraActor || !auraData) return;

            const auradTokens = scene.tokens.filter((token) => aura.containsToken(token));
            const affectedActors = getTokensActors(auradTokens);
            const origin = { actor: auraActor, token: aura.token };

            for (const actor of affectedActors) {
                if (actor === auraActor) continue;
                setAuraInMemory(actor, auraData, origin);
            }
        }
    }

    #tokenPrepareBaseData(token: TokenDocumentPF2e, wrapped: libWrapper.RegisterCallback) {
        wrapped();

        for (const aura of token.auras.values()) {
            Object.defineProperty(aura, "notifyActors", {
                value: () => this.#notifyActors(aura),
            });
        }
    }

    #tokenSimulateUpdate(
        _token: TokenDocumentPF2e,
        wrapped: libWrapper.RegisterCallback,
        actorUpdates?: Record<string, unknown>,
    ): void {
        wrapped(actorUpdates);
        this.#checkTokensAuras();
    }

    #scenePF2ePrepareData(_scene: ScenePF2e, wrapped: libWrapper.RegisterCallback) {
        wrapped();
        this.#checkTokensAuras();
    }

    #checkTokensAuras() {
        const tokens = getSceneTokens();
        const sceneActors = getTokensActors(tokens);
        const tokensAuras = tokens.flatMap((token) => Array.from(token.auras.values()));

        for (const actor of sceneActors) {
            const actorAuras = getAurasInMemory(actor);
            if (!actorAuras.length) continue;

            const actorTokens = actor.getActiveTokens(true, true);

            for (const aura of actorAuras) {
                if (aura.origin.actor === actor) continue;

                const tokenAura = tokensAuras.find(
                    ({ slug, token }) => slug === aura.data.slug && token === aura.origin.token,
                );
                const token = tokenAura ? actorTokens.find((token) => tokenAura.containsToken(token)) : undefined;

                if (!token) {
                    removeAuraFromMemory(actor, aura.data, aura.origin);

                    // we only execute triggers if the hook is actually active
                    if (this.#active && game.user.isActiveGM && this.isValidActor(actor)) {
                        const target = { actor, token: actorTokens.at(0) };
                        this.executeEvent("aura-leave-event", { aura, target });
                    }
                }
            }
        }
    }

    /**
     * rewrite of
     * https://github.com/foundryvtt/pf2e/blob/d179b37b0389a1d6b238f3dd2ad125a04b958184/src/module/scene/token-document/aura/index.ts#L87
     */
    async #notifyActors(aura: TokenAura): Promise<void> {
        if (!aura.scene.isInFocus) return;

        const auraActor = aura.token.actor;
        const auraData = auraActor?.auras.get(aura.slug);
        if (!auraActor || !auraData) return;

        const source = { actor: auraActor, token: aura.token };
        const affectedActors: Set<ActorPF2e> = new Set();
        const auradTokens = aura.scene.tokens.filter(
            (t) => t.actor?.primaryUpdater === game.user && aura.containsToken(t),
        );

        for (const token of auradTokens) {
            const actor = token.actor;
            if (!actor || affectedActors.has(actor)) continue;

            affectedActors.add(actor);
            await actor.applyAreaEffects(auraData, source);

            if (auraActor !== actor) {
                const auras = getAurasInMemory(actor);
                const already = auras.find(auraSearch(auraData, source));

                setAuraInMemory(actor, auraData, source);

                // we only execute triggers if the hook is actually active and the token wasn't already in the aura
                if (!already && this.#active && game.user.isActiveGM && this.isValidActor(actor)) {
                    const aura = { data: auraData, origin: source };
                    const target = { actor, token };
                    this.executeEvent("aura-enter-event", { aura, target });
                }
            }
        }
    }
}

function getSceneTokens(): TokenDocumentPF2e[] {
    const scene = game.scenes.current;
    if (!canvas.ready || !scene) return [];

    return scene.tokens.reduce((list: TokenDocumentPF2e<ScenePF2e>[], token) => {
        if (token.isLinked && list.some((t) => t.actor === token.actor)) {
            return list;
        }
        list.push(token);
        return list;
    }, []);
}

function getTokensActors(tokens: TokenDocumentPF2e[]): ActorPF2e[] {
    return R.pipe(
        tokens,
        R.map((token) => token.actor),
        R.filter(R.isTruthy),
        R.unique(),
    );
}

function getAurasInMemory(actor: ActorPF2e): ActorAura[] {
    const current = getInMemory<ActorAura[]>(actor, "auras");
    return current instanceof Array ? current : [];
}

function setAuraInMemory(actor: ActorPF2e, aura: AuraData, origin: AuraOrigin): boolean {
    const auras = getAurasInMemory(actor);

    auras.findSplice(auraSearch(aura, origin));
    auras.push({ data: aura, origin });

    return setInMemory(actor, "auras", auras);
}

function removeAuraFromMemory(actor: ActorPF2e, aura: AuraData, origin: AuraOrigin) {
    const auras = getAurasInMemory(actor);
    auras.findSplice(auraSearch(aura, origin));
    return setInMemory(actor, "auras", auras);
}

function auraSearch(aura: AuraData, origin: AuraOrigin): (actorAura: ActorAura) => boolean {
    return ({ data: { slug }, origin: { token } }: ActorAura) => {
        return slug === aura.slug && token === origin.token;
    };
}

type AuraOrigin = Required<TargetDocuments>;

type ActorAura = {
    data: AuraData;
    origin: AuraOrigin;
};

type AuraEventOptions = {
    aura: ActorAura;
    target: TargetDocuments;
};

export { AuraHook, getAurasInMemory };
export type { ActorAura, AuraEventOptions };
