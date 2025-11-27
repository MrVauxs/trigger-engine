import { TriggerApplication, TriggerData, TriggerDataSource, TriggerNode } from "engine";
import { enrichHTML, R } from "module-helpers";

class Trigger {
    #data: TriggerData;
    #invalid: boolean;
    #nodes: Collection<TriggerNode>;
    #parent: TriggerApplication;

    constructor(parent: TriggerApplication, data: TriggerData) {
        this.#data = data;
        this.#parent = parent;

        this.#nodes = new Collection(
            R.pipe(
                data.nodes.contents,
                R.map((data) => {
                    try {
                        const NodeCls = this.parent.getNodeClass(data.type);
                        if (!NodeCls) return;

                        const node = new NodeCls(this, data);
                        return [node.id, node] as const;
                    } catch (error) {}
                }),
                R.filter(R.isTruthy)
            )
        );

        // TODO need to finish implementing that
        this.#invalid = this.#nodes.some((node) => node.invalid);
    }

    get parent(): TriggerApplication {
        return this.#parent;
    }

    get localizePath(): string {
        return this.#data.applicationKey.replace(":", ".");
    }

    get applicationKey(): string {
        return this.#data.applicationKey;
    }

    get path(): string {
        return `${this.applicationKey}:${this.id}`;
    }

    get id(): string {
        return this.#data.id;
    }

    get description(): string {
        return this.#data.description;
    }

    get enrichedDescription(): Promise<string> {
        return enrichHTML(this.description);
    }

    get folder(): string {
        return this.#data.folder;
    }

    get label(): string {
        return this.name || this.id;
    }

    get name(): string {
        return this.#data.name;
    }

    get invalid(): boolean {
        return this.#invalid;
    }

    // TODO need to actually implement that when module triggers is done
    get locked(): boolean {
        return false;
    }

    update(data: UpdateTriggerData): DeepPartial<TriggerDataSource> {
        return this.#data.updateSource(data);
    }

    duplicate(): TriggerDataSource {
        const source = this.#data.clone({
            _id: foundry.utils.randomID(),
            name: this.name ? game.i18n.format("DOCUMENT.CopyOf", { name: this.name }) : "",
        } satisfies DeepPartial<TriggerDataSource>);

        return source.toObject();
    }

    toObject() {
        return this.#data.toObject();
    }
}

interface Trigger {}

type CreateTriggerData = WithRequired<DeepPartial<TriggerDataSource>, "applicationKey">;

type UpdateTriggerData = Pick<TriggerDataSource, "description" | "folder" | "name">;

export { Trigger };
export type { CreateTriggerData, UpdateTriggerData };
