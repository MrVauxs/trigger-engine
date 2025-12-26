import {
    BaseEntrySchema,
    BridgeSchema,
    ConnectionId,
    getInputsSchemas,
    getNodeStates,
    getOutputsSchemas,
    getOutsSchemas,
    NodeData,
    NodeDataInput,
    NodeDataOutput,
    OpenTrigger,
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
import {
    BaseBlueprintEntry,
    Blueprint,
    BlueprintEntry,
    EntryId,
    filterElements,
    isBlueprintEntry,
    PreciseEntryCategory,
} from ".";

class BlueprintNodesMenu extends foundry.applications.api.ApplicationV2 {
    #abortController = new AbortController();
    #blueprint: Blueprint;
    #entry: BaseBlueprintEntry | undefined;
    #inClipboard: NodeDataOutput[] = [];
    #position: Point;
    #resolve: BlueprintNodesMenuResolve;
    #searchInput: ExtendedTextInputElement | null = null;
    #tagsInput: ExtendedMultiSelectElement | null = null;

    static DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
        classes: ["application"],
        id: "trigger-engine-nodes-menu",
        window: {
            frame: false,
            positioned: false,
        },
    };

    constructor(
        blueprint: Blueprint,
        position: Point,
        resolve: BlueprintNodesMenuResolve,
        entry: BaseBlueprintEntry | undefined,
        options?: DeepPartial<ApplicationConfiguration>
    ) {
        super(options);

        this.#blueprint = blueprint;
        this.#entry = entry;
        this.#position = position;
        this.#resolve = resolve;
    }

    get key(): string {
        return "nodes-menu";
    }

    get blueprint(): Blueprint {
        return this.#blueprint;
    }

    get application(): TriggerApplication {
        return this.blueprint.application;
    }

    get trigger(): OpenTrigger | undefined {
        return this.blueprint.trigger;
    }

    static async wait(
        blueprint: Blueprint,
        position: Point,
        entry?: BaseBlueprintEntry
    ): Promise<boolean | null> {
        return new Promise((resolve: BlueprintNodesMenuResolve) => {
            new BlueprintNodesMenu(blueprint, position, resolve, entry).render(true);
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
        const [allEvents, nodes] = R.partition(allNodes, (node) => node.isEvent);
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

        const existingEvents = R.pipe(
            this.trigger?.nodes.contents ?? [],
            R.filter((node) => node.isEvent),
            R.map((node) => node.type)
        );

        const events = allEvents.filter((event) => !R.isIncludedIn(event.type, existingEvents));

        this.#inClipboard = await this.#nodesFromClipboard();

        return {
            events: this.#prepareNodesGroups(events, "event"),
            groups: this.#prepareNodesGroups(nodes, "node"),
            inClipboard: this.#inClipboard.length > 0,
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
            case "paste-nodes": {
                return this.#pasteFromClipboard();
            }

            case "select-node": {
                const source = R.pick(datasetToData(target), ["type", "builtin"]);
                return this.#selectNode(source);
            }
        }
    }

    #selectNode(source: NodeDataInput) {
        const trigger = this.trigger;
        if (!trigger) return;

        const OtherCls = this.application.nodes.get(source.type) as typeof TriggerNode;
        if (!OtherCls) return;

        source.position = this.#position;

        let otherIdSuffix: `${PreciseEntryCategory}:${string}` | undefined;

        const entry = this.#entry;
        const nodeStates = getNodeStates(OtherCls) ?? [null];

        const getSchema = <T extends BaseEntrySchema | BridgeSchema>(
            category: "outs" | "inputs" | "outputs",
            callback: (entries: T[]) => T | undefined
        ): T | undefined => {
            let hidden: { state: string | null; schema: T } | undefined;

            const schemaFn =
                category === "outs"
                    ? getOutsSchemas
                    : category === "inputs"
                    ? getInputsSchemas
                    : getOutputsSchemas;

            for (const state of nodeStates) {
                const schemas = schemaFn(OtherCls, { revealed: true, state }) as T[];
                const schema = callback(schemas);

                if (schema) {
                    if ((schema as BaseEntrySchema).hidden) {
                        hidden ??= { schema, state };
                        continue;
                    }

                    if (state) {
                        source.state = state;
                    } else {
                        delete source.state;
                    }

                    return schema;
                }
            }

            if (hidden) {
                if (hidden.state) {
                    source.state = hidden.state;
                } else {
                    delete source.state;
                }

                source.revealed = {
                    [category]: {
                        [hidden.schema.key]: true,
                    },
                };

                return hidden.schema;
            }
        };

        const getEntrySchema = (category: "inputs" | "outputs") => {
            const isArray = !!(entry as BlueprintEntry).isArray;
            const entryType = (entry as BlueprintEntry).type;

            return getSchema<BaseEntrySchema>(category, (schemas) => {
                return schemas.find((schema) => {
                    return schema.type === entryType && isArray === !!schema.isArray;
                });
            });
        };

        if (entry?.isInput) {
            if (isBlueprintEntry(entry)) {
                const otherEntry = getEntrySchema("outputs");
                otherIdSuffix = otherEntry ? `outputs:${otherEntry.key}` : undefined;
            } else {
                const out = getSchema("outs", (schemas) => schemas.at(0))?.key;
                otherIdSuffix = out ? `outs:${out}` : undefined;
            }
        } else if (entry?.isOutput) {
            if (isBlueprintEntry(entry)) {
                const otherEntry = getEntrySchema("inputs");

                if (otherEntry) {
                    otherIdSuffix = `inputs:${otherEntry.key}`;
                    source.inputs = {
                        [otherEntry.key]: {
                            connections: [entry.id as ConnectionId],
                        },
                    };
                }
            } else {
                otherIdSuffix = "ins:in";
                source.ins = {
                    in: {
                        connections: [entry.id as ConnectionId],
                    },
                };
            }
        }

        const newNode = trigger.addNode(source);
        if (!newNode) return;

        const otherId: EntryId | undefined = otherIdSuffix
            ? `${newNode.id}:${otherIdSuffix}`
            : undefined;

        if (entry && otherId) {
            // we do it before creating the node so we don't have to update it
            trigger.addComputedConnections(entry.id, otherId);
        }

        const blueprintNode = this.blueprint.nodes.add(newNode, true);

        if (entry && otherId) {
            this.blueprint.connections.add(entry.id, otherId);

            if (entry.isInput) {
                entry.node.addConnection(entry.preciseCategory, entry.key, otherId);
                entry.node.draw();
            }

            const targetEntry = this.blueprint.nodes.getEntryFromId(otherId);

            if (targetEntry) {
                const { x, y } = this.blueprint.unscalePoint(targetEntry.connectorOffset);
                blueprintNode.setPosition(blueprintNode.x - x, blueprintNode.y - y);
            }
        }

        this.#resolve(true);
        this.close();
    }

    #pasteFromClipboard() {
        const sources = this.#inClipboard;

        if (!sources.length) {
            return this.close();
        }

        const offset: Point = {
            x: this.#position.x - sources[0].position.x,
            y: this.#position.y - sources[0].position.y,
        };

        for (const source of sources) {
            source.position.x += offset.x;
            source.position.y += offset.y;
        }

        this.blueprint.nodes.addFromSources(sources);
        this.close();
    }

    async #nodesFromClipboard(): Promise<NodeDataOutput[]> {
        if (this.#entry) return [];

        try {
            const str = await navigator.clipboard.readText();
            const data = JSON.parse(str);
            if (!R.isArray(data)) return [];

            const nodes: NodeDataOutput[] = [];

            for (const entry of data) {
                const node = new NodeData(entry as NodeDataOutput);
                if (node.invalid) continue;

                nodes.push(node.toObject());
            }

            return nodes;
        } catch (error) {
            return [];
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

        const isArray = !!entry.isArray;

        return nodes.filter((node) => {
            const schemasFn = entry.isInput ? getOutputsSchemas : getInputsSchemas;
            const entries = schemasFn(node, { revealed: true });

            return entries.some((other) => {
                return other.type === entry.type && isArray === !!other.isArray;
            });
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

type EventAction = "paste-nodes" | "select-node";

type NodesMenuContext = {
    events: NodesGroup[];
    groups: NodesGroup[];
    inClipboard: boolean;
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

type BlueprintNodesMenuResolve = (result: boolean | null) => void;

export { BlueprintNodesMenu };
