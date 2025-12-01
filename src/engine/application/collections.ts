import { BuiltInApplication } from "engine";
import { R } from "module-helpers";
import { TriggerApplicationCollection, TriggerApplicationOptions } from ".";

class DualCollection<T> {
    #builtin: Collection<T>;
    #local: Collection<T>;

    constructor(options: TriggerApplicationOptions, collection: TriggerApplicationCollection) {
        const builtins = BuiltInApplication[collection];

        this.#builtin = new Collection(
            R.pipe(
                options.builtins?.[collection] ?? [],
                R.map((type) => {
                    const builtin = builtins[type as keyof typeof builtins] as T;
                    return builtin ? ([type, builtin] as const) : undefined;
                }),
                R.filter(R.isTruthy)
            )
        );

        this.#local = new Collection(options.nodes?.map((node) => [node.type, node as T] as const));
    }

    get allEntries(): T[] {
        return [...this.#builtin, ...this.#local];
    }

    get({ type, builtin }: { type?: string; builtin?: boolean }): T | undefined {
        const collection = builtin ? this.#builtin : this.#local;
        return collection.get(type ?? "");
    }
}

export { DualCollection };
