import {
    getCategoryLabel,
    getEventLabel,
    NodeEntry,
    TriggerApplication,
    TriggerNode,
} from "engine";
import {
    addListener,
    ApplicationClosingOptions,
    ApplicationConfiguration,
    ApplicationRenderOptions,
    localize,
    R,
    render,
} from "module-helpers";

class BlueprintNodesMenu extends foundry.applications.api.ApplicationV2 {
    #application: TriggerApplication;
    #entry: NodeEntry | undefined;
    #resolve: BlueprintNodesMenuResolve;

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
        const allNodes = this.application.nodes.contents;
        const [events, nodes] = R.partition(allNodes, (node) => node.isEvent);
        // TODO variables & gates

        const groups: NodesGroup[] = R.filter(
            [
                ...this.#prepareNodesGroups(nodes, "node"), //
            ],
            R.isTruthy
        );

        const eventsGroups = this.#prepareNodesGroups(events, "event");

        return {
            events: eventsGroups.length
                ? eventsGroups
                : [{ label: localize("category.event.plural"), nodes: [], value: "" }],
            groups,
            tags: this.#prepareTags(nodes),
        };
    }

    _renderHTML(context: NodesMenuContext, options: ApplicationRenderOptions): Promise<string> {
        return render("nodes-menu", context);
    }

    _replaceHTML(result: string, content: HTMLElement, options: ApplicationRenderOptions): void {
        content.innerHTML = result;
        this.#addEventListeners(content);
    }

    _onFirstRender(context: object, options: ApplicationRenderOptions) {
        this.element.addEventListener("blur", () => {
            console.log("blur");
            this.close();
        });
    }

    #prepareNodesGroups(nodes: (typeof TriggerNode)[], empty: string): NodesGroup[] {
        return R.pipe(
            nodes,
            R.groupBy((node) => node.category.trim() || empty),
            R.entries(),
            R.map(([category, nodes]): NodesGroup => {
                const value = category === empty ? "" : category;

                return {
                    label: value
                        ? this.#getCategoryLabel(nodes[0])
                        : localize("category", category, "plural"),
                    nodes,
                    value,
                };
            }),
            R.sortBy(R.prop("label"))
        );
    }

    #prepareTags(nodes: (typeof TriggerNode)[]): RequiredSelectOptions {
        return R.pipe(
            nodes,
            R.flatMap((node): RequiredSelectOptions => {
                const isEvent = node.isEvent;
                const category = node.category;

                return [
                    ...node.tags.map((tag): Required<SelectOption> => {
                        return {
                            value: tag,
                            label: this.application.localize("tag", tag, "title") ?? tag,
                        };
                    }),
                    category && {
                        value: category,
                        label: this.#getCategoryLabel(node),
                    },
                    isEvent && {
                        value: "event",
                        label: getEventLabel(),
                    },
                    // TODO gates & variables
                ].filter(R.isTruthy);
            }),
            R.uniqueBy(R.prop("value"))
        );
    }

    #addEventListeners(html: HTMLElement) {
        html.addEventListener("pointerdown", (event) => {
            if (event.target !== this.element) return;
            this.close();
        });

        addListener(html, `input[name="search"]`, "input", (el) => {});
    }

    #getCategoryLabel(node: { category: string; isEvent: boolean }) {
        return getCategoryLabel(this.application.localize.bind(this.application), node);
    }
}

type NodesMenuContext = {
    events: NodesGroup[];
    groups: NodesGroup[];
    tags: RequiredSelectOptions;
};

type NodesGroup = {
    label: string;
    nodes: (typeof TriggerNode)[];
    value: string;
};

type BlueprintNodesMenuResolve = (value: BlueprintNodesMenuResult | null) => void;

type BlueprintNodesMenuResult = {};

export { BlueprintNodesMenu };
