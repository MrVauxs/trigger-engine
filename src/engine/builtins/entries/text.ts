import { R } from "module-helpers";
import { BuiltInNodeEntry, TextField, TextFieldSchema } from ".";
import validators = foundry.data.validators;

class TextEntry extends BuiltInNodeEntry<string, TextFieldSchema> {
    #options?: EntrySelectOption[];

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

    static isValidType(value: unknown): value is string {
        return R.isString(value);
    }

    static toJSON(value: string): string {
        return value;
    }

    static fromJSON(value: JSONValue): string {
        return String(value);
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

        return this.field.default ?? (this.field.type === "json" ? TextEntry.defaultJSON : super.default);
    }

    get options(): EntrySelectOption[] {
        return (this.#options ??= this.#prepareOptions());
    }

    generateTooltip(label: string, isConnected: boolean): string | undefined {
        if (
            this.category === "inputs" &&
            (this.isSelect || isConnected || (R.isString(this.value) && this.value !== this.default))
        ) {
            return this.tooltip ? `<div>${label}</div><hr><div>${this.tooltip}</div>` : label;
        }
        return this.tooltip;
    }

    /**
     * only called after we made sure this is a select
     */
    getSelectValue(value: string | undefined): string {
        return this.options.find((option) => option.value === value) ? (value as string) : this.options[0].value;
    }

    castValue(value: unknown): string {
        return String(value || "");
    }

    processValue(value: string): string {
        if (this.isSelect) {
            return this.getSelectValue(value);
        } else if (this.field.type === "json") {
            return validators.isJSON(value) ? value : TextEntry.defaultJSON;
        }

        return this.field.trim !== false ? value.trim() : value;
    }

    #prepareOptions(): EntrySelectOption[] {
        const options = this.field?.options;

        if (R.isString(options)) {
            return this.#getOptionsFromPath(options);
        } else if (R.isArray(options)) {
            return R.pipe(
                options,
                R.map((option) => {
                    return R.isString(option) ? { value: option } : option;
                }),
            );
        } else if (R.isPlainObject(options)) {
            const { path, exclude } = options;
            const prepared = this.#getOptionsFromPath(path);

            return exclude?.length ? prepared.filter(({ value }) => !R.isIncludedIn(value, exclude)) : prepared;
        }

        return [];
    }

    #getOptionsFromPath(path: string): EntrySelectOption[] {
        const cursor = foundry.utils.getProperty(window, path);

        if (!R.isObjectType<Record<string, string | { label: string }>>(cursor)) {
            return [];
        }

        return R.pipe(
            cursor,
            R.entries(),
            R.map(([value, label]) => {
                return { value, label };
            }),
        );
    }
}

type EntrySelectOption = {
    value: string;
    label?: string | { label: string };
};

export { TextEntry };
export type { EntrySelectOption };
