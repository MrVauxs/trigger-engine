import { EntryField, instantiateField, NodeEntry, NodeField, OpenNodeEntry } from "engine";
import { DataSchema } from "module-helpers";
import { BaseBlueprintEntry } from ".";
import { BlueprintNode } from "..";

class BlueprintEntry extends BaseBlueprintEntry {
    #entry: OpenNodeEntry;
    #parent: BlueprintNode;

    constructor(parent: BlueprintNode, entry: OpenNodeEntry) {
        super(parent, entry.category);

        this.#entry = entry;
        this.#parent = parent;
    }

    get node(): BlueprintNode {
        return this.#parent;
    }

    get blueprint() {
        return this.node.blueprint;
    }

    get key(): string {
        return this.#entry.key;
    }

    get label(): string {
        const { key, label } = this.#entry;
        return label ? game.i18n.localize(label) : this.node.localize("entry", key) ?? key;
    }

    get isArray() {
        return this.#entry.isArray;
    }

    get isCustom(): boolean {
        return false;
    }

    get color(): ColorSource {
        return this.#entry.color;
    }

    get FieldCls(): typeof NodeField | undefined {
        const FieldCls = (this.#entry.constructor as typeof NodeEntry)
            .FieldClass as typeof NodeField;
        return FieldCls?.prototype instanceof NodeField ? FieldCls : undefined;
    }

    get hasConnector(): boolean {
        return (
            this.isOutput ||
            (!this.node.isEvent && (!this.FieldCls || this.node.inputsHaveConnector))
        );
    }

    get canConnect(): boolean {
        return this.isOutput || !this.isConnected;
    }

    _drawConnector(): PIXI.Graphics {
        const color = this.color;
        const connector = new PIXI.Graphics();

        if (this.isArray) {
            connector.lineStyle({ color, width: 1 });
            connector.drawCircle(7, 7, 7.5);
        }

        if (this.isConnected) {
            connector.beginFill(this.color);
        }

        if (this.isCustom) {
            connector.lineStyle({ color, width: 2 });
            connector.drawRoundedRect(0, 0, 12.5, 12.5, 2.5);
        } else if (this.isArray) {
            connector.lineStyle({ color, width: 1 });
            connector.drawCircle(7, 7, 5.5);
        } else {
            connector.lineStyle({ color, width: 2 });
            connector.drawCircle(7, 7, 7);
        }

        connector.endFill();

        return connector;
    }

    _drawField(label: PreciseText): PIXI.Graphics | null {
        if (!this.isInput || this.isArray) return null;

        const entry = this.#entry;
        const FieldCls = this.FieldCls;
        if (!FieldCls) return null;

        const processValue = (value: unknown): unknown => {
            const validValue = entry.isValidType(value) ? value : entry.default;
            return entry.processValue(validValue);
        };

        const node = this.node;
        const rawValue = entry.data.value;
        const defaultValue = entry.default;
        const isConnected = this.isConnected;
        const options: NodeFieldOptions = {
            baseFontSize: node.fontSize,
            default: defaultValue,
            field: entry.field as any,
            isConnected,
            label,
            maxHeight: this.maxHeight,
            value: processValue(rawValue),
        };

        const fieldElement = instantiateField(FieldCls, node, options);
        fieldElement.draw();

        if (isConnected) {
            return fieldElement;
        }

        fieldElement.eventMode = "static";
        fieldElement.hitArea = new PIXI.Rectangle(0, 0, fieldElement.width, fieldElement.height);

        fieldElement.on("pointerdown", (event) => {
            event.stopPropagation();
            this.node.selectOnly();
        });

        fieldElement.on("pointerup", async () => {
            this.blueprint.toggleLocked(true);
            const value = await fieldElement.onClick();
            this.blueprint.toggleLocked(false);

            if (value === rawValue) return;

            const newValue = processValue(value);
            if (newValue === rawValue) return;

            this.node.data.updateSource({
                inputs: {
                    [this.key]: newValue === defaultValue ? undefined : { value: newValue },
                },
            });

            this.draw();
        });

        return fieldElement;
    }
}

type NodeFieldOptions = {
    baseFontSize: number;
    default: unknown;
    field: EntryField<DataSchema>;
    isConnected: boolean;
    label: PreciseText;
    maxHeight: number;
    value: unknown;
};

type OnFieldClickOptions<TValue extends unknown = unknown> = {
    setValue: (value: TValue) => void;
};

export { BlueprintEntry };
export type { NodeFieldOptions, OnFieldClickOptions };
