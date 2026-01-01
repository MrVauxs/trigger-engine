import {
    ConnectionId,
    isGateEntryNode,
    isGateExitNode,
    OpenTrigger,
    TriggerApplication,
    TriggerDataInput,
    TriggerVariable,
    UpdateTriggerData,
} from "engine";
import {
    addEnterKeyListeners,
    addListener,
    ApplicationClosingOptions,
    ApplicationConfiguration,
    ApplicationRenderOptions,
    confirmDialog,
    createHTMLElement,
    ExtendedMultiSelectElement,
    ExtendedTextInputElement,
    htmlClosest,
    htmlQuery,
    includesAll,
    includesAny,
    info,
    localize,
    localizePath,
    MultiSelectTagsMode,
    R,
    registerCustomElements,
    render,
    waitDialog,
} from "module-helpers";
import { Blueprint, BlueprintEntry, BlueprintNode } from ".";
import apps = foundry.applications.api;

class BlueprintApplication extends apps.ApplicationV2<
    ApplicationConfiguration,
    BlueprintRenderOptions
> {
    #blueprint: Blueprint = new Blueprint(this);
    #search: string = "";
    #tags: string[] = [];
    #tagsMode: MultiSelectTagsMode = "and";

    static APPLICATION_ID = "trigger-engine-blueprint";

    static DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
        classes: ["app", "themed", "theme-dark", "window-app"],
        id: BlueprintApplication.APPLICATION_ID,
        window: {
            resizable: false,
            minimizable: false,
            frame: false,
            positioned: false,
        },
    };

    #resizeObserver = new ResizeObserver((entries) => {
        const appEvent = entries.find((entry) => entry.target === this.element);
        if (!appEvent) return;

        this.blueprint.resizeAll();
    });

    get blueprint(): Blueprint {
        return this.#blueprint;
    }

    get trigger(): OpenTrigger | undefined {
        return this.blueprint.trigger;
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

    get tagsMode(): MultiSelectTagsMode {
        return this.#tagsMode;
    }

    set tagsMode(value) {
        this.#tagsMode = value;
        this.#filterTriggers();
    }

    get tags(): string[] {
        return this.#tags;
    }

    set tags(value) {
        this.#tags = value;
        this.#filterTriggers();
    }

    async close(options: ApplicationClosingOptions = {}) {
        options.animate = false;
        this.#resizeObserver.disconnect();

        return super.close(options);
    }

    toggleUIEnabled(inert: boolean) {
        htmlQuery(this.element, ".ui")?.toggleAttribute("inert", inert);
    }

    collapseWindow(): this {
        this.element.classList.add("collapsed");
        return this;
    }

    expandWindow(): this {
        this.element.classList.remove("collapsed");
        this.bringToFront();
        return this;
    }

    _onFirstRender(context: object, options: BlueprintRenderOptions) {
        this.bringToFront();

        // we wait one frame before initializing the canvas
        requestAnimationFrame(() => {
            const element = this.element;

            this.blueprint.resizeTo = element;
            element.prepend(this.blueprint.view);
        });

        this.#createContextMenus();
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
        return options.trigger
            ? this.#prepareTriggerContext(options.trigger)
            : this.#prepareTriggersContext(options);
    }

    async _preFirstRender(
        context: Record<string, unknown>,
        options: BlueprintRenderOptions
    ): Promise<void> {
        registerCustomElements("extended-multi-select", "extended-text-input");
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
            const wrapper = createHTMLElement("div", {
                classes: ["ui"],
                content: result,
                dataset: { tooltipClass: "pf2e", tooltipDirection: "UP" },
            });

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
            case "back-menu": {
                return (this.blueprint.trigger = null);
            }

            case "close-window": {
                return;
            }

            case "collapse-window": {
                return this.collapseWindow();
            }

            case "create-trigger": {
                const folder = target.dataset.folder;
                return this.#editTrigger(folder);
            }

            case "expand-window": {
                return this.expandWindow();
            }

            case "edit-trigger": {
                const trigger = this.blueprint.trigger;
                return trigger && this.#editTrigger(trigger.folder, trigger);
            }

            case "export-data": {
                // if no callback was provided we export the trigger itself
                return;
            }

            case "export-triggers": {
                return;
            }

            case "import-triggers": {
                return;
            }

            case "reset-trigger": {
                return;
            }

            case "save-triggers": {
                return;
            }

            case "select-node": {
                const nodeId = target.dataset.nodeId ?? "";
                return this.blueprint.moveToNode(nodeId, true);
            }

            case "select-trigger": {
                const triggerId = target.dataset.id ?? null;
                return (this.blueprint.trigger = triggerId);
            }

            case "tab-gate": {
                const nodeId = htmlClosest(target, "[data-node-id]")?.dataset.nodeId ?? "";
                const nodes = this.blueprint.nodes.getGateEntries(nodeId);
                return this.#tabNode(nodes);
            }

            case "tab-variable": {
                const id = htmlClosest(target, "[data-id]")?.dataset.id as ConnectionId;
                const nodes = this.blueprint.nodes.getVariables(id);
                return this.#tabNode(nodes);
            }
        }
    }

    #createContextMenus() {
        this._createContextMenu(this.#triggerContextMenu, ".sidebar.triggers .trigger");

        if (this.blueprint.locked) return;

        this._createContextMenu(this.#triggerNodeContextMenu, ".sidebar.trigger .node");
        this._createContextMenu(this.#triggerVariableContextMenu, ".sidebar.trigger .variable");
    }

    #triggerVariableContextMenu(): ContextMenuEntry[] {
        return [
            {
                icon: `<i class="fa-solid fa-pen-to-square"></i>`,
                name: localizePath(`blueprint.variable.edit`),
                callback: (el) => {
                    const id = el.dataset.id as ConnectionId;
                    return this.blueprint.editVariable(id);
                },
            },
            {
                icon: `<i class="fa-solid fa-trash"></i>`,
                name: localizePath("blueprint.variable.delete.title"),
                callback: async (el) => {
                    const id = el.dataset.id as ConnectionId;
                    const confirm = await confirmDialog("blueprint.variable.delete");
                    return confirm && this.blueprint.deleteVariable(id);
                },
            },
        ];
    }

    #triggerNodeContextMenu(): ContextMenuEntry[] {
        return [
            {
                icon: `<i class="fa-solid fa-pen-to-square"></i>`,
                name: localizePath(`blueprint.node.edit`),
                condition: (el) => el.hasAttribute("data-editable"),
                callback: (el) => {
                    const nodeId = el.dataset.nodeId ?? "";
                    const node = this.blueprint.nodes.get(nodeId);
                    return node?.edit();
                },
            },
            {
                icon: `<i class="fa-solid fa-trash"></i>`,
                name: localizePath("blueprint.node.delete.single"),
                callback: async (el) => {
                    const nodeId = el.dataset.nodeId ?? "";
                    const confirm = await confirmDialog("blueprint.node.delete.confirm");
                    return confirm && this.blueprint.nodes.deleteById([nodeId]);
                },
            },
        ];
    }

    #triggerContextMenu(): ContextMenuEntry[] {
        const isLocked = this.blueprint.locked;
        const getTriggerFromElement = (el: HTMLElement): OpenTrigger | null => {
            const triggerId = el.dataset.id;
            return triggerId ? this.blueprint.getTrigger(triggerId) : null;
        };

        return [
            {
                icon: `<i class="fa-solid fa-clipboard"></i>`,
                name: localizePath("blueprint.trigger.copy.label"),
                callback: (el) => {
                    const path = el.dataset.path as string;
                    game.clipboard.copyPlainText(path);
                    return info("blueprint.trigger.copy.notify", { path });
                },
            },
            {
                icon: `<i class="fa-solid fa-pen-to-square"></i>`,
                name: localizePath("blueprint.trigger.edit"),
                condition: !isLocked,
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
                    return source && this.blueprint.addTrigger(source);
                },
            },
            {
                icon: `<i class="fa-solid fa-trash"></i>`,
                name: localizePath("blueprint.trigger.delete.title"),
                condition: !isLocked,
                callback: (el) => {
                    const triggerId = el.dataset.id ?? "";
                    return this.blueprint.deleteTrigger(triggerId);
                },
            },
        ];
    }

    #tabNode(nodes: BlueprintNode[]) {
        const nbNodes = nodes.length;
        if (!nbNodes) return;

        if (this.blueprint.nodes.selected.length !== 1 || nbNodes === 1) {
            return this.blueprint.moveToNode(nodes[0].id, true);
        }

        const currentIndex = nodes.findIndex((node) => node.selected);

        if (currentIndex >= 0) {
            const node = nodes[(currentIndex + 1) % nbNodes];
            this.blueprint.moveToNode(node.id, true);
        } else {
            this.blueprint.moveToNode(nodes[0].id, true);
        }
    }

    #filterTriggers() {
        filterElements(
            this.element.querySelectorAll<HTMLElement>(".sidebar.triggers .trigger"),
            this.search,
            this.tags,
            this.tagsMode
        );
    }

    #prepareTriggerContext(trigger: OpenTrigger): TriggerContext {
        this.#search = "";

        const gates = R.map(
            this.blueprint.nodes.filter((node) => isGateExitNode(node)),
            (node): PreparedGate => {
                const hasEntries = this.blueprint.nodes.some(
                    (other) => isGateEntryNode(other) && other.gateId === node.id
                );
                return { hasEntries, node };
            }
        );

        const variables: PreparedVariable[] = R.pipe(
            this.trigger?.data.variables ?? {},
            R.entries(),
            R.map(([id, variable]): PreparedVariable | undefined => {
                const entry = this.blueprint.nodes.getEntryFromId(id) as BlueprintEntry | undefined;
                if (!entry) return;

                const color = this.application.entries.get(variable.type)?.color;

                return {
                    ...variable,
                    color: new PIXI.Color(color).toHex(),
                    hasNodes: this.blueprint.nodes.some((node) => node.variableId === id),
                    id,
                    isArray: variable.isArray,
                    isCustom: !!entry.schema.hidden || foundry.data.validators.isValidId(entry.key),
                    nodeId: id.split(":")[0],
                };
            }),
            R.filter(R.isTruthy)
        );

        return {
            events: this.blueprint.nodes.filter((node) => node.isEvent),
            gates,
            isFree: this.application.isFreeApplication,
            isLocked: this.blueprint.locked,
            trigger,
            variables,
        };
    }

    #prepareTriggersContext(options: BlueprintRenderOptions): TriggersContext {
        const triggers = this.blueprint.triggers.contents;
        const groups: TriggersGroup[] = R.pipe(
            triggers,
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

        const tags = R.pipe(
            triggers,
            R.flatMap((trigger) => {
                return trigger.tags;
            }),
            R.unique(),
            R.map((tag): Required<SelectOption> => {
                return {
                    label: tag,
                    value: tag,
                };
            }),
            R.unique(),
            R.sortBy(R.identity())
        );

        return {
            groups,
            search: this.#search,
            tags: {
                list: tags,
                mode: this.tagsMode,
                selected: this.tags,
            },
        };
    }

    #activateListeners(html: HTMLElement) {
        addEnterKeyListeners(html, "text");

        addListener(html, `[name="search"]`, "input", (el: ExtendedTextInputElement) => {
            this.search = el.value;
        });

        const multiSelect = htmlQuery<ExtendedMultiSelectElement>(html, `[name="tags"]`);

        if (multiSelect) {
            multiSelect.addEventListener("change", () => {
                this.tags = multiSelect.value;
            });

            multiSelect.addEventListener("mode", () => {
                this.tagsMode = multiSelect.mode;
            });
        }
    }

    async #editTrigger(folder?: string, trigger?: OpenTrigger) {
        const isEdit = !!trigger;

        const result = await waitDialog<UpdateTriggerData>({
            classes: ["trigger-engine-edit-trigger"],
            content: "edit-trigger",
            data: {
                description: trigger?.description ?? "",
                enrichedDescription: (await trigger?.enrichedDescription) ?? "",
                folder: trigger?.folder ?? folder ?? "",
                name: trigger?.name ?? "",
                placeholder: trigger?.label ?? "",
                tags: trigger?.tags,
            },
            i18n: "edit-trigger",
            skipAnimate: true,
            minWidth: "700px",
            title: localize(isEdit ? "blueprint.trigger.edit" : "blueprint.triggers.create"),
            yes: {
                label: localize("edit-trigger.yes", isEdit ? "edit" : "create"),
            },
        });

        if (!result) return;

        if (isEdit) {
            trigger.update(result);
            this.render();
        } else {
            this.blueprint.addTrigger(result);
        }
    }
}

