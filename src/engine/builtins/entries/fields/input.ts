import { assignStyle, R, setStyleProperties } from "module-helpers";
import { BuiltInEntryField } from ".";
import fields = foundry.data.fields;

abstract class InputField<
    TValue extends unknown,
    TFieldSchema extends fields.DataSchema
> extends BuiltInEntryField<TValue, TFieldSchema> {
    abstract get fontSize(): number;
    abstract get targetWidth(): number;

    get cursor(): PIXI.Cursor {
        return "text";
    }

    get height(): number {
        return this.maxHeight;
    }

    get innerPadding(): number {
        return 4;
    }

    get innerWidth(): number {
        return this.width - this.innerPadding * 2;
    }

    get lineHeight(): number {
        return this.height - 1;
    }

    get targetHeight(): number {
        return 40;
    }

    get targetFontSize(): number {
        return 25.17;
    }

    get transitionTime(): number {
        return 150;
    }

    draw(): void {
        if (this.isConnected) {
            this.beginFill(this.fieldBackgroundColor);
        } else {
            const valueElement = this.createPreciseText(String(this.value), {
                fontSize: this.fontSize,
                lineHeight: this.lineHeight,
            });

            valueElement.x = this.innerPadding;
            valueElement.alpha = this.value === this.default ? 0.5 : 1;

            this.addRectangleMask(valueElement, 0, 0, this.innerWidth, this.height);
            this.addChild(valueElement);
        }

        this.lineStyle({ color: this.fieldBorderColor, width: this.fieldBorderWidth });
        this.drawRect(0, 0, this.width, this.height);

        this.endFill();
    }

    abstract createInput(): HTMLInputElement;

    onClick(): Promise<TValue> {
        const { center, width, height } = this.getGlobalBounds();
        const { targetFontSize, targetWidth, targetHeight, transitionTime } = this;
        const scale = targetHeight / height;

        const input = this.createInput();
        input.classList.add("trigger-engine-field");

        document.body.appendChild(input);

        setStyleProperties(input, {
            "--origin-font-size": `${targetFontSize / scale}px`,
            "--origin-width": `${width}px`,
            "--origin-height": `${height}px`,
            "--target-font-size": `${targetFontSize}px`,
            "--target-width": `${targetWidth}px`,
            "--target-height": `${targetHeight}px`,
            "--transition-time": `${transitionTime}ms`,
        });

        assignStyle(input, {
            left: `${center.x}px`,
            top: `${center.y}px`,
        });

        this.afterInputRender(input);

        input.classList.add("scale-to");

        return new Promise((resolve) => {
            const returnValue = async (value: TValue) => {
                input.classList.remove("scale-to");
                setTimeout(() => {
                    input.remove();
                    resolve(value);
                }, transitionTime);
            };

            this.addEventListeners(input, returnValue);
        });
    }

    afterInputRender(input: HTMLInputElement): void {
        input.focus();
        input.select();
    }

    addEventListeners(
        input: HTMLInputElement,
        returnValue: (value: TValue) => Promise<void>
    ): void {
        const onBlur = () => {
            returnValue(input.value as TValue);
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
                input.value = String(this.value);
                input.removeEventListener("blur", onBlur);
                returnValue(this.value);
            }
        });
    }
}

export { InputField };
