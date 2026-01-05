import { R, isValidTargetDocuments } from "module-helpers";
import { BuiltInTriggerNode } from "..";

class TestTriggerNode extends BuiltInTriggerNode {
    static get type(): "test-event" {
        return "test-event";
    }

    static get isEvent(): boolean {
        return true;
    }

    static get tags(): string[] {
        return ["debug"];
    }

    get icon(): string {
        return "\ue4f3";
    }

    _execute(options?: TestEventExecuteOptions): Promise<boolean> {
        const targets = R.pipe(
            R.isArray(options?.targets)
                ? options.targets
                : canvas.tokens.controlled.map((token) => {
                      return { actor: token.actor, token: token.document };
                  }),
            R.filter(isValidTargetDocuments),
        );

        // TODO
        console.log(targets);
        return this.executeNext("out");
    }

    _query(key: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
}

type TestEventExecuteOptions = {
    targets?: TargetDocuments[];
};

export { TestTriggerNode };
export type { TestEventExecuteOptions };
