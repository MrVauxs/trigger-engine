import { BuiltinsInputEntry } from "engine";
import { UserPF2e, primaryPlayerOwner } from "module-helpers";
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
                key: "author",
                type: "user",
                label: "Author",
            },
            {
                key: "speaker",
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

        if (!content) {
            return this.executeNext("out");
        }

        const ChatMessage = getDocumentClass("ChatMessage");
        const speaker = await this.getInputValue("speaker");
        const userContext = this.userContext;

        const author =
            (await this.getInputValue("author")) ??
            (!userContext.isGM && speaker?.actor.testUserPermission(userContext, "OWNER")
                ? userContext
                : (speaker && primaryPlayerOwner(speaker.actor)) || userContext);

        await ChatMessage.create({
            author: author.id,
            content,
            speaker: speaker ? ChatMessage.getSpeaker(speaker) : undefined,
        });

        return this.executeNext("out");
    }
}

type Inputs = {
    author: UserPF2e | undefined;
    content: string;
    localization: string;
    speaker: TargetDocuments | undefined;
};

export { CreateMessageActionNode };
