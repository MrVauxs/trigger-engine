import { Trigger } from "engine";
import {
    addEnterKeyListeners,
    addListener,
    ApplicationClosingOptions,
    ApplicationConfiguration,
    ApplicationRenderOptions,
    createHTMLElement,
    htmlQuery,
    localize,
    localizePath,
    R,
    render,
    waitDialog,
} from "module-helpers";
import { Blueprint, EditTriggerOptions } from ".";
import apps = foundry.applications.api;

class BlueprintApplication extends foundry.applications.api.ApplicationV2<
    ApplicationConfiguration,
    BlueprintRenderOptions
> {
    #blueprint = new Blueprint(this);
    #search: string = "";

    static DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
        window: {
            resizable: false,
            minimizable: false,
            frame: false,
            positioned: false,
        },
        id: "trigger-engine-blueprint",
        classes: ["app", "window-app"],
    };

    #resizeObserver = new ResizeObserver((entries) => {
        const appEvent = entries.find((entry) => entry.target === this.element);
        if (!appEvent) return;

        this.blueprint.resizeAll();
    });

    get blueprint(): Blueprint {
        return this.#blueprint;
    }

    get search(): string {
        return this.#search;
    }

    set search(value) {
        const search = value.trim();
        if (search === this.#search) return;

        this.#search = search;
        this.#filterTriggers();
    }

    async close(options: ApplicationClosingOptions = {}) {
        options.animate = false;
        this.#resizeObserver.disconnect();

        return super.close(options);
    }

    _onFirstRender(context: object, options: BlueprintRenderOptions) {
        this.bringToFront();

        // we wait one frame before initializing the canvas
        requestAnimationFrame(() => {
            this.blueprint._initialize();
        });

        this._createContextMenus();
        this.#resizeObserver.observe(this.element);
    }

    protected _onClose() {
        this.blueprint.destroy();
    }

    protected _configureRenderOptions(options: BlueprintRenderOptions): void {
        super._configureRenderOptions(options);

        options.hasTrigger = !!this.blueprint.trigger;
    }

    async _prepareContext(options: BlueprintRenderOptions): Promise<BlueprintContext> {
        if (options.hasTrigger) {
            this.#search = "";
            return {} satisfies TriggerContext;
        }

        const groups: TriggersGroup[] = R.pipe(
            this.blueprint.triggers,
            R.groupBy(R.prop("folder")),
            R.entries(),
            R.sortBy(([folder]) => folder),
            R.map(([folder, triggers]): TriggersGroup => {
                return { folder, triggers };
            })
        );

        // we move the folderless group at the end
        if (groups.length > 1 && groups[0].folder === "") {
            groups.push(groups.shift()!);
        }

        return {
            groups,
            search: this.#search,
        } satisfies TriggersContext;
    }

    protected _renderHTML(
        context: BlueprintContext,
        options: BlueprintRenderOptions
    ): Promise<string> {
        const key = options.hasTrigger ? "trigger" : "triggers";
        return render(`blueprint.${key}`, context);
    }

    protected _replaceHTML(
        result: string,
        content: HTMLElement,
        options: BlueprintRenderOptions
    ): void {
        const ui = htmlQuery(content, ":scope > .ui");

        if (ui) {
            ui.innerHTML = result;
        } else {
            const wrapper = createHTMLElement("div", { classes: ["ui"], content: result });
            content.appendChild(wrapper);
        }

        if (!options.hasTrigger && this.search !== "") {
            this.#filterTriggers();
        }

        this.#activateListeners(content);
    }

    protected _onClickAction(event: PointerEvent, target: HTMLElement) {
        const action = target.dataset.action as EventAction;

        switch (action) {
            case "back-to-menu": {
                return (this.blueprint.trigger = null);
            }

            case "clear-search": {
                this.search = "";
                return;
            }

            case "close-window": {
                return;
            }

            case "export-triggers": {
                return;
            }

            case "import-triggers": {
                return;
            }

            case "create-trigger": {
                const folder = target.dataset.folder;
                return this.#createTrigger(folder);
            }
        }
    }

    _createContextMenus() {
        this._createContextMenu(this._getTriggerContextOptions, ".sidebar.triggers .trigger");
    }

    _getTriggerContextOptions(): ContextMenuEntry[] {
        return [
            {
                icon: "",
                name: localizePath("blueprint.trigger.edit"),
                callback: (el) => {
                    console.log(el.dataset.triggerId);
                },
            },
        ];
    }

    #filterTriggers() {
        const html = this.element;
        const search = this.search.toLowerCase();
        const triggers = html.querySelectorAll<HTMLElement>(".sidebar.triggers .trigger");

        for (const el of triggers) {
            const name = el.dataset.triggerName;
            el.classList.toggle("hidden", !!name && !name.toLowerCase().includes(search));
        }
    }

    #activateListeners(html: HTMLElement) {
        addEnterKeyListeners(html, "text");

        addListener(html, `input[name="search"]`, "input", (el: HTMLInputElement) => {
            this.search = el.value;
        });
    }

    async #createTrigger(folder?: string, trigger?: Trigger) {
        const isEdit = !!trigger;

        const result = await waitDialog<EditTriggerOptions>({
            classes: ["trigger-engine-edit-trigger"],
            content: await render("edit-trigger", {
                description: trigger?.description ?? "",
                enrichedDescription: (await trigger?.enrichedDescription) ?? "",
                folder: trigger?.folder ?? folder ?? "",
                name: trigger?.name ?? "",
                placeholder: trigger?.label ?? "",
            }),
            i18n: "edit-trigger",
            skipAnimate: true,
            minWidth: "700px",
            title: localize(isEdit ? "" : "blueprint.triggers.create"),
            yes: {
                label: localize("edit-trigger.yes", isEdit ? "edit" : "create"),
            },
        });

        if (!result) return;

        this.blueprint.createTrigger(result);
    }
}

type EventAction =
    | "back-to-menu"
    | "clear-search"
    | "close-window"
    | "export-triggers"
    | "import-triggers"
    | "create-trigger";

type BlueprintContext = TriggersContext | TriggerContext;

type TriggerContext = {};

type TriggersContext = {
    groups: TriggersGroup[];
    search: string;
};

type TriggersGroup = {
    folder: string;
    triggers: Trigger[];
};

type BlueprintRenderOptions = ApplicationRenderOptions & {
    hasTrigger: boolean;
};

export { BlueprintApplication };
