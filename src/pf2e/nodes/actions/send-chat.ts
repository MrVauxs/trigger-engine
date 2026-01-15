import { IconObject } from "_zod";
import { BaseActionNode } from "engine";
import { ItemPF2e, R, getFirstActiveToken, getTargetToken, getTargetsTokensUUIDs } from "module-helpers";
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
            { key: "targets", type: "target", group: "toolbelt", isArray: true },
        ];
    }

    get icon(): IconObject {
        return { unicode: "\uf4a8" };
    }

    async _execute(): Promise<boolean> {
        const item = await this.getInputValue("item");

        if (!item?.parent) {
            return this.executeNext("out");
        }

        const targets = await this.getInputValue("targets");
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
    targets: TargetDocuments[];
};

export { SendToChatActionNode };
