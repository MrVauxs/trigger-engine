import { Trigger, UpdateTriggerData } from "engine";
import {
    addEnterKeyListeners,
    addListener,
    ApplicationClosingOptions,
    ApplicationConfiguration,
    ApplicationRenderOptions,
    createHTMLElement,
    htmlQuery,
    info,
    localize,
    localizePath,
    R,
    render,
    waitDialog,
} from "module-helpers";
import { Blueprint } from ".";
import apps = foundry.applications.api;

abstract class BlueprintApplication extends apps.ApplicationV2<
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
        classes: ["app", "themed", "theme-dark", "window-app"],
    };

    #resizeObserver = new ResizeObserver((entries) => {
        const appEvent = entries.find((entry) => entry.target === this.element);
        if (!appEvent) return;

        this.blueprint.resizeAll();
    });

    abstract get moduleId(): string;
    abstract get applicationId(): string;

    get applicationKey(): string {
        return `${this.moduleId}:${this.applicationId}`;
    }

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

        options.trigger = this.blueprint.trigger;
    }

    async _prepareContext(options: BlueprintRenderOptions): Promise<BlueprintContext> {
        if (options.trigger) {
            this.#search = "";
            return {
                trigger: options.trigger,
            } satisfies TriggerContext;
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
        const key = options.trigger ? "trigger" : "triggers";
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

        if (!options.trigger && this.search !== "") {
            this.#filterTriggers();
        }

        this.#activateListeners(content);
    }

    protected _onClickAction(event: PointerEvent, target: HTMLElement) {
        if (event.button !== 0) return;

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

            case "create-trigger": {
                const folder = target.dataset.folder;
                return this.#editTrigger(folder);
            }

            case "export-triggers": {
                return;
            }

            case "import-triggers": {
                return;
            }

            case "select-trigger": {
                const triggerId = target.dataset.triggerId ?? null;
                return (this.blueprint.trigger = triggerId);
            }
        }
    }

    _createContextMenus() {
        this._createContextMenu(this._getTriggerContextOptions, ".sidebar.triggers .trigger");
    }

    _getTriggerContextOptions(): ContextMenuEntry[] {
        const getTriggerFromElement = (el: HTMLElement): Trigger | null => {
            const triggerId = el.dataset.triggerId;
            return triggerId ? this.blueprint.getTrigger(triggerId) : null;
        };

        return [
            {
                icon: `<i class="fa-solid fa-clipboard"></i>`,
                name: localizePath("blueprint.trigger.copy.label"),
                callback: (el) => {
                    const path = el.dataset.triggerPath as string;
                    game.clipboard.copyPlainText(path);
                    return info("blueprint.trigger.copy.notify", { path });
                },
            },
            {
                icon: `<i class="fa-solid fa-pen-to-square"></i>`,
                name: localizePath("blueprint.trigger.edit"),
                callback: (el) => {
                    const trigger = getTriggerFromElement(el);
                    return trigger && this.#editTrigger(trigger.folder, trigger);
                },
            },
            {
                icon: `<i class="fa-solid fa-copy"></i>`,
                name: localizePath("blueprint.trigger.duplicate"),
                callback: (el) => {
                    const trigger = getTriggerFromElement(el);
                    const source = trigger?.duplicate();
                    return source && this.blueprint.createTrigger(source);
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

    async #editTrigger(folder?: string, trigger?: Trigger) {
        const isEdit = !!trigger;

        const result = await waitDialog<UpdateTriggerData>({
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

        if (isEdit) {
            this.blueprint.editTrigger(trigger.id, result);
        } else {
            this.blueprint.createTrigger(result);
        }
    }
}

type EventAction =
    | "back-to-menu"
    | "clear-search"
    | "close-window"
    | "create-trigger"
    | "export-triggers"
    | "import-triggers"
    | "select-trigger";

type BlueprintContext = TriggersContext | TriggerContext;

type TriggerContext = {
    trigger: Trigger;
};

type TriggersContext = {
    groups: TriggersGroup[];
    search: string;
};

type TriggersGroup = {
    folder: string;
    triggers: Trigger[];
};

type BlueprintRenderOptions = ApplicationRenderOptions & {
    trigger: Trigger | undefined;
};

export { BlueprintApplication };