interface BlueprintApplication {
    get application(): TriggerApplication;
    getTriggersSources(): TriggerDataInput[];
}

function filterElements(
    elements: NodeListOf<HTMLElement>,
    search: string | undefined,
    tags: string[] | undefined = [],
    tagsMode: MultiSelectTagsMode = "and"
) {
    const searchTerm = search?.toLocaleLowerCase();
    const tagsFn = tagsMode === "and" ? includesAll : includesAny;

    const validateSearch = searchTerm?.length
        ? (name: string | undefined) => name?.toLowerCase().includes(searchTerm)
        : () => true;

    const validateTags = tags?.length
        ? (elementTags: string | undefined): boolean => tagsFn(elementTags?.split(",") ?? [], tags)
        : () => true;

    for (const el of elements) {
        const valid = validateSearch(el.dataset.name) && validateTags(el.dataset.tags);
        el.classList.toggle("hidden", !valid);
    }
}

type EventAction =
    | "back-menu"
    | "close-window"
    | "collapse-window"
    | "create-trigger"
    | "edit-trigger"
    | "expand-window"
    | "export-data"
    | "export-triggers"
    | "import-triggers"
    | "reset-trigger"
    | "save-triggers"
    | "select-node"
    | "select-trigger"
    | "tab-gate"
    | "tab-variable";

type BlueprintContext = TriggersContext | TriggerContext;

type TriggerContext = {
    events: BlueprintNode[];
    gates: PreparedGate[];
    isFree: boolean;
    isLocked: boolean;
    trigger: OpenTrigger;
    variables: PreparedVariable[];
};

type PreparedGate = {
    hasEntries: boolean;
    node: BlueprintNode;
};

type PreparedVariable = TriggerVariable & {
    color: string;
    hasNodes: boolean;
    id: ConnectionId;
    isArray: boolean;
    isCustom: boolean;
    nodeId: string;
};

type TriggersContext = {
    groups: TriggersGroup[];
    search: string;
    tags: {
        list: RequiredSelectOptions;
        mode: MultiSelectTagsMode;
        selected: string[];
    };
};

type TriggersGroup = {
    folder: string;
    triggers: OpenTrigger[];
};

type BlueprintRenderOptions = ApplicationRenderOptions & {
    trigger: OpenTrigger | undefined;
};

export { BlueprintApplication, filterElements };
