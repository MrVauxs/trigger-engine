import { NodeFieldSchema } from "engine";
import { R, foundryLocalizeIfExist, htmlQuery } from "module-helpers";
import { InputField, SearchSelectInputElement } from ".";
import { TextEntry } from "../text";
import elements = foundry.applications.elements;

const NODE_INPUT_CODE_TYPES = ["javascript", "json"] as const;
const NODE_INPUT_TEXT_TYPES = ["enriched", "select", ...NODE_INPUT_CODE_TYPES] as const;

class TextField extends InputField<string, TextFieldSchema> {
    static get defineSchema(): NodeFieldSchema {
        return {
            default: { type: "string" },
            options: {
                type: "array",
                items: {
                    anyOf: [
                        { type: "string" },
                        {
                            type: "object",
                            properties: {
                                group: { type: "string" },
                                label: { type: "string" },
                                value: { type: "string" },
                            },
                            required: ["value"],
                        },
                    ],
                },
            },
            tooltip: {
                default: true,
                type: "boolean",
            },
            trim: {
                default: true,
                type: "boolean",
            },
            type: {
                type: "string",
                enum: NODE_INPUT_TEXT_TYPES as any,
            },
        };
    }

    get cursor(): PIXI.Cursor {
        return this.isSelect ? "pointer" : "text";
    }

    get fontSize(): number {
        return this.baseFontSize * 0.86;
    }

    get width(): number {
        return 120;
    }

    get decoratorWidth(): number {
        return 16;
    }

    get isSimpleInput(): boolean {
        return !this.field.type;
    }

    get isSelect(): boolean {
        return this.entry.isSelect;
    }

    get options(): SelectFieldOption[] {
        return this.entry.options;
    }

    get isEnrichedInput(): boolean {
        return this.field.type === "enriched";
    }

    get isJSON(): boolean {
        return this.field.type === "json";
    }

    get targetFontSize(): number {
        return this.isSelect || this.isSimpleInput ? super.targetFontSize : 15;
    }

    get targetHeight(): number {
        return this.isSelect || this.isSimpleInput ? super.targetHeight : 400;
    }

    get targetWidth(): number {
        return 400;
    }

    get transitionTime(): number {
        return this.isSimpleInput ? super.transitionTime : 250;
    }

    get toDisplay(): string {
        if (this.isJSON && this.value === this.default) {
            return "";
        }

        if (this.isSelect) {
            const option = this.options.find((option) => option.value === this.value);
            return option ? this.localizeOption(option) : this.value;
        }

        return this.isSimpleInput
            ? this.value
            : this.isEnrichedInput
              ? this.value.replace(/\<\/?p\>/g, " ")
              : this.value.replace(/\s{1,}|\\n/g, this.field.type === "json" ? "" : " ");
    }

    get valueAlpha(): number {
        return this.isSelect ? 1 : super.valueAlpha;
    }

    localizeOption({ value, label }: SelectOption): string {
        return R.isString(label) ? game.i18n.localize(label) : (this.localize("options", value) ?? value);
    }

    draw(): void {
        super.draw();

        const label = this.label;
        const padding = this.innerPadding;
        const isSelect = this.isSelect;
        const textWidth = isSelect ? this.width - this.decoratorWidth : this.width;

        label.x = this.innerPadding;
        label.position.set(this.innerPadding, 0);
        label.style.fontSize = this.fontSize;
        label.style.lineHeight = this.lineHeight;

        if (isSelect) {
            label.alpha = this.isConnected ? 0.5 : 0;

            this.lineStyle({
                alpha: this.isConnected ? 0.5 : 1,
                color: this.borderColor,
                width: this.borderWidth,
            });

            // the demarcation
            this.moveTo(textWidth, 0);
            this.lineTo(textWidth, this.height);

            // the icon
            const highPoint = this.height / 3;
            const lowPoint = this.height * 0.66;
            const leftPoint = textWidth + this.decoratorWidth / 4;
            const rightPoint = textWidth + this.decoratorWidth * 0.75;
            const centerPoint = (leftPoint + rightPoint) / 2;

            this.lineStyle({
                alpha: this.isConnected ? 0.5 : 1,
                color: this.borderColor,
                width: 1,
            });

            this.moveTo(leftPoint, highPoint);
            this.lineTo(centerPoint, lowPoint);
            this.lineTo(rightPoint, highPoint);
        } else {
            label.alpha = this.isConnected || this.value === this.default ? 0.5 : 0;
        }

        this.addRectangleMask(label, 0, 0, textWidth - padding * 2, this.height);
        this.addChild(label);
    }

