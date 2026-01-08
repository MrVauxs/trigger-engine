import { NodeEntry } from "engine";
import { ActorPF2e, TokenDocumentPF2e, getTokenDocument, isValidTargetDocuments } from "module-helpers";

class TargetEntry extends NodeEntry<TargetDocuments | undefined> {
    static get type(): "target" {
        return "target";
    }

    static get default(): undefined {
        return undefined;
    }

    static get color(): ColorSource {
        return 0xff3075;
    }

    static isValidType(value: unknown): value is TargetDocuments {
        return isValidTargetDocuments(value);
    }

    static toJSON(value: TargetDocuments): { actor: ActorUUID; token?: TokenDocumentUUID } {
        return {
            actor: value.actor.uuid,
            token: value.token?.uuid,
        };
    }

    static async fromJSON(value: {
        actor: ActorUUID;
        token?: TokenDocumentUUID;
    }): Promise<TargetDocuments | undefined> {
        const actor = await fromUuid<ActorPF2e>(value.actor);
        if (!(actor instanceof Actor)) return;

        const token = value.token && (await fromUuid<TokenDocumentPF2e>(value.token));

        return {
            actor,
            token: token instanceof TokenDocument ? token : undefined,
        };
    }

    castValue(value: unknown): unknown {
        if (value instanceof Actor) {
            return {
                actor: value as ActorPF2e,
                token: value.token,
            };
        }

        const token = getTokenDocument(value);
        const actor = token?.actor;
        if (actor) {
            return { actor, token };
        }

        return value;
    }
}

export { TargetEntry };
