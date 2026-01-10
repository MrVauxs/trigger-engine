import { BuiltinsInputEntry } from "engine";
import { BaseActionNode, localizeKeyOrDescription } from ".";

class CreateMessageActionNode extends BaseActionNode<
    "out",
    Inputs,
    never,
    never,
    never,
    "localization" | "description"
> {
    static get type(): "create-message" {
        return "create-message";
    }

    static get tags(): string[] {
        return ["chat"];
    }

    static get states(): string[] {
        return ["description", "localization"];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [
            {
                key: "content",
                type: "text",
                field: { type: "enriched" },
                state: "description",
            },
            {
                key: "localization",
                type: "text",
                state: "localization",
            },
            {
                key: "target",
                type: "target",
            },
        ];
    }

    get icon(): string {
        return "\uf4b6";
    }

    async _execute(): Promise<boolean> {
        const content = await localizeKeyOrDescription(
            this.state === "localization" ? await this.getInputValue("localization") : undefined,
            this.state === "description" ? await this.getInputValue("content") : undefined,
        );

        if (content) {
            const target = await this.getInputValue("target");
            const ChatMessage = getDocumentClass("ChatMessage");

            await ChatMessage.create({
                author: this.userContext.id,
                content,
                speaker: target ? ChatMessage.getSpeaker(target) : undefined,
            });
        }

        return this.executeNext("out");
    }
}

type Inputs = {
    content: string;
    localization: string;
    target: TargetDocuments | undefined;
};

export { CreateMessageActionNode };
