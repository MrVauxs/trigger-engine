import { NodeEntryData, TriggerNode } from "engine";
import { MODULE, R } from "module-helpers";
import fields = foundry.data.fields;

class NodeEntry<TInputSchema extends fields.DataSchema | undefined = undefined> {
    #data: NodeEntryData;
    #parent: TriggerNode;

    constructor(parent: TriggerNode, data: NodeEntryData) {
        MODULE.assert(
            parent instanceof TriggerNode && !parent.invalid,
            "parent argument must be a valid 'TriggerNode'."
        );

        MODULE.assert(
            data instanceof NodeEntryData && !data.invalid,
            "schema argument must be a valid 'NodeData'."
        );

        this.#data = data;
        this.#parent = parent;

        // from data accessors
        Object.defineProperties(
            this,
            R.fromKeys(["id", "invalid"] as const, (property) => {
                return {
                    value: data[property],
                    configurable: false,
                    enumerable: true,
                    writable: false,
                };
            })
        );

        // from static accessors
        Object.defineProperties(
            this,
            R.fromKeys(["type"] as const, (property) => {
                return {
                    value: (this.constructor as typeof NodeEntry)[property],
                    configurable: false,
                    enumerable: true,
                    writable: false,
                };
            })
        );
    }

    //////////////////////////////
    // ABSTRACT STATIC ACCESSORS
    //////////////////////////////

    /**
     * @abstract
     * Must be an unique key among your registered module's entries (including the builtins)
     *
     * Localization path:
     * `<module-id>.<application-id>.entry.<type>.title`
     */
    static get type(): string {
        throw MODULE.Error("the 'type' static getter must be implemented.");
    }

    //////////////////////////////
    // STATIC ACCESSORS
    //////////////////////////////

    /**
     * @abstract
     * Defines the DataSchema for the input field that will be used in the triggers menu.
     */
    static get fieldSchema(): fields.DataSchema | null {
        return null;
    }

    //////////////////////////////
    // ACCESSORS
    //////////////////////////////

    //////////////////////////////
    // PRIVATE METHODS
    //////////////////////////////
}

interface NodeEntry extends Pick<NodeEntryData, "id" | "invalid">, Pick<typeof NodeEntry, "type"> {}

type BaseNodeEntry<TType extends string> = {
    type: TType;
    group?: string;
};

type BaseNodeInput<
    TType extends string,
    TField extends fields.DataSchema | undefined = undefined
> = Prettify<
    BaseNodeEntry<TType> & {
        field?: Prettify<
            TField extends fields.DataSchema ? DeepPartial<SourceFromSchema<TField>> : TField
        >;
    }
>;

type BaseNodeOutput<TType extends string> = BaseNodeEntry<TType>;

export { NodeEntry };
export type { BaseNodeEntry, BaseNodeInput, BaseNodeOutput };
