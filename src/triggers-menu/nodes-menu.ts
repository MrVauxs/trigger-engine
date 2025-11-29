import { NodeEntry, TriggerApplication, TriggerNode } from "engine";
import {
    ApplicationClosingOptions,
    ApplicationConfiguration,
    ApplicationRenderOptions,
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

    static async wait(
        application: TriggerApplication,
        entry?: NodeEntry
    ): Promise<BlueprintNodesMenuResult | null> {
        return new Promise((resolve: BlueprintNodesMenuResolve, entry) => {
            new BlueprintNodesMenu(application, resolve, entry).render(true);
        });
    }

    get key(): string {
        return "nodes-menu";
    }

    get application(): TriggerApplication {
        return this.#application;
    }

    close(options: ApplicationClosingOptions = {}): Promise<this> {
        options.animate = false;
        return super.close(options);
    }

    protected _onClose(options: ApplicationClosingOptions): void {
        this.#resolve(null);
    }

    async _prepareContext(options: ApplicationRenderOptions): Promise<NodesMenuContext> {
        const allNodes = this.application.nodesContents;
        const [events, nodes] = R.partition(allNodes, (node) => node.isEvent);
        // TODO variables & gates

        const tags: RequiredSelectOptions = [];

        const groups: NodesGroup[] = R.filter(
            [
                ...this.#prepareNodesGroups(nodes, "node", tags), //
            ],
            R.isTruthy
        );

        const eventsGroups = this.#prepareNodesGroups(events, "event", tags);

        return {
            events: eventsGroups.length
                ? eventsGroups
                : [{ label: this.localize("category.event"), nodes: [], value: "" }],
            groups,
            tags: R.pipe(tags, R.uniqueBy(R.prop("value")), R.sortBy(R.prop("label"))),
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

    #prepareNodesGroups(
        nodes: (typeof TriggerNode)[],
        empty: string,
        tags: RequiredSelectOptions
    ): NodesGroup[] {
        return R.pipe(
            nodes,
            R.groupBy((node) => node.category.trim() || empty),
            R.entries(),
            R.map(([category, nodes]): NodesGroup => {
                const value = category === empty ? "" : category;

                return {
                    label: value
                        ? this.application.localizeNodeProperty(nodes[0], "category")
                        : this.localize("category", category),
                    nodes: nodes.map((node): PreparedNode => this.#prepareNode(node, tags)),
                    value,
                };
            }),
            R.sortBy(R.prop("label"))
        );
    }

    #prepareNode(node: typeof TriggerNode, tags: RequiredSelectOptions): PreparedNode {
        const category = node.category;
        const isEvent = node.isEvent;

        const nodeTags: RequiredSelectOptions = R.pipe(
            [
                ...node.tags.map((tag): Required<SelectOption> => {
                    return {
                        value: tag,
                        label: this.application.localizeNodeTag(tag),
                    };
                }),
                category && {
                    value: category,
                    label: this.application.localizeNodeProperty(node, "category"),
                },
                isEvent && {
                    value: "event",
                    label: this.localize("event"),
                },
                // TODO gates & variables
            ],
            R.filter(R.isTruthy)
        );

        tags.push(...nodeTags);

        return {
            tags: nodeTags.map((tag) => tag.value),
            title: this.application.localizeNodeProperty(node, "type"),
        };
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
    title: string;
    tags: string[];
};

type BlueprintNodesMenuResolve = (value: BlueprintNodesMenuResult | null) => void;

type BlueprintNodesMenuResult = {};

export { BlueprintNodesMenu };
