import {
    CreateNodeData,
    getInputsSchemas,
    getOutputsSchemas,
    getOutsSchemas,
    TriggerApplication,
    TriggerNode,
    triggerNodeLocalize,
} from "engine";
import {
    ApplicationClosingOptions,
    ApplicationConfiguration,
    ApplicationRenderOptions,
    datasetToData,
    ExtendedMultiSelectElement,
    ExtendedTextInputElement,
    htmlQuery,
    localize,
    R,
    render,
} from "module-helpers";
import { BaseBlueprintEntry, filterElements, isBlueprintEntry } from ".";

class BlueprintNodesMenu extends foundry.applications.api.ApplicationV2 {
    #abortController = new AbortController();
    #application: TriggerApplication;
    #entry: BaseBlueprintEntry | undefined;
    #tagsInput: ExtendedMultiSelectElement | null = null;
    #resolve: BlueprintNodesMenuResolve;
    #searchInput: ExtendedTextInputElement | null = null;

    static DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
        classes: ["application"],
        id: "trigger-engine-nodes-menu",
        window: {
            frame: false,
            positioned: false,
        },
    };

    constructor(
        application: TriggerApplication,
        resolve: BlueprintNodesMenuResolve,
        entry: BaseBlueprintEntry | undefined,
        options?: DeepPartial<ApplicationConfiguration>
    ) {
        super(options);

        this.#application = application;
        this.#entry = entry;
        this.#resolve = resolve;
    }

    get key(): string {
        return "nodes-menu";
    }

    get application(): TriggerApplication {
        return this.#application;
    }

    static async wait(
        application: TriggerApplication,
        entry?: BaseBlueprintEntry
    ): Promise<CreateNodeData | null> {
        return new Promise((resolve: BlueprintNodesMenuResolve) => {
            new BlueprintNodesMenu(application, resolve, entry).render(true);
        });
    }

    close(options: ApplicationClosingOptions = {}): Promise<this> {
        options.animate = false;
        return super.close(options);
    }

    protected _onClose(options: ApplicationClosingOptions): void {
        this.#abortController.abort();
        this.#resolve(null);
    }

    async _prepareContext(options: ApplicationRenderOptions): Promise<NodesMenuContext> {
        const allNodes = this.#getNodes();
        const [events, nodes] = R.partition(allNodes, (node) => node.isEvent);
        // TODO variables & gates

        const tags: RequiredSelectOptions = R.pipe(
            allNodes,
            R.flatMap((node): Required<SelectOption<string>>[] => {
                return node.tags.map((tag): Required<SelectOption> => {
                    return {
                        label: localizeNodeTag(this.application, node, tag),
                        value: tag,
                    };
                });
            }),
            R.uniqueBy(R.prop("label")),
            R.sortBy(R.prop("label"))
        );

        return {
            events: this.#prepareNodesGroups(events, "event"),
            groups: this.#prepareNodesGroups(nodes, "node"),
            tags,
        };
    }

    _renderHTML(context: NodesMenuContext, options: ApplicationRenderOptions): Promise<string> {
        return render(this.key, context);
    }

    _replaceHTML(result: string, content: HTMLElement, options: ApplicationRenderOptions): void {
        content.innerHTML = result;
        this.#addEventListeners(content);
    }

    localize(...path: string[]): string {
        return localize(this.key, ...path);
    }

    protected _onClickAction(event: PointerEvent, target: HTMLElement) {
        if (event.button !== 0) return;

        const action = target.dataset.action as EventAction;

        switch (action) {
            case "select-node": {
                const data = R.pick(datasetToData(target), ["type", "builtin"]);
                this.#resolve(data);
                return this.close();
            }
        }
    }

    #getNodes(): (typeof TriggerNode)[] {
        const entry = this.#entry;

        let nodes = this.application.nodes.contents;

        if (!entry) {
            return nodes;
        }

        if (entry.isOutput) {
            // events never have inputs so we get rid of them all
            nodes = nodes.filter((node) => !node.isEvent);
        }

        if (!isBlueprintEntry(entry)) {
            return entry.isInput
                ? nodes.filter((node) => getOutsSchemas(node).length)
                : nodes.filter((node) => node.hasIn);
        }

        return nodes.filter((node) => {
            const entries = entry.isInput ? getOutputsSchemas(node) : getInputsSchemas(node);
            return entries.some((other) => other.type === entry.type);
        });
    }

    #prepareNodesGroups(nodes: (typeof TriggerNode)[], empty: string): NodesGroup[] {
        if (!nodes.length) {
            return [{ label: this.localize("category", empty), nodes: [], value: "" }];
        }

        return R.pipe(
            nodes,
            R.groupBy((node) => node.category.trim() || empty),
            R.entries(),
            R.map(([category, Nodes]): NodesGroup => {
                const value = category === empty ? "" : category;

                const label = value
                    ? localizeNodeProperty(this.application, Nodes[0], "category")
                    : this.localize("category", category);

                const nodes = Nodes.map((node): PreparedNode => {
                    return {
                        tags: node.tags,
                        title: localizeNodeProperty(this.application, node, "type"),
                        type: node.type,
                    };
                });

                return {
                    label,
                    nodes,
                    value,
                };
            }),
            R.sortBy(R.prop("label"))
        );
    }

    #addEventListeners(html: HTMLElement) {
        requestAnimationFrame(() => {
            window.addEventListener(
                "click",
                (event) => {
                    if (!(event.target instanceof HTMLElement) || html.contains(event.target))
                        return;
                    this.close();
                },
                { signal: this.#abortController.signal }
            );
        });

        this.#searchInput = htmlQuery<ExtendedTextInputElement>(html, `[name="search"]`);
        this.#searchInput?.addEventListener("input", () => this.#filterNodes());

        this.#tagsInput = htmlQuery<ExtendedMultiSelectElement>(html, `[name="tags"]`);
        this.#tagsInput?.addEventListener("change", () => this.#filterNodes());
        this.#tagsInput?.addEventListener("mode", () => this.#filterNodes());
    }

    #filterNodes() {
        filterElements(
            this.element.querySelectorAll<HTMLElement>(`.nodes .node`),
            this.#searchInput?.value,
            this.#tagsInput?.value,
            this.#tagsInput?.mode
        );
    }
}

