import { BuiltInApplication, EntryConvertor, mapConvertors, NodeEntry, TriggerNode } from "engine";
import { R } from "module-helpers";
import { TriggerApplicationOptions } from ".";

function createCollection<C extends TriggerApplicationCollection>(
    options: TriggerApplicationOptions,
    collection: C
): Collection<Exclude<TriggerApplicationCollections[C], undefined>[number]> {
    const local = getLocal(options, collection);
    const builtin = getBuiltins(options, collection);

    return new Collection([...local, ...builtin]) as any;
}

function getLocal(options: TriggerApplicationOptions, collection: TriggerApplicationCollection) {
    if (collection === "convertors") {
        return mapConvertors(options.convertors ?? []);
    }

    return R.map(options[collection] ?? [], (entry) => [entry.type, entry as any] as const);
}

function getBuiltins(options: TriggerApplicationOptions, collection: TriggerApplicationCollection) {
    const option = options.builtins === true ? true : options.builtins?.[collection];
    const builtins = BuiltInApplication[collection];

    if (option === true) {
        return builtins;
    }

    if (!option || !R.isArray(option)) {
        return [];
    }

    return builtins.filter(([key]) => R.isIncludedIn(key, option));
}

type TriggerApplicationCollections = {
    convertors?: EntryConvertor[];
    entries?: (typeof NodeEntry)[];
    nodes?: (typeof TriggerNode)[];
};

type TriggerApplicationCollection = Prettify<keyof TriggerApplicationCollections>;

export { createCollection };
export type { TriggerApplicationCollection, TriggerApplicationCollections };
