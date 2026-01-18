import { BuiltinsInputEntry } from "engine";
import { UserPF2e, primaryPlayerOwner } from "module-helpers";
import {
    BaseActionNode,
    DescriptionInputs,
    DescriptionState,
    descriptionSchemas,
    descriptionStates,
    getDescriptionInputs,
    localizeKeyOrDescription,
} from ".";
import { IconObject } from "_zod";

class CreateMessageActionNode extends BaseActionNode<"out", Inputs, never, never, never, DescriptionState> {
    static get type(): "create-message" {
        return "create-message";
    }

    static get tags(): string[] {
        return ["chat"];
    }

    static get states(): string[] {
        return descriptionStates;
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [
            ...descriptionSchemas(),
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

    get icon(): IconObject {
        return { unicode: "\uf4b6" };
    }

    async _execute(): Promise<boolean> {
        const descriptionInputs = await getDescriptionInputs.call(this);
        const content = await localizeKeyOrDescription(descriptionInputs);

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

type Inputs = DescriptionInputs & {
    author?: UserPF2e;
    speaker?: TargetDocuments;
};

export { CreateMessageActionNode };
