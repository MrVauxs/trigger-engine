import { NodeEntry } from "engine";
import { DegreeOfSuccessString, R, degreeOfSuccessString, isDegreeOfSuccessValue } from "module-helpers";

class OutcomEntry extends NodeEntry<DegreeOfSuccessString | undefined> {
    static get type(): "outcome" {
        return "outcome";
    }

    static get default(): undefined {
        return undefined;
    }

    static get color(): ColorSource {
        return 0x75db32;
    }

    static isValidType(value: unknown): value is DegreeOfSuccessString {
        return isDegreeOfSuccessValue(value);
    }

    static toJSON(value: DegreeOfSuccessString): DegreeOfSuccessString {
        return value;
    }

    static fromJSON(value: DegreeOfSuccessString): DegreeOfSuccessString | undefined {
        return value;
    }

    castValue(value: unknown): DegreeOfSuccessString | undefined {
        if (!isDegreeOfSuccessValue(value)) return;
        return R.isString(value) ? value : degreeOfSuccessString(value);
    }
}

export { OutcomEntry };
