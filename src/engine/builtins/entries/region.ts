import { NodeEntry } from "engine";
import { DocumentUUID, R, RegionDocumentPF2e } from "foundry-helpers";

class RegionEntry extends NodeEntry<RegionDocumentPF2e | undefined> {
    static get type(): "region" {
        return "region";
    }

    static get default(): undefined {
        return undefined;
    }

    static get color(): ColorSource {
        return 0x4f4c42;
    }

    static isValidType(value: unknown): value is RegionDocumentPF2e {
        return value instanceof RegionDocument && !value.pack;
    }

    static toJSON(value: RegionDocumentPF2e): DocumentUUID {
        return value.uuid as DocumentUUID;
    }

    static async fromJSON(value: unknown): Promise<RegionDocumentPF2e | undefined> {
        const region = R.isString(value) ? await fromUuid<RegionDocumentPF2e>(value) : undefined;
        return this.isValidType(region) ? region : undefined;
    }
}

export { RegionEntry };
