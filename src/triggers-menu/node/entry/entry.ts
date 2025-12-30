import { instantiateField, NodeEntry, NodeField, OpenNodeEntry } from "engine";
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

    get type(): string {
        return this.#entry.type;
    }

    get key(): string {
        return this.#entry.key;
    }

    get label(): string {
        const { key, label } = this.#entry;
        return label ? game.i18n.localize(label) : this.node.localize(this.category, key) ?? key;
    }

    get isArray() {
        return this.#entry.isArray;
    }

    get isConnectionInitiator(): boolean {
        return this.isInput;
    }

    get isRevealed(): boolean {
        return !!this.#entry.schema.hidden;
    }

    get customSlug(): string | undefined {
        return this.#entry.schema.slug;
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
        return !this.node.isLocked && (this.isOutput || !this.isConnected);
    }

    canConvertWith(other: BlueprintEntry): boolean {
        if (this.type === other.type) return true;

        const [input, output] = this.isInput ? [this.type, other.type] : [other.type, this.type];
        return !!this.blueprint.application.getConvertor(output, input);
    }

    canConnectTo(other: BlueprintEntry): boolean {
        return super.canConnectTo(other) && this.canConvertWith(other);
    }

    _drawConnector(connector: PIXI.Graphics, isConnected: boolean) {
        const color = this.color;
        const isArray = this.isArray;
        const isCustom = this.isCustom;

        if (isArray) {
            connector.lineStyle({ color, width: 1 });
            if (isCustom) {
                connector.drawRoundedRect(0, 0, 12.5, 14.5, 2.5);
            } else {
                connector.drawCircle(7, 7, 7.5);
            }
        }

        if (isConnected) {
            connector.beginFill(this.color);
        }

        connector.lineStyle({ color, width: isArray ? 1 : 2 });

        if (isCustom) {
            if (isArray) {
                connector.drawRoundedRect(2, 2, 8.5, 10, 2);
            } else {
                connector.drawRoundedRect(0, 0, 12.5, 14, 2.5);
            }
        } else if (isArray) {
            connector.drawCircle(7, 7, 5.5);
        } else {
            connector.drawCircle(7, 7, 7);
        }

        connector.endFill();
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

        if (isConnected || !this.canConnect) {
            return fieldElement;
        }

        fieldElement.eventMode = "static";
        fieldElement.hitArea = new PIXI.Rectangle(0, 0, fieldElement.width, fieldElement.height);

        fieldElement.on("pointerdown", (event) => {
            event.stopPropagation();
            this.node.selectOnly();
        });

        fieldElement.on("pointerup", async (event) => {
            if (event.button !== 0) return;

            this.blueprint.toggleLocked(true);
            const value = await fieldElement.onClick();
            this.blueprint.toggleLocked(false);

            if (value === rawValue) return;

            const newValue = processValue(value);
            if (newValue === rawValue) return;

            if (newValue === defaultValue) {
                this.node.data.update({
                    inputs: {
                        [this.key]: undefined,
                    },
                });
            } else {
                this.node.data.update({
                    inputs: {
                        [this.key]: {
                            connections: undefined,
                            value: newValue,
                        },
                    },
                });
            }

            this.draw();
        });

        return fieldElement;
    }
}

function isBlueprintEntry(entry: BaseBlueprintEntry): entry is BlueprintEntry {
    return entry instanceof BlueprintEntry;
}

type NodeFieldOptions = {
    baseFontSize: number;
    default: unknown;
    field: Record<string, any>;
    isConnected: boolean;
    label: PreciseText;
    maxHeight: number;
    value: unknown;
};

export { BlueprintEntry, isBlueprintEntry };
export type { NodeFieldOptions };
