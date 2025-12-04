import { BuiltInApplication, NodeEntry, TriggerNode } from "engine";
import { R } from "module-helpers";
import { TriggerApplicationCollection, TriggerApplicationOptions } from ".";

class DualCollections<T> {
    #builtin: Collection<T>;
    #local: Collection<T>;

    constructor(options: TriggerApplicationOptions, collection: TriggerApplicationCollection) {
        this.#builtin = new Collection(getBuiltins(options, collection));
        this.#local = new Collection(options.nodes?.map((node) => [node.type, node as T] as const));
    }

    get builtin(): Collection<T> {
        return this.#builtin;
    }

    get local(): Collection<T> {
        return this.#local;
    }

    get allEntries(): T[] {
        return [...this.#builtin, ...this.#local];
    }

    get({ type, builtin }: { type?: string; builtin?: boolean }): T | undefined {
        const collection = builtin ? this.#builtin : this.#local;
        return collection.get(type ?? "");
    }
}

class NodesCollections extends DualCollections<typeof TriggerNode> {
    constructor(options: TriggerApplicationOptions) {
        super(options, "nodes");
    }
}

class EntriesCollections extends DualCollections<typeof NodeEntry> {
    constructor(options: TriggerApplicationOptions) {
        super(options, "entries");
    }

    get({ type }: { type?: string }): typeof NodeEntry | undefined {
        return this.builtin.get(type ?? "");
    }
}

function getBuiltins<T>(
    options: TriggerApplicationOptions,
    collection: TriggerApplicationCollection
): [string, T][] {
    const option = options.builtins?.[collection];
    const builtins = BuiltInApplication[collection];

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

export { EntriesCollections, NodesCollections };
