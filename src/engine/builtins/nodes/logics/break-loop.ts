import { BaseLogicNode } from "engine";

abstract class BreakLoopLogicNode extends BaseLogicNode<never> {
    static get type(): "break-loop" {
        return "break-loop";
    }

    static get tags(): string[] {
        return ["loop"];
    }

    static get defineOuts(): null {
        return null;
    }

    get canBreak(): boolean {
        return true;
    }

    async _execute(): Promise<boolean> {
        return false;
    }
}

export { BreakLoopLogicNode };
