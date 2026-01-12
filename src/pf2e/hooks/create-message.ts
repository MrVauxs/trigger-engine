import { TriggerHook } from "engine";
import { ActorPF2e, ChatMessagePF2e, ItemPF2e, R, createToggleableHook, isValidTargetDocuments } from "module-helpers";

class CreateMessageHook extends TriggerHook<DamageTakenOptions> {
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

        if (context.type === "damage-taken") {
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
        } else if (context.type === "attack-roll") {
            //     if (!context.target || !context.outcome) return;
            //     const outcome = degreeOfSuccessNumber(context.outcome);
            //     if (R.isNullish(outcome)) return;
            //     const source = { actor: message.actor, token: message.token };
            //     const target = {
            //         actor: await fromUuid(context.target.actor),
            //         token: context.target.token ? await fromUuid(context.target.token) : undefined,
            //     };
            //     if (!isValidTargetDocuments(target) || !isValidTargetDocuments(source)) return;
            //     this.executeTriggers<AttackTriggerOptions>(
            //         {
            //             action: (context as { action?: string }).action ?? "",
            //             item,
            //             options: context?.options ?? [],
            //             other: target,
            //             outcome,
            //             this: source,
            //         },
            //         "attack-roll"
            //     );
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

type DamageTakenOptions = {
    item: ItemPF2e | undefined;
    options: string[];
    origin: TargetDocuments | undefined;
    target: TargetDocuments;
    types: DamageTakenType[];
};

type DamageTakenType = (typeof CreateMessageHook.damageTakenTypes)[number];

export { CreateMessageHook };
export type { DamageTakenType, DamageTakenOptions };
