import { BaseActionNode } from ".";
import { IconObject } from "_zod";

class TestNodeActionNode extends BaseActionNode {
    static get type(): "test-node" {
        return "test-node";
    }

    static get tags(): string[] {
        return ["test"];
    }

    get title(): string {
        return "TEST NODE";
    }

    get subtitle(): string {
        return "Debug only node";
    }

    get icon(): IconObject {
        return { unicode: "\uf0c3" };
    }

    async _execute(): Promise<boolean> {
        console.log("I AM A TEST NODES");

        return this.executeNext("out");
    }
}

export { TestNodeActionNode };
