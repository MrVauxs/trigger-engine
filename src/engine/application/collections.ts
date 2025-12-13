import { BuiltInApplication, NodeEntry, TriggerNode } from "engine";
import { R } from "module-helpers";
import { TriggerApplicationOptions } from ".";

function createCollection<C extends TriggerApplicationCollection>(
    options: TriggerApplicationOptions,
    collection: C
): Collection<Exclude<TriggerApplicationCollections[C], undefined>[number]> {
    const local = options[collection]?.map((node) => [node.type, node] as const) ?? [];
    const builtin = getBuiltins(options, collection);

    return new Collection([...local, ...builtin]) as any;
}

function getBuiltins<T>(
    options: TriggerApplicationOptions,
    collection: TriggerApplicationCollection
): [string, T][] {
    const option = options.builtins === true ? true : options.builtins?.[collection];
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

type TriggerApplicationCollections = {
    entries?: (typeof NodeEntry)[];
    nodes?: (typeof TriggerNode)[];
};

type TriggerApplicationCollection = Prettify<keyof TriggerApplicationCollections>;

export { createCollection };
export type { TriggerApplicationCollection, TriggerApplicationCollections };
