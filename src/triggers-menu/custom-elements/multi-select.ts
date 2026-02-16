import { createHTMLElement, R } from "foundry-helpers";

const TAGS_MODES = ["and", "or"] as const;

// @ts-expect-error
class ExtendedMultiSelectElement extends foundry.applications.elements.HTMLMultiSelectElement {
    #clearElement!: HTMLAnchorElement;
    #modeElement!: HTMLAnchorElement;
    #mode: MultiSelectTagsMode;
    #modes: { and: string; or: string };
    #placeholderElement?: HTMLElement;

    static MODES: Record<MultiSelectTagsMode, string> = {
        and: `<span>&</span>`,
        or: `<i class="fa-solid fa-greater-than-equal"></i>`,
    };

    static override tagName = "extended-multi-select";

    constructor() {
        super();

        const mode = this.getAttribute("mode");
        this.#mode = R.isIncludedIn(mode, TAGS_MODES) ? mode : "and";

        this.#modes = {
            and: this.getAttribute("mode-and") || ExtendedMultiSelectElement.MODES.and,
            or: this.getAttribute("mode-or") || ExtendedMultiSelectElement.MODES.or,
        };
    }

    get mode(): MultiSelectTagsMode {
        return this.#mode;
    }

    set mode(value) {
        if (value === this.#mode || (value !== "and" && value !== "or")) return;

        this.#mode = value;
        this.#modeElement.innerHTML = this.#modes[this.#mode];

        this.dispatchEvent(
            new CustomEvent("mode", {
                detail: this.#mode,
                bubbles: true,
                cancelable: true,
            }),
        );
    }

    toggleMode() {
        this.mode = this.mode === "and" ? "or" : "and";
    }

    protected _refresh(): void {
        super._refresh();

        this.#modeElement.innerHTML = this.#modes[this.#mode];
    }

    protected _buildElements(): HTMLElement[] {
        const elements = super._buildElements();

        this.#clearElement = createHTMLElement("a", {
            classes: ["clear-tags"],
            content: `<i class="fa-solid fa-circle-x"></i>`,
            dataset: {
                tooltip: this.getAttribute("clear-tooltip") || undefined,
            },
        });

        this.#modeElement = createHTMLElement("a", {
            classes: ["tags-mode"],
            content: this.#modes[this.#mode],
            dataset: {
                tooltip: this.getAttribute("mode-tooltip") || undefined,
            },
        });

        elements.push(this.#modeElement, this.#clearElement);

        const placeholder = this.getAttribute("placeholder");
        if (placeholder) {
            this.#placeholderElement = createHTMLElement("div", {
                classes: ["placeholder"],
                content: placeholder,
            });

            elements.push(this.#placeholderElement);
        }

        return elements;
    }

    protected _toggleDisabled(disabled: boolean): void {
        super._toggleDisabled(disabled);

        this.#clearElement.classList.toggle("disabled", disabled);
        this.#modeElement.classList.toggle("disabled", disabled);
    }

    _activateListeners(): void {
        super._activateListeners();

        this.#clearElement.addEventListener("click", this.#onClickClear.bind(this));
        this.#modeElement.addEventListener("click", this.toggleMode.bind(this));
    }

    #onClickClear() {
        if (this._value.size === 0) return;

        this._value.clear();
        this.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
        this._refresh();
    }
}

type MultiSelectTagsMode = (typeof TAGS_MODES)[number];

export { ExtendedMultiSelectElement };
export type { MultiSelectTagsMode };
