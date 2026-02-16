import { CustomInputSchema } from "engine";
import { R } from "foundry-helpers";
import { BaseConditionNode } from ".";

class IfTruthyConditionNode extends BaseConditionNode<never, never, "condition"> {
    static get type(): "if-truthy" {
        return "if-truthy";
    }

    static get defineCustomInputs(): CustomInputSchema[] {
        return [{ slug: "condition", array: true }];
    }

    async _execute(): Promise<boolean> {
        const conditions = await this.getCustomInputsValues("condition");

        for (const condition of conditions) {
            if ((R.isArray(condition) && !condition.some(R.isTruthy)) || !R.isTruthy(condition)) {
                return this.executeNext("false");
            }
        }

        return this.executeNext("true");
    }
}

export { IfTruthyConditionNode };