function localizeNodeProperty(
    application: TriggerApplication,
    node: typeof TriggerNode,
    property: TriggerNodeStringProperty
): string {
    const path = getNodePropertyLocalizePath(node, property);
    return triggerNodeLocalize(application, node, path) ?? node[property];
}

function getNodePropertyLocalizePath(
    node: typeof TriggerNode,
    property: TriggerNodeStringProperty
): string {
    switch (property) {
        case "category": {
            return `category.${node.category}.title`;
        }

        case "type": {
            return `node.${node.category}.${node.type}.title`;
        }
    }
}

function localizeNodeTag(
    application: TriggerApplication,
    node: typeof TriggerNode,
    tag: string
): string {
    return triggerNodeLocalize(application, node, "tag", tag, "title") ?? tag;
}

type TriggerNodeStringProperty = keyof {
    [P in keyof typeof TriggerNode as (typeof TriggerNode)[P] extends string
        ? P
        : never]: (typeof TriggerNode)[P];
};

type EventAction = "select-node";

type NodesMenuContext = {
    events: NodesGroup[];
    groups: NodesGroup[];
    tags: RequiredSelectOptions;
};

type NodesGroup = {
    label: string;
    nodes: PreparedNode[];
    value: string;
};

type PreparedNode = {
    tags: string[];
    title: string;
    type: string;
};

type BlueprintNodesMenuResolve = (value: CreateNodeData | null) => void;

export { BlueprintNodesMenu };
