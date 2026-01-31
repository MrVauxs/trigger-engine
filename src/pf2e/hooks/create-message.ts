import { TriggerHook } from "engine";
import {
    ActorPF2e,
    ChatMessageFlagsPF2e,
    ChatMessagePF2e,
    CheckContextChatFlag,
    CheckType,
    DegreeOfSuccessString,
    ItemPF2e,
    R,
    SYSTEM,
    TokenDocumentPF2e,
    createToggleableHook,
    isValidTargetDocuments,
} from "module-helpers";

class CreateMessageHook extends TriggerHook<AttackRollOptions | DamageTakenOptions | CheckRollOptions> {
    static damageTakenTypes = ["all", "damage", "heal", "persistent", "negated"] as const;

    #hook = createToggleableHook("createChatMessage", this.#onCreateMessage.bind(this));

    get events(): ["attack-roll-event", "damage-taken-event", "check-roll-event"] {
        return ["attack-roll-event", "damage-taken-event", "check-roll-event"];
    }

    _enable() {
        this.#hook.activate();
    }

    _disable() {
        this.#hook.disable();
    }

    async #onCreateMessage(message: ChatMessagePF2e) {
        if (!game.user.isActiveGM) return;

        const { appliedDamage, origin, context } = message.flags[SYSTEM.id] as ChatMessageFlagsPF2e["pf2e"];
        if (!context) return;

        if (context.type === "attack-roll") {
            const target = message.target;
            const source = { actor: message.actor, token: message.token };
            if (!isValidTargetDocuments(target) || !isValidTargetDocuments(source)) return;

            this.executeEvent("attack-roll-event", {
                action: (context as { action?: string }).action || "",
                item: message.item,
                options: context.options ?? [],
                origin: source,
                outcome: context.outcome,
                target,
            } satisfies AttackRollOptions);
        } else if (context.type === "damage-taken") {
            const target = { actor: message.actor, token: message.token };
            if (!isValidTargetDocuments(target)) return;

            const originActor = origin?.actor ? await fromUuid<ActorPF2e>(origin.actor) : null;

            const types: DamageTakenType[] = !appliedDamage
                ? ["all", "negated"]
                : appliedDamage.isHealing
                  ? ["heal"]
                  : appliedDamage.persistent.length
                    ? ["all", "damage", "persistent"]
                    : ["all", "damage"];

            this.executeEvent("damage-taken-event", {
                item: await getAttackItem(origin?.uuid),
                options: context.options ?? [],
                origin: originActor ? { actor: originActor } : undefined,
                target,
                types,
            } satisfies DamageTakenOptions);
        } else if (message.isCheckRoll) {
            const checkContext = context as CheckContextChatFlag;
            const target = { actor: message.actor, token: message.token };
            if (!isValidTargetDocuments(target)) return;

            const originActor = origin?.actor ? await fromUuid<ActorPF2e>(origin.actor) : null;
            const originToken = checkContext.origin?.token
                ? await fromUuid<TokenDocumentPF2e>(checkContext.origin.token)
                : null;

            this.executeEvent("check-roll-event", {
                item: message.item,
                options: checkContext.options ?? [],
                origin: originActor ? { actor: originActor, token: originToken } : undefined,
                outcome: checkContext.outcome,
                target,
                type: checkContext.type,
            } satisfies CheckRollOptions);
        }
    }
}

async function getAttackItem(uuid: string | undefined): Promise<ItemPF2e | undefined> {
    if (!uuid) return;

    const splits = R.split(uuid, ".");
    const actorUUID = splits.slice(0, -2).join(".");
    const actor = await fromUuid<ActorPF2e>(actorUUID);
    if (!actor) return;

    const itemId = splits.at(-1) as string;
    return itemId.startsWith("xx")
        ? actor.system.actions?.find((action) => action.item.id === itemId)?.item
        : actor.items.get(itemId);
}

type BaseOptions = {
    item: ItemPF2e | null | undefined;
    options: string[];
    origin: TargetDocuments | undefined;
    target: TargetDocuments;
};

type AttackRollOptions = WithRequired<BaseOptions, "origin"> & {
    action: string;
    outcome: DegreeOfSuccessString | null;
};

type DamageTakenOptions = BaseOptions & {
    types: DamageTakenType[];
};

type CheckRollOptions = BaseOptions & {
    outcome: DegreeOfSuccessString | null;
    type: CheckType;
};

type DamageTakenType = (typeof CreateMessageHook.damageTakenTypes)[number];

export { CreateMessageHook };
export type { AttackRollOptions, CheckRollOptions, DamageTakenOptions, DamageTakenType };
