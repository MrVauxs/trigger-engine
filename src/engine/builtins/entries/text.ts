import { BuiltInNodeEntry, TextField, TextFieldSchema } from ".";
import validators = foundry.data.validators;

class TextEntry extends BuiltInNodeEntry<string, TextFieldSchema> {
    static get type(): "text" {
        return "text";
    }

    static get default(): string {
        return "";
    }

    static get color(): ColorSource {
        return 0xe0a06c;
    }

    static get FieldClass(): typeof TextField {
        return TextField;
    }

    static get defaultJSON(): string {
        return "{\n  \n}";
    }

    get default(): string {
        return (
            this.field.default ??
            (this.field.type === "json" ? TextEntry.defaultJSON : super.default)
        );
    }

    castValue(value: unknown): string {
        return String(value);
    }

    processValue(value: string): string {
        if (this.field.type === "json") {
            return validators.isJSON(value) ? value : TextEntry.defaultJSON;
        }

        return this.field.trim !== false ? value.trim() : value;
    }
}

export { TextEntry };
