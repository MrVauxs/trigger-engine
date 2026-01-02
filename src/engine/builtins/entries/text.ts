import { R } from "module-helpers";
import { BuiltInNodeEntry, TextField, TextFieldSchema } from ".";
import validators = foundry.data.validators;

class TextEntry extends BuiltInNodeEntry<string, TextFieldSchema> {
    #options?: SelectOptions;

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

    get isSimpleInput(): boolean {
        return !this.field.type;
    }

    get isSelect(): boolean {
        return this.isSimpleInput && !!this.options.length;
    }

    get default(): string {
        if (this.isSelect) {
            return this.getSelectValue(this.field.default);
        }

        return (
            this.field.default ??
            (this.field.type === "json" ? TextEntry.defaultJSON : super.default)
        );
    }

    get options(): SelectOptions {
        return (this.#options ??= this.#prepareOptions());
    }

    /**
     * only called after we made sure this is a select
     */
    getSelectValue(value: string | undefined): string {
        return this.options.find((option) => option.value === value)
            ? (value as string)
            : this.options[0].value;
    }

    isValidType(value: unknown): value is string {
        return R.isString(value);
    }

    processValue(value: string): string {
        if (this.isSelect) {
            return this.getSelectValue(value);
        } else if (this.field.type === "json") {
            return validators.isJSON(value) ? value : TextEntry.defaultJSON;
        }

        return this.field.trim !== false ? value.trim() : value;
    }

    #prepareOptions(): SelectOptions {
        const options = this.field?.options;

        if (R.isString(options)) {
            const cursor = foundry.utils.getProperty(window, options);

            if (!R.isObjectType<Record<string, string>>(cursor)) {
                return [];
            }

            return R.pipe(
                cursor,
                R.entries(),
                R.map(([value, label]) => {
                    return { value, label };
                }),
            );
        } else if (R.isArray(options)) {
            return R.pipe(
                options,
                R.map((option) => {
                    return R.isString(option) ? { value: option } : option;
                }),
            );
        }

        return [];
    }
}

export { TextEntry };
