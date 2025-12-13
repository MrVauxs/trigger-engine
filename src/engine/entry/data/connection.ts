import { MODULE } from "module-helpers";
import fields = foundry.data.fields;

const CONNECTION_CATEGORIES = ["outputs", "outs"] as const;

class EntryConnectionField<
    TCategory extends ConnectionCategory = ConnectionCategory
> extends fields.StringField<ConnectionId, ConnectionId, true, false, false> {
    constructor(options: EntryConnectionFieldOptions, context?: fields.DataFieldContext) {
        super(options, context);
    }

    static get _defaults() {
        return Object.assign(super._defaults, {
            required: true,
            nullable: false,
            readonly: true,
        });
    }

    protected override _validateType(value: string): boolean | void {
        super._validateType(value);

        const seg = value.split(":");
        const category = seg[1];

        if (seg.length !== 3) {
            throw MODULE.Error("is not a valid entry connection string");
        }

        if (this.options.category !== category) {
            throw MODULE.Error(`must be a entry connection of category '${this.options.category}'`);
        }
    }
}

interface EntryConnectionField {
    options: EntryConnectionFieldOptions;
}

type ConnectionId<TCategory extends ConnectionCategory = ConnectionCategory> =
    `${string}:${TCategory}:${string}`;

type ConnectionCategory = (typeof CONNECTION_CATEGORIES)[number];

type EntryConnectionFieldOptions = fields.StringFieldOptions<ConnectionId, true, false, false> & {
    category: ConnectionCategory;
};

export { EntryConnectionField };
export type { ConnectionCategory, ConnectionId };