    createInput(): HTMLInputElement {
        if (this.field.type === "select" && this.options.length) {
            const options: SelectFieldOptions = R.map(this.options, (option) => {
                const group = option.group
                    ? (this.localize("options", option.group) ?? foundryLocalizeIfExist(option.group))
                    : undefined;

                return {
                    value: option.value,
                    label: this.localizeOption(option),
                    group,
                };
            });

            return new SearchSelectInputElement({ options, value: this.value }) as any;
        }

        if (this.field.type === "enriched") {
            return elements.HTMLProseMirrorElement.create({
                collaborate: false,
                compact: true,
                name: "field",
                toggled: false,
                value: this.value,
            }) as any;
        }

        if (R.isIncludedIn(this.field.type, ["javascript", "json"] as const)) {
            return foundry.applications.elements.HTMLCodeMirrorElement.create({
                language: this.field.type,
                name: "field",
                value: this.value,
            }) as any;
        }

        return foundry.applications.fields.createTextInput({
            name: "field",
            placeholder: this.label.text,
            value: this.value,
        });
    }

    afterRender(input: HTMLInputElement | SearchSelectInputElement) {
        input.focus();
        input.classList.toggle("bottom-half", input.getBoundingClientRect().y > window.outerHeight / 2);
    }

    afterAnimation(input: HTMLInputElement | SearchSelectInputElement): void {
        if (input instanceof SearchSelectInputElement) {
            input.expand();
        } else if (this.isSimpleInput) {
            input.select();
        } else {
            const selector = this.isEnrichedInput ? ".editor-content" : ".cm-content";
            const content = htmlQuery(input, selector);

            content?.focus();
        }
    }

    activateEventListeners(input: HTMLInputElement, returnValue: (value: string) => Promise<void>): void {
        if (this.isSelect) {
            const closeInput = (value: string) => {
                (input as unknown as SearchSelectInputElement).collapse();
                returnValue(value);
            };

            input.addEventListener("change", () => {
                closeInput(input.value);
            });
            input.addEventListener("blur", () => {
                closeInput(this.value);
            });
        } else if (this.isSimpleInput) {
            super.activateEventListeners(input, returnValue);
        } else if (this.isEnrichedInput) {
            const onSave = () => {
                returnValue(input.value);
            };

            input.addEventListener("save", onSave, { once: true });

            input.addEventListener("keydown", (event) => {
                if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();

                    input.value = this.value;
                    input.removeEventListener("blur", onSave);
                    returnValue(this.value);
                }
            });
        } else {
            const onBlur = () => {
                // we wait one frame so the code-mirror #onBlur can happen before
                requestAnimationFrame(() => {
                    returnValue(input.value);
                });
            };

            const content = htmlQuery(input, ".cm-content");
            content?.addEventListener("blur", onBlur, { once: true });

            input.addEventListener("keydown", (event) => {
                if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();

                    content?.removeEventListener("blur", onBlur);

                    input.value = this.value;
                    returnValue(this.value);
                }
            });
        }
    }
}

interface TextField {
    readonly entry: TextEntry;
}

type TextFieldSchemaType = (typeof NODE_INPUT_TEXT_TYPES)[number];

type TextFieldSchema = {
    default?: string;
    options?: (SelectFieldOption | string)[];
    tooltip: boolean;
    trim: boolean;
    type?: TextFieldSchemaType;
};

type SelectFieldOption = Prettify<SelectOption & { group?: string }>;
type SelectFieldOptions = Prettify<WithRequired<SelectFieldOption, "label">>[];

export { TextField };
export type { SelectFieldOption, SelectFieldOptions, TextFieldSchema, TextFieldSchemaType };
