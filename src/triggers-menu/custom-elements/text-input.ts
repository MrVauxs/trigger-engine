import { createHTMLElement, R } from "foundry-helpers";

class ExtendedTextInputElement extends foundry.applications.elements.AbstractFormInputElement<string, string> {
    #clearElement!: HTMLAnchorElement;
    #inputElement!: HTMLInputElement;
    #input: string;

    static tagName: "extended-text-input" = "extended-text-input";

    constructor({ value }: { value?: string } = {}) {
        super();

        this._setValue(value || this.getAttribute("value"));
        this.#input = this.value;
    }

    protected _buildElements(): HTMLElement[] {
        this.#inputElement = this._primaryInput = document.createElement("input");
        this.#inputElement.type = "text";
        this.#inputElement.placeholder = this.getAttribute("placeholder") || "";

        this.#clearElement = createHTMLElement("a", {
            classes: ["clear-tags"],
            content: `<i class="fa-solid fa-circle-x"></i>`,
            dataset: {
                tooltip: this.getAttribute("clear-tooltip") || undefined,
            },
        });

        return [this.#inputElement, this.#clearElement];
    }

    protected _setValue(value: unknown): void {
        this._value = R.isString(value) ? value : "";
    }

    protected _toggleDisabled(disabled: boolean): void {
        this.#clearElement.classList.toggle("disabled", disabled);
        this.#inputElement.disabled = disabled;
    }

    _activateListeners(): void {
        this.#clearElement.addEventListener("click", this.#onClickClear.bind(this));

        this.#inputElement.addEventListener("blur", this.#onBlur.bind(this));
        this.#inputElement.addEventListener("change", this.#onChange.bind(this));
        this.#inputElement.addEventListener("focus", this.#onFocus.bind(this));
        this.#inputElement.addEventListener("input", this.#onInput.bind(this));
        this.#inputElement.addEventListener("keydown", this.#onKeyDown.bind(this));
    }

    protected _refresh(): void {
        this.#inputElement.value = this._value;
    }

    #onBlur(event: Event) {
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.#input = this.value;
        this.dispatchEvent(new Event("blur", { bubbles: true, cancelable: true }));
        this._refresh();
    }

    #onChange(event: Event) {
        event.stopPropagation();
        event.stopImmediatePropagation();

        this._setValue(this.#inputElement.value);
        this.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
        this._refresh();
    }

    #onFocus() {
        this.#input = this.value;
    }

    #onInput(event: Event) {
        event.stopPropagation();
        event.stopImmediatePropagation();

        this._setValue(this.#inputElement.value);
        this.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
        this._refresh();
    }

    #onKeyDown(event: KeyboardEvent) {
        if (event.key === "Enter") {
            event.preventDefault();

            this.#inputElement.blur();
        } else if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            this._setValue(this.#input);
            this.#inputElement.value = this.#input;
            this.#inputElement.blur();
        }
    }

    #onClickClear() {
        this.#input = "";
        this.value = "";
    }
}

export { ExtendedTextInputElement };
