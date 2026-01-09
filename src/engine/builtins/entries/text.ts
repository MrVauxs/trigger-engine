import { R, isIterable } from "module-helpers";
import {
    BaseEntrySchema,
    BaseInputEntrySchema,
    BuiltInNodeEntry,
    TextField,
    TextFieldPathOptions,
    TextFieldSchema,
} from ".";
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
        return !this.field.type || (this.field.type === "select" && !this.options.length);
    }

    get isSelect(): boolean {
        return this.field.type === "select" && !!this.options.length;
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
        const tooltip = super.generateTooltip(label, isConnected);

        if (
            this.category === "inputs" &&
            (this.isSelect || isConnected || (R.isString(this.value) && this.value !== this.default))
        ) {
            if (this.field.tooltip) {
                return tooltip ? `<div class="title">${label}</div><hr><div>${tooltip}</div>` : label;
            } else {
                return;
            }
        }

        return tooltip;
    }

    /**
     * only called after we made sure this is a select
     */
    getSelectValue(value: string | undefined): string {
        return this.options.find((option) => option.value === value) ? (value as string) : this.options[0].value;
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
            return this.#getOptionsFromPath({ path: options });
        } else if (R.isArray(options)) {
            return R.pipe(
                options,
                R.map((option) => {
                    return R.isString(option) ? { value: option } : option;
                }),
            );
        } else if (R.isPlainObject(options)) {
            return this.#getOptionsFromPath(options);
        }

        return [];
    }

    #getOptionsFromPath(fieldOptions: TextFieldPathOptions): SelectOptions {
        const options: SelectOptions = [];
        const cursor = foundry.utils.getProperty(window, fieldOptions.path);
        const fieldValue = fieldOptions.value || "value";
        const fieldLabel = fieldOptions.label || "label";
        const exclude = fieldOptions.exclude;
        const excludeValues = R.isArray(exclude) ? exclude : undefined;
        const excludeProperties = R.isObjectType(exclude) ? R.entries(exclude as Record<string, any>) : [];

        const matchExcludeProperty = (entry: Record<string, any>): boolean => {
            for (const [property, value] of excludeProperties) {
                if (entry[property as keyof typeof entry] === value) {
                    return true;
                }
            }
            return false;
        };

        if (isIterable(cursor)) {
            for (const entry of cursor) {
                if (R.isString(entry)) {
                    options.push({ value: entry });
                } else if (R.isObjectType(entry)) {
                    if (matchExcludeProperty(entry)) continue;

                    const value = entry[fieldValue as keyof typeof entry];
                    const label = entry[fieldLabel as keyof typeof entry];

                    if (R.isString(value)) {
                        options.push({ label, value });
                    }
                }
            }
        } else if (R.isObjectType<Record<string, any>>(cursor)) {
            for (const [value, entry] of R.entries(cursor)) {
                const isObj = R.isObjectType(entry);
                if (isObj && matchExcludeProperty(entry)) continue;

                options.push({
                    label: isObj ? entry[fieldLabel as keyof typeof entry] : R.isString(entry) ? entry : undefined,
                    value,
                });
            }
        }

        return excludeValues?.length ? options.filter(({ value }) => !R.isIncludedIn(value, excludeValues)) : options;
    }
}

type EntrySelectOption = {
    value: string;
    label?: string | { label: string };
};

type OutputTextEntry = BaseEntrySchema<"text">;

type BaseField = {
    default?: string;
    tooltip?: boolean;
    trim?: boolean;
};

type SimpleField = Prettify<BaseField & { type?: "enriched" }>;
type SelectField = Prettify<BaseField & { type: "select"; options: TextFieldSchema["options"] }>;
type JsonField = Prettify<BaseField & { type: "json" }>;
type JavascriptField = Prettify<BaseField & { type: "javascript" }>;

type BuiltinsTextFieldSchema = SimpleField | SelectField | JsonField | JavascriptField;

type InputTextEntry = BaseInputEntrySchema<"text", BuiltinsTextFieldSchema>;

export { TextEntry };
export type { EntrySelectOption, InputTextEntry, OutputTextEntry };
