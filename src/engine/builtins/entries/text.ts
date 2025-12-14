import { BuiltInNodeEntry, TextField, TextFieldSchema } from ".";

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

    castValue(value: unknown): string {
        return String(value);
    }

    processValue(value: string): string {
        return this.field.trim !== false ? value.trim() : value;
    }
}

export { TextEntry };
