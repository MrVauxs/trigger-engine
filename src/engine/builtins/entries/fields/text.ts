import { InputField } from ".";
import fields = foundry.data.fields;

const NODE_INPUT_CODE_TYPES = ["javascript", "json"] as const;
const NODE_INPUT_TEXT_TYPES = ["enriched", ...NODE_INPUT_CODE_TYPES] as const;

class TextField extends InputField<string, TextFieldSchema> {
    static get defineSchema(): TextFieldSchema {
        return {
            trim: new fields.BooleanField({
                required: false,
                nullable: false,
                initial: true,
            }),
            type: new fields.StringField({
                required: false,
                nullable: false,
                blank: false,
                choices: NODE_INPUT_TEXT_TYPES,
                initial: undefined,
            }),
        };
    }

    get fontSize(): number {
        return this.baseFontSize * 0.86;
    }

    get width(): number {
        return 120;
    }

    get targetWidth(): number {
        return 400;
    }

    draw(): void {
        super.draw();

        const label = this.label;
        const padding = this.innerPadding;

        label.x = this.innerPadding;
        label.position.set(this.innerPadding, 0);
        label.style.fontSize = this.fontSize;
        label.style.lineHeight = this.lineHeight;
        label.alpha = this.isConnected || !this.value ? 0.5 : 0;

        this.addRectangleMask(label, 0, 0, this.width - padding * 2, this.height);
        this.addChild(label);
    }

    createInput(): HTMLInputElement {
        return foundry.applications.fields.createTextInput({
            name: "field",
            placeholder: this.label.text,
            value: this.value,
        });
    }
}

type TextEntryCode = (typeof NODE_INPUT_CODE_TYPES)[number];

type TextEntryType = (typeof NODE_INPUT_TEXT_TYPES)[number];

type TextFieldSchema = {
    trim: fields.BooleanField<boolean, boolean, false, false, true>;
    type: fields.StringField<TextEntryType, TextEntryType, false, false, false>;
};

export { TextField };
export type { TextFieldSchema };
