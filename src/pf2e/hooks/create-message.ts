import { TriggerHook } from "engine";
import {
    ActorPF2e,
    ChatMessagePF2e,
    DegreeOfSuccessString,
    ItemPF2e,
    R,
    createToggleableHook,
    isDegreeOfSuccessValue,
    isValidTargetDocuments,
} from "module-helpers";

class CreateMessageHook extends TriggerHook<AttackRollOptions | DamageTakenOptions> {
    static damageTakenTypes = ["all", "damage", "heal", "persistent", "negated"] as const;
    static contextEvents = ["attack-roll", "damage-taken"] as const;

    #hook = createToggleableHook("createChatMessage", this.#onCreateMessage.bind(this));

    get events(): ["attack-roll-event", "damage-taken-event"] {
        return ["attack-roll-event", "damage-taken-event"];
    }

    _enable() {
        this.#hook.activate();
    }

    _disable() {
        this.#hook.disable();
    }

    async #onCreateMessage(message: ChatMessagePF2e) {
        if (!game.user.isActiveGM) return;

        const { appliedDamage, origin, context } = message.flags.pf2e;
        if (!context) return;

        if (context.type === "attack-roll") {
            const target = message.target;
            const source = { actor: message.actor, token: message.token };

            if (
                !isValidTargetDocuments(target) ||
                !isValidTargetDocuments(source) ||
                !isDegreeOfSuccessValue(context.outcome)
            )
                return;

            this.executeEvent("attack-roll-event", {
                action: (context as { action?: string }).action || "",
                item: await getItem(origin?.uuid),
                options: context.options ?? [],
                origin: source,
                outcome: context.outcome,
                target,
            } satisfies AttackRollOptions);
        } else if (context.type === "damage-taken") {
            const target = { actor: message.actor, token: message.token };
            if (!isValidTargetDocuments(target)) return;

            const originActor = origin?.actor ? await fromUuid<ActorPF2e>(origin.actor) : null;
            const types: DamageTakenType[] = appliedDamage?.isHealing ? ["heal"] : ["all", "damage"];

            if (!appliedDamage) {
                types.push("negated");
            } else if (appliedDamage.persistent.length) {
                types.push("persistent");
            }

            this.executeEvent("damage-taken-event", {
                item: await getItem(origin?.uuid),
                options: context.options ?? [],
                origin: originActor ? { actor: originActor } : undefined,
                target,
                types,
            } satisfies DamageTakenOptions);
        }
    }
}

async function getItem(uuid: string | undefined): Promise<ItemPF2e | undefined> {
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

type AttackRollOptions = {
    action: string;
    item: ItemPF2e | undefined;
    options: string[];
    origin: TargetDocuments;
    outcome: DegreeOfSuccessString;
    target: TargetDocuments;
};

type DamageTakenOptions = {
    item: ItemPF2e | undefined;
    options: string[];
    origin: TargetDocuments | undefined;
    target: TargetDocuments;
    types: DamageTakenType[];
};

type DamageTakenType = (typeof CreateMessageHook.damageTakenTypes)[number];

export { CreateMessageHook };
export type { AttackRollOptions, DamageTakenOptions, DamageTakenType };
