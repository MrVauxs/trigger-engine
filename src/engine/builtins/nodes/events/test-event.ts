import { IconObject } from "_zod";
import { BaseEventNode } from "engine";

class TestEventNode extends BaseEventNode {
    static get functionPath(): string {
        return "game.triggerEngine.test";
    }

    static get type(): "test-event" {
        return "test-event";
    }

    static get tags(): string[] {
        return ["debug"];
    }

    get icon(): IconObject {
        return { unicode: "\ue4f3" };
    }

    get subtitle(): string {
        return `${TestEventNode.functionPath}()`;
    }

    _execute(): Promise<boolean> {
        return this.executeNext("out");
    }
}

export { TestEventNode };
