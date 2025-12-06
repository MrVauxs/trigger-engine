import {
    CreateNodeData,
    isBuiltInNode,
    localizeNodeProperty,
    localizeNodeTag,
    NodeEntry,
    TriggerApplication,
    TriggerNode,
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
import { filterElements } from ".";

class BlueprintNodesMenu extends foundry.applications.api.ApplicationV2 {
    #application: TriggerApplication;
    #entry: NodeEntry | undefined;
    #tagsInput: ExtendedMultiSelectElement | null = null;
    #resolve: BlueprintNodesMenuResolve;
    #searchInput: ExtendedTextInputElement | null = null;

    static DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
        classes: ["application"],
        id: "trigger-engine-nodes-menu",
        window: {
            frame: false,
        },
    };

    constructor(
        application: TriggerApplication,
        resolve: BlueprintNodesMenuResolve,
        entry: NodeEntry | undefined,
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
        entry?: NodeEntry
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
        this.#resolve(null);
    }

    async _prepareContext(options: ApplicationRenderOptions): Promise<NodesMenuContext> {
        const allNodes = this.application.nodes.allEntries;
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

        // TODO filter by entry if provided

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
                        builtin: isBuiltInNode(node),
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
        html.addEventListener("pointerdown", (event) => {
            if (event.target !== this.element) return;
            this.close();
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
    builtin: boolean;
    tags: string[];
    title: string;
    type: string;
};

type BlueprintNodesMenuResolve = (value: CreateNodeData | null) => void;

export { BlueprintNodesMenu };
