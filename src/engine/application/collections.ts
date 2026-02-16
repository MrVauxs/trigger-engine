import { BuiltInApplication, EntryConvertor, mapConvertors, NodeEntry, TriggerHook, TriggerNode } from "engine";
import { R } from "foundry-helpers";
import { TriggerApplicationOptions } from ".";

function createCollection<C extends Exclude<TriggerApplicationCollection, "hooks">>(
    options: TriggerApplicationOptions,
    collection: C,
): Collection<string, ExtractCollectionType<C>> {
    const local = getLocal(options, collection);
    const builtin = getBuiltins(options, collection);

    return new Collection([...local, ...builtin]) as any;
}

function getLocal(options: TriggerApplicationOptions, collection: Exclude<TriggerApplicationCollection, "hooks">) {
    if (collection === "convertors") {
        return mapConvertors(options.convertors ?? []);
    }

    return R.map(options[collection] ?? [], (entry) => [entry.type, entry as any] as const);
}

function getBuiltins<C extends TriggerApplicationCollection>(
    options: TriggerApplicationOptions,
    collection: C,
): (readonly [string, ExtractCollectionType<C>])[] {
    const option = options.builtins === true ? true : options.builtins?.[collection];
    const builtins = BuiltInApplication[collection];

    if (option === true) {
        return builtins as any;
    }

    if (!option || !R.isArray(option)) {
        return [];
    }

    return builtins.filter(([key]) => R.isIncludedIn(key, option)) as any;
}

type TriggerApplicationCollections = {
    convertors?: EntryConvertor[];
    entries?: (typeof NodeEntry)[];
    hooks?: (typeof TriggerHook)[];
    nodes?: (typeof TriggerNode)[];
};

type TriggerApplicationCollection = Prettify<keyof TriggerApplicationCollections>;

type ExtractCollectionType<C extends TriggerApplicationCollection> = Exclude<
    TriggerApplicationCollections[C],
    undefined
>[number];

export { createCollection, getBuiltins };
export type { TriggerApplicationCollection, TriggerApplicationCollections };
