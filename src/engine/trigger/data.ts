import { NodeData, NodeDataSchema, NodeDataSource } from "engine";
import abstract = foundry.abstract;
import fields = foundry.data.fields;
import { IdField, MODULE, R } from "module-helpers";

class TriggerData extends abstract.DataModel<null, TriggerDataSchema> {
    static defineSchema(): TriggerDataSchema {
        return {
            _id: new IdField(),
            nodes: new fields.ArrayField(new fields.SchemaField(NodeData.defineSchema()), {
                required: false,
                nullable: false,
                initial: () => [],
            }),
            applicationKey: new fields.StringField({
                readonly: true,
                required: true,
                nullable: false,
                blank: false,
            }),
            description: new fields.StringField({
                required: false,
                nullable: false,
                initial: "",
            }),
            folder: new fields.StringField({
                required: false,
                nullable: false,
                initial: "",
            }),
            name: new fields.StringField({
                required: false,
                nullable: false,
                initial: "",
            }),
            tags: new fields.ArrayField(
                new fields.StringField({
                    blank: false,
                })
            ),
        };
    }

    get id(): string {
        return this._id;
    }

    protected _initialize(options?: Record<string, unknown>): void {
        super._initialize(options);

        this.nodes = new Collection(
            R.pipe(
                this._source.nodes,
                R.map((source) => {
                    try {
                        const node = new NodeData(source);
                        return [node.id, node] as const;
                    } catch (error) {
                        MODULE.error(
                            `an error ocurred during initialization of NodeData: ${source.type}`,
                            error
                        );
                    }
                }),
                R.filter(R.isTruthy)
            )
        );
    }

    addNode(source: DeepPartial<NodeDataSource>): NodeData | undefined {
        if (source._id && this.nodes.has(source._id)) return;

        try {
            const data = new NodeData(source);

            this.nodes.set(data.id, data);
            this._source.nodes.push(data._source);

            return data;
        } catch (error) {
            MODULE.error(`an error ocurred while trying to add a NodeData: ${source.type}`, error);
        }
    }
}

interface TriggerData extends Omit<ModelPropsFromSchema<TriggerDataSchema>, "nodes"> {
    nodes: Collection<NodeData>;
}

type TriggerDataSource = SourceFromSchema<TriggerDataSchema>;

type UpdateTriggerData = DeepPartial<Omit<TriggerDataSource, "_id" | "_nodes" | "applicationKey">>;

type TriggerDataSchema = {
    _id: IdField;
    nodes: fields.ArrayField<fields.SchemaField<NodeDataSchema>>;
    applicationKey: fields.StringField<string, string, true, false, false>;
    description: fields.StringField<string, string, false, false, true>;
    folder: fields.StringField<string, string, false, false, true>;
    name: fields.StringField<string, string, false, false, true>;
    tags: fields.ArrayField<fields.StringField>;
};

export { TriggerData };
export type { TriggerDataSource, UpdateTriggerData };
