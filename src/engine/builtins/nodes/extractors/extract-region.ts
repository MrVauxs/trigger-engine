import { BuiltinsInputEntry } from "engine";
import { BaseDocumentExtractorNode } from ".";

class RegionExtractorNode extends BaseDocumentExtractorNode<RegionDocument, RegionDocument> {
    static get type(): "extract-region" {
        return "extract-region";
    }

    static get tags(): string[] {
        return ["region"];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [{ key: "input", type: "region" }];
    }

    _castDocument(region: RegionDocument): RegionDocument {
        return region;
    }
}

export { RegionExtractorNode };
