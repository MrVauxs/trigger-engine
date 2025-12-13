import { assignStyle, R, roundToStep } from "module-helpers";
import { BuiltInEntryField, BuiltInNodeEntry } from ".";
import fields = foundry.data.fields;

class NumberField extends BuiltInEntryField<number, NumberFieldSchema> {
    static get defineSchema(): NumberFieldSchema {
        return {
            choices: new fields.ArrayField(
                new fields.NumberField({
                    required: true,
                    nullable: false,
                }),
                {
                    required: false,
                    nullable: false,
                    initial: () => [],
                }
            ),
            default: new fields.NumberField({
                required: false,
                nullable: false,
                initial: 0,
            }),
            max: new fields.NumberField({
                required: false,
                nullable: false,
                initial: undefined,
            }),
            min: new fields.NumberField({
                required: false,
                nullable: false,
                initial: undefined,
            }),
            step: new fields.NumberField({
                required: false,
                nullable: false,
                initial: 1,
            }),
        };
    }

    get cursor(): PIXI.Cursor {
        return "text";
    }

    get width(): number {
        return 40;
    }

    get height(): number {
        return this.maxHeight;
    }

    get fontSize(): number {
        return this.baseFontSize * 0.86;
    }

    draw(): void {
        if (this.isConnected) {
            this.beginFill(this.fieldBackgroundColor);
        } else {
            const padding = 3;
            const valueElement = this.createPreciseText(String(this.value), {
                fontSize: this.fontSize,
                lineHeight: this.height,
            });

            valueElement.x = padding;
            valueElement.alpha = this.value === this.default ? 0.5 : 1;

            this.addRectangleMask(valueElement, 0, 0, this.width - padding * 2, this.height);
            this.addChild(valueElement);
        }

        this.lineStyle({ color: this.fieldBorderColor, width: this.fieldBorderWidth });
        this.drawRect(0, 0, this.width, this.height);

        this.endFill();
    }

    onClick(): Promise<number> {
        const { center, width, height } = this.getGlobalBounds();
        const targetHeight = 40;
        const targetFontSize = 25.17;
        const transitionTime = 150;
        const scale = targetHeight / height;

        const input = foundry.applications.fields.createNumberInput({
            classes: "trigger-engine-field",
            name: "field",
            placeholder: String(this.default),
            value: this.value,
            min: this.field.min,
            max: this.field.max,
            step: this.field.step,
        });

        document.body.appendChild(input);

        const setInputProperties = (properties: Record<string, number>) => {
            for (const [property, value] of R.entries(properties)) {
                input.style.setProperty(`--origin-${property}`, `${value}px`);
                input.style.setProperty(`--target-${property}`, `${value * scale}px`);
            }
        };

        setInputProperties({
            "font-size": targetFontSize / scale,
            width: width + 4,
            height: height + 4,
        });

        input.style.setProperty("--transition-time", `${transitionTime}ms`);

        input.focus();
        input.select();

        assignStyle(input, {
            left: `${center.x}px`,
            top: `${center.y}px`,
        });

        input.classList.add("scale-to");

        return new Promise((resolve) => {
            const removeInput = async (value: number) => {
                input.classList.remove("scale-to");
                setTimeout(() => {
                    input.remove();
                    resolve(value);
                }, transitionTime);
            };

            const onBlur = () => {
                removeInput(input.valueAsNumber);
            };

            input.addEventListener("blur", onBlur, { once: true });

            input.addEventListener("keydown", (event) => {
                const key = event.key;
                if (!R.isIncludedIn(key, ["Enter", "Escape"] as const)) return;

                event.preventDefault();
                event.stopPropagation();

                if (key === "Enter") {
                    input.blur();
                } else {
                    input.removeEventListener("blur", onBlur);
                    removeInput(this.value);
                }
            });
        });
    }
}

class NumberEntry extends BuiltInNodeEntry<number, NumberFieldSchema> {
    static get type(): "number" {
        return "number";
    }

    static get default(): number {
        return 0;
    }

    static get color(): ColorSource {
        return 0x07b88f;
    }

    static get FieldClass(): typeof NumberField {
        return NumberField;
    }

    get default(): number {
        return this.field.default ?? super.default;
    }

    castValue(value: unknown): number {
        return Number(value) || 0;
    }

    processValue(value: number): number {
        const { min = -Infinity, max = Infinity, step } = this.field;
        const stepped = R.isNumber(step) ? roundToStep(value, step) : value;
        const clamped = Math.clamp(stepped, min, max);

        return R.isIncludedIn(clamped, [Infinity, -Infinity]) ? 0 : clamped;
    }
}

type NumberFieldSchema = {
    choices: fields.ArrayField<fields.NumberField<number, number, true, false, false>>;
    default: fields.NumberField<number, number, false, false, true>;
    max: fields.NumberField<number, number, false, false, false>;
    min: fields.NumberField<number, number, false, false, false>;
    step: fields.NumberField<number, number, false, false, true>;
};

export { NumberEntry };
export type { NumberFieldSchema };
