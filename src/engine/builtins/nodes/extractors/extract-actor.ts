import { BuiltinsInputEntry } from "engine";
import { ActorPF2e } from "foundry-helpers";
import { BaseDocumentExtractorNode } from ".";

class ActorExtractorNode extends BaseDocumentExtractorNode<TargetDocuments, ActorPF2e> {
    static get type(): "extract-actor" {
        return "extract-actor";
    }

    static get tags(): string[] {
        return ["actor"];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [{ key: "input", type: "target" }];
    }

    _castDocument(target: TargetDocuments): ActorPF2e {
        return target.actor;
    }
}

export { ActorExtractorNode };
