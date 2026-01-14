import { NodeFieldSchema, TextField } from "engine";
import { DegreeOfSuccessString } from "module-helpers";

class OutcomeField extends TextField {
    static get defineSchema(): NodeFieldSchema {
        return {
            connector: {
                default: true,
                type: "boolean",
            },
            default: { type: "string" },
            tooltip: {
                default: true,
                type: "boolean",
            },
            width: {
                default: 140,
                type: "number",
            },
        };
    }

    get isSimpleInput(): boolean {
        return false;
    }

    get isSelect(): boolean {
        return true;
    }

    get isEnrichedInput(): boolean {
        return false;
    }

    get isJSONInput(): boolean {
        return false;
    }
}

type OutputFieldSchema = {
    connector: boolean;
    default?: DegreeOfSuccessString;
    tooltip: boolean;
    width: number;
};

export { OutcomeField };
export type { OutputFieldSchema };
