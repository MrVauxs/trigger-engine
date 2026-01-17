import { BaseSplitterNode, BridgeSchemaInput } from "engine";
import { DEGREE_STRINGS, DegreeOfSuccessString } from "module-helpers";
import { PF2eInputEntry } from "pf2e";

class OutcomeSplitterNode extends BaseSplitterNode<DegreeOfSuccessString, DegreeOfSuccessString> {
    static get type(): "split-outcome" {
        return "split-outcome";
    }

    static get tags(): string[] {
        return ["outcome"];
    }

    static get defineOuts(): BridgeSchemaInput[] {
        return DEGREE_STRINGS.map((outcome): BridgeSchemaInput => {
            return {
                key: outcome,
                label: `PF2E.Check.Result.Degree.Check.${outcome}`,
            };
        });
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [{ key: "input", type: "outcome" }];
    }

    async _execute(): Promise<boolean> {
        const input = await this.getInputValue("input");
        return this.executeNext(input);
    }
}

export { OutcomeSplitterNode };
