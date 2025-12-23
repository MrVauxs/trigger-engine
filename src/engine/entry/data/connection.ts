import { MODULE, R } from "module-helpers";
import { PreciseEntryCategory } from "triggers-menu";
import fields = foundry.data.fields;

const CONNECTION_CATEGORIES = ["outputs", "outs"] as const;
const OPPOSITE_CONNECTION_CATEGORY = ["inputs", "ins"] as const;

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

function isOppositeConnection(
    category: PreciseEntryCategory
): category is OppositeConnectionCategory {
    return R.isIncludedIn(category, OPPOSITE_CONNECTION_CATEGORY);
}

function isConnectionId(id: string): id is ConnectionId {
    const args = R.split(id, ":");
    return args.length === 3 && R.isIncludedIn(args.at(1), CONNECTION_CATEGORIES);
}

type ConnectionId = `${string}:${ConnectionCategory}:${string}`;

type ConnectionCategory = (typeof CONNECTION_CATEGORIES)[number];
type OppositeConnectionCategory = (typeof OPPOSITE_CONNECTION_CATEGORY)[number];

type EntryConnectionFieldOptions = fields.StringFieldOptions<ConnectionId, true, false, false> & {
    category: ConnectionCategory;
};

export { EntryConnectionField, isConnectionId, isOppositeConnection };
export type { ConnectionCategory, ConnectionId, OppositeConnectionCategory };
