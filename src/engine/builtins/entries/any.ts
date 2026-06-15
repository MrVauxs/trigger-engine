import { NodeEntry } from "engine";

class AnyEntry extends NodeEntry<any | undefined> {
    static get type(): "any" {
        return "any";
    }

    static get default(): undefined {
        return undefined;
    }

    static get color(): ColorSource {
        return 0x878787;
    }

    static isValidType(value: unknown): value is any {
        return true;
    }

    static toJSON(value: any): string {
        return JSON.stringify(value);
    }

    static async fromJSON(value: any): Promise<any | undefined> {
        return foundry.data.validators.isJSON(value) ? JSON.parse(value) : undefined;
    }
}

export { AnyEntry };
