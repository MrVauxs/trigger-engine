import { BuiltInApplication } from "engine";
import { R } from "module-helpers";
import { TriggerApplicationCollection, TriggerApplicationOptions } from ".";

class DualCollection<T> {
    #builtin: Collection<T>;
    #local: Collection<T>;

    constructor(options: TriggerApplicationOptions, collection: TriggerApplicationCollection) {
        this.#builtin = new Collection(getBuiltins(options, collection));
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

function getBuiltins<T>(
    options: TriggerApplicationOptions,
    collection: TriggerApplicationCollection
): [string, T][] {
    const option = options.builtins?.[collection];
    const builtins = BuiltInApplication[collection] as Record<string, T>;

    if (option === true) {
        return R.entries(builtins);
    }

    if (!option || !R.isArray(option)) {
        return [];
    }

    return R.pipe(
        option,
        R.map((type): [string, T] | undefined => {
            const builtin = builtins[type as keyof typeof builtins] as T;
            return builtin ? ([type, builtin] as const) : undefined;
        }),
        R.filter(R.isTruthy)
    );
}

export { DualCollection };
