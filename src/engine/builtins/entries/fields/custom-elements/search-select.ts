import {
    R,
    addListenerAll,
    createHTMLElement,
    createInputElement,
    htmlQuery,
} from "module-helpers";

class SearchSelectInputElement extends foundry.applications.elements.AbstractFormInputElement<
    string,
    string
> {
    #input!: HTMLInputElement;
    #options: RequiredSelectOptions;
    #popup!: HTMLDivElement;

    constructor({ options, value }: { options: RequiredSelectOptions; value: string }) {
        super();

        this._setValue(value || "");
        this.#options = options;
    }

    static tagName = "search-select-input";

    focus(options?: FocusOptions | undefined): void {
        this._primaryInput.focus(options);
    }

    expand() {
        this.#popup.classList.add("expand");

        const selected = htmlQuery(this.#popup, ".selected");
        selected?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    collapse() {
        this.#popup.classList.remove("expand");
    }

    protected _buildElements(): HTMLElement[] {
        this.#input = this._primaryInput = createInputElement("text", "field", "");
        this.#input.placeholder = "Search..";

        this.#popup = createHTMLElement("div", {
            classes: ["popup"],
            content: this.#options.map(({ label, value }) => {
                const classes: (string | false)[] = ["option", value === this.value && "selected"];

                return createHTMLElement("div", {
                    classes: classes.filter(R.isTruthy),
                    content: label,
                    dataset: { label, value },
                });
            }),
        });

        return [this.#input, this.#popup];
    }

    protected _setValue(value: unknown): void {
        this._value = R.isString(value) ? value : "";
    }

    _activateListeners(): void {
        const onBlur = (event: PointerEvent) => {
            if (
                event.target instanceof HTMLElement &&
                !this.#popup.contains(event.target) &&
                !this._primaryInput.contains(event.target)
            ) {
                window.removeEventListener("pointerdown", onBlur);
                this.dispatchEvent(new Event("blur", { bubbles: true, cancelable: true }));
            }
        };

        requestAnimationFrame(() => {
            window.addEventListener("pointerdown", onBlur);
        });

        addListenerAll(this.#popup, "[data-value]", (el) => {
            window.removeEventListener("pointerdown", onBlur);
            this.value = el.dataset.value as string;
        });

        this.#input.addEventListener("change", (event) => {
            event.preventDefault();
            event.stopPropagation();
        });

        this.#input.addEventListener("input", () => {
            const search = this.#input.value.trim().toLowerCase();

            for (const child of this.#popup.children) {
                const label = (child as HTMLElement).dataset.label?.toLowerCase() as string;
                child.classList.toggle("hidden", !!search && !label.includes(search));
            }
        });
    }
}

export { SearchSelectInputElement };
