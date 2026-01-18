import { IconObject } from "_zod";
import { BaseActionNode } from "engine";
import { ItemPF2e, getTargetsTokensUUIDs } from "module-helpers";
import { PF2eInputEntry } from "pf2e";

class SendToChatActionNode extends BaseActionNode<"out", Inputs> {
    static get type(): "send-chat" {
        return "send-chat";
    }

    static get tags(): string[] {
        return ["chat", "item"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            { key: "item", type: "item" },
            { key: "parent", type: "target", group: "optional" },
            { key: "targets", type: "target", isArray: true, group: "optional" },
        ];
    }

    get icon(): IconObject {
        return { unicode: "\uf4a8" };
    }

    async _execute(): Promise<boolean> {
        const rawItem = await this.getInputValue("item");
        const parent = await this.getInputValue("parent");

        if (!rawItem || (!rawItem.parent && !parent)) {
            return this.executeNext("out");
        }

        const targets = await this.getInputValue("targets");
        const item = parent ? new (getDocumentClass("Item"))(rawItem.toObject(), { parent: parent.actor }) : rawItem;

        const message = await item.toMessage(null, { create: !targets.length });

        if (targets.length && message) {
            const source = message.toObject() as ChatMessageCreateData<ChatMessage>;
            const targetsUUIDs: TokenDocumentUUID[] = getTargetsTokensUUIDs(targets);

            foundry.utils.setProperty(source, "flags.pf2e-toolbelt.targetHelper.targets", targetsUUIDs);
            await getDocumentClass("ChatMessage").create(source);
        }

        return this.executeNext("out");
    }
}

type Inputs = {
    item?: ItemPF2e;
    parent?: TargetDocuments;
    targets: TargetDocuments[];
};

export { SendToChatActionNode };
