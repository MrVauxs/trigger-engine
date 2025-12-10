import { DataUnionField } from "module-helpers";
import { IconObject, NodeIconField } from ".";
import abstract = foundry.abstract;
import fields = foundry.data.fields;

class NodeHeader extends abstract.DataModel<null, NodeHeaderSchema> {
    static defineSchema(): NodeHeaderSchema {
        return {
            background: new DataUnionField(
                [
                    new fields.StringField<`#${string}`, `#${string}`>({
                        required: false,
                        nullable: false,
                        blank: false,
                    }),
                    new fields.NumberField<number, number, false, false>({
                        required: false,
                        nullable: false,
                    }),
                ] as const,
                {
                    required: false,
                    nullable: true,
                    initial: "#000000",
                }
            ),
            icon: new NodeIconField(),
            subtitle: new fields.StringField({
                required: false,
                nullable: true,
                blank: true,
                initial: undefined,
            }),
            title: new fields.StringField({
                required: true,
                nullable: false,
                blank: false,
            }),
        };
    }
}

interface NodeHeader extends ModelPropsFromSchema<NodeHeaderSchema> {}

type NodeHeaderSource = SourceFromSchema<NodeHeaderSchema>;

type NodeHeaderData = Prettify<
    WithPartial<Omit<NodeHeaderSource, "icon">, "subtitle" | "background"> & {
        icon?: IconObject | string | null;
    }
>;

type NodeHeaderSchema = {
    background: DataUnionField<
        | fields.StringField<`#${string}`, `#${string}`>
        | fields.NumberField<number, number, false, false>,
        string | number
    >;
    icon: NodeIconField;
    subtitle: fields.StringField<string, string, false, true, false>;
    title: fields.StringField<string, string, true, false, false>;
};

export { NodeHeader };
export type { NodeHeaderData };
