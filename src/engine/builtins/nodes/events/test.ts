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

    get icon(): string {
        return "\ue4f3";
    }

    get subtitle(): string {
        return `${TestEventNode.functionPath}()`;
    }

    _execute(): Promise<boolean> {
        return this.executeNext("out");
    }
}

export { TestEventNode };
