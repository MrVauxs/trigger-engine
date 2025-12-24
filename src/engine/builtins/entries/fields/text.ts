import { htmlQuery, z } from "module-helpers";
import { InputField } from ".";
import elements = foundry.applications.elements;

const NODE_INPUT_CODE_TYPES = ["javascript", "json"] as const;
const NODE_INPUT_TEXT_TYPES = ["enriched", ...NODE_INPUT_CODE_TYPES] as const;

class TextField extends InputField<string, TextFieldSchema> {
    static get defineSchema(): z.core.JSONSchema.ObjectSchema {
        return {
            type: "object",
            properties: {
                default: { type: "string" },
                trim: { default: true, type: "boolean" },
                type: {
                    type: "string",
                    enum: NODE_INPUT_TEXT_TYPES as any,
                },
            },
        };
    }

    get fontSize(): number {
        return this.baseFontSize * 0.86;
    }

    get width(): number {
        return 120;
    }

    get isSimpleInput(): boolean {
        return !this.field.type;
    }

    get isEnrichedInput(): boolean {
        return this.field.type === "enriched";
    }

    get isJSON(): boolean {
        return this.field.type === "json";
    }

    get targetFontSize(): number {
        return this.isSimpleInput ? super.targetFontSize : 15;
    }

    get targetHeight(): number {
        return this.isSimpleInput ? super.targetHeight : 400;
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

        return this.isSimpleInput
            ? this.value
            : this.isEnrichedInput
            ? this.value.replace(/\<\/?p\>/g, " ")
            : this.value.replace(/\s{1}|\\n/g, this.field.type === "json" ? "" : " ");
    }

    draw(): void {
        super.draw();

        const label = this.label;
        const padding = this.innerPadding;

        label.x = this.innerPadding;
        label.position.set(this.innerPadding, 0);
        label.style.fontSize = this.fontSize;
        label.style.lineHeight = this.lineHeight;
        label.alpha = this.isConnected || this.value === this.default ? 0.5 : 0;

        this.addRectangleMask(label, 0, 0, this.width - padding * 2, this.height);
        this.addChild(label);
    }

    createInput(): HTMLInputElement {
        if (this.isSimpleInput) {
            return foundry.applications.fields.createTextInput({
                name: "field",
                placeholder: this.label.text,
                value: this.value,
            });
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

        return foundry.applications.elements.HTMLCodeMirrorElement.create({
            language: this.field.type,
            name: "field",
            value: this.value,
        }) as any;
    }

    afterRender(input: HTMLInputElement) {
        input.focus();
    }

    afterAnimation(input: HTMLInputElement): void {
        if (this.isSimpleInput) {
            input.select();
        } else {
            const selector = this.isEnrichedInput ? ".editor-content" : ".cm-content";
            const content = htmlQuery(input, selector);

            content?.focus();
        }
    }

    activateEventListeners(
        input: HTMLInputElement,
        returnValue: (value: string) => Promise<void>
    ): void {
        if (this.isSimpleInput) {
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

type TextEntryType = (typeof NODE_INPUT_TEXT_TYPES)[number];

type TextFieldSchema = {
    default?: string;
    trim: boolean;
    type?: TextEntryType;
};

export { TextField };
export type { TextFieldSchema };
