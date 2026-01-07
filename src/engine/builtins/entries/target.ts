import { NodeEntry } from "engine";
import { ActorPF2e, getTokenDocument, isValidTargetDocuments } from "module-helpers";

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

    isValidType(value: unknown): value is TargetDocuments {
        return isValidTargetDocuments(value);
    }
}

export { TargetEntry };
