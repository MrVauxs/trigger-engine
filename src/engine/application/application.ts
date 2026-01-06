import {
    _StartTriggerNode,
    BuiltInApplication,
    createCollection,
    createConvertorKey,
    ENTRY_GATE_TYPE,
    EntryConvertor,
    EXIT_GATE_TYPE,
    GATE_CATEGORY,
    getBuiltins,
    GETTER_VARIABLE_TYPE,
    instantiateHook,
    NodeEntry,
    OpenTrigger,
    Trigger,
    TriggerApplicationCollection,
    TriggerApplicationCollections,
    TriggerData,
    TriggerDataInput,
    TriggerGateEntry,
    TriggerGateExit,
    TriggerHookWrapper,
    TriggerNode,
    TriggerVariableGetter,
    VARIABLE_CATEGORY,
} from "engine";
import { includesAny, joinStr, LocalizeArgs, LocalizeData, MODULE, R } from "module-helpers";
import { BlueprintApplication } from "triggers-menu";
import utils = foundry.utils;

const APPLICATION_MODES = ["setting", "free"] as const;
const FORBIDDEN_NODE_CATEGORIES = [GATE_CATEGORY, VARIABLE_CATEGORY];
const FORBIDDEN_NODE_TYPE = [EXIT_GATE_TYPE, ENTRY_GATE_TYPE, GETTER_VARIABLE_TYPE];

class TriggerApplication {
    static #instances: Collection<TriggerApplication> = new Collection();

    #applicationId: string;
    #applicationKey: string;
    #convertors: Collection<EntryConvertor>;
    #entries: Collection<typeof NodeEntry>;
    #events: Collection<typeof TriggerNode>;
    #hooks: { hook: TriggerHookWrapper; enabled: boolean }[];
    #mode: TriggerApplicationMode;
    #moduleId: string;
    #nodes: Collection<typeof TriggerNode>;
    #triggerEvents: Record<string, { eventId: string; data: TriggerData }[]> = {};

    constructor(moduleId: string, applicationId: string, options: TriggerApplicationOptions = {}) {
        this.#mode = R.isIncludedIn(options.mode, APPLICATION_MODES) ? options.mode : "setting";
        this.#moduleId = moduleId;
        this.#applicationId = applicationId;
        this.#applicationKey = `${moduleId}:${applicationId}`;

        if (R.isArray(options.nodes)) {
            options.nodes = options.nodes.filter((node) => {
                return (
                    !R.isIncludedIn(node.category, FORBIDDEN_NODE_CATEGORIES) &&
                    !R.isIncludedIn(node.type, FORBIDDEN_NODE_TYPE)
                );
            });
        }

        this.#convertors = createCollection(options, "convertors");
        this.#entries = createCollection(options, "entries");
        this.#nodes = createCollection(options, "nodes");

        // hooks
        this.#hooks = R.pipe(
            [
                ...(options.hooks ?? []), //
                ...getBuiltins(options, "hooks").map(([_type, hook]) => hook),
            ],
            R.map((HookCls) => {
                try {
                    const hook = instantiateHook(this, HookCls);
                    return { enabled: false, hook };
                } catch (error: any) {}
            }),
            R.filter(R.isTruthy),
        );

        // add mandatory stuff
        this.#nodes.set(ENTRY_GATE_TYPE, TriggerGateEntry);
        this.#nodes.set(EXIT_GATE_TYPE, TriggerGateExit);
        this.#nodes.set(GETTER_VARIABLE_TYPE, TriggerVariableGetter);

        // events
        this.#events = new Collection(
            R.map(
                this.#nodes.filter((node) => node.isEvent),
                (node) => [node.type, node] as const,
            ),
        );

        // if no event in the application, we had a default one
        if (!this.#events.size) {
            this.#events.set(_StartTriggerNode.type, _StartTriggerNode as typeof TriggerNode);
            this.#nodes.set(_StartTriggerNode.type, _StartTriggerNode as typeof TriggerNode);
        }

        // setup settings
        if (this.isSettingApplication) {
            this.#setupSettings(options.setting);
        }
    }

    static getApplicationKey(moduleId: string, applicationId: string): string | undefined {
        if (
            !R.isString(moduleId) || //
            !R.isString(applicationId) ||
            !game.modules.get(moduleId)?.active
        )
            return;

        return `${moduleId}:${applicationId}`;
    }

    static register(moduleId: string, applicationId: string, options?: TriggerApplicationOptions) {
        const applicationKey = this.getApplicationKey(moduleId, applicationId);
        if (!applicationKey || this.#instances.has(applicationKey)) return;

        const app = new TriggerApplication(moduleId, applicationId, options);
        this.#instances.set(applicationKey, app);
    }

    static getApplication(moduleId: string, applicationId: string): TriggerApplication | undefined {
        const applicationKey = this.getApplicationKey(moduleId, applicationId);
        return applicationKey ? this.#instances.get(`${moduleId}:${applicationId}`) : undefined;
    }

    static async openBlueprintMenu(
        moduleId: string,
        applicationId: string,
        source?: TriggerDataInput,
    ): Promise<BlueprintApplication | undefined> {
        const app = this.getApplication(moduleId, applicationId);
        return app?.openMenu(source);
    }

    static prepareApplications() {
        for (const application of this.#instances) {
            application.prepare();
        }
    }

    get mode(): TriggerApplicationMode {
        return this.#mode;
    }

    get isSettingApplication(): boolean {
        return this.mode === "setting";
    }

    get isFreeApplication(): boolean {
        return this.mode === "free";
    }

    get applicationId(): string {
        return this.#applicationId;
    }

    get applicationKey(): string {
        return this.#applicationKey;
    }

    get moduleId(): string {
        return this.#moduleId;
    }

    get settingMenuKey(): string {
        return `${this.applicationId}-menu`;
    }

    get settingKey(): string {
        return `${this.applicationId}-triggers`;
    }

    get localizePath(): string {
        return `${this.moduleId}.${this.applicationId}`;
    }

    get entries(): Collection<typeof NodeEntry> {
        return this.#entries;
    }

    get nodes(): Collection<typeof TriggerNode> {
        return this.#nodes;
    }

    get events(): Collection<typeof TriggerNode> {
        return this.#events;
    }

    get hasMultipleEvents(): boolean {
        return this.events.size > 1;
    }

    prepare() {
        const setting = this.getTriggersSetting();
        if (!setting) return;

        const { enabled, sources } = setting;
        const triggers: TriggerData[] = R.pipe(
            sources,
            R.map((source) => {
                if (!R.isObjectType(source) || !R.isIncludedIn(source.id, enabled)) return;
                try {
                    const trigger = this.createTrigger(source, false);
                    return trigger?.test() && trigger.data;
                } catch (error: any) {}
            }),
            R.filter(R.isTruthy),
            // we sort them by priority
            R.sortBy([(trigger) => trigger.priority, "desc"]),
        );

        this.#triggerEvents = {};
        const events: string[] = [];
        const otherNodes: string[] = [];

        for (const trigger of triggers) {
            for (const node of trigger.nodes) {
                if (this.events.has(node.type)) {
                    this.#triggerEvents[node.type] ??= [];
                    this.#triggerEvents[node.type].push({
                        data: trigger,
                        eventId: node.id,
                    });
                    events.push(node.type);
                } else {
                    otherNodes.push(node.type);
                }
            }
        }

        MODULE.group(this.applicationKey);
        MODULE.debug("PREPARE HOOKS:");
        for (const hookData of this.#hooks) {
            const hook = hookData.hook;
            const wantedEvents = hook.events;
            const wantedOtherNodes = hook.otherNodes;
            const hookName = hook.name;

            // previously enabled hooks are disabled
            if (hookData.enabled) {
                hook._disable();
                hookData.enabled = false;
            }

            if (R.isArray(wantedEvents) && includesAny(events, wantedEvents)) {
                hook._enable();
                hookData.enabled = true;
                MODULE.debug("[enabled]", hookName);
            } else if (R.isArray(wantedOtherNodes) && includesAny(otherNodes, wantedOtherNodes)) {
                hook._listen();
                hookData.enabled = true;
                MODULE.debug("[listening]", hookName);
            } else {
                MODULE.debug("[disabled]", hookName);
            }
        }
        MODULE.groupEnd();
    }

    async executeEvent(event: string, args?: unknown) {
        const triggers = this.#triggerEvents[event];
        if (!triggers?.length) return;

        const options = R.isObjectType(args) ? args : undefined;

        for (const { data, eventId } of triggers) {
            try {
                const trigger = new Trigger(this, data);
                const node = trigger.getNode(eventId);
                if (!node) continue;

                MODULE.debug("Execute Trigger", trigger);

                // we clone the options to avoid miss-handling downstream
                const clonedOptions = foundry.utils.deepClone(options);
                await node._execute(clonedOptions);
            } catch (error: any) {
                const id = `${this.applicationKey}:${data.id}:${eventId}`;
                MODULE.error(`an error occurred while executing the event: ${id}`, error);
            }
        }
    }

    localize(...args: LocalizeArgs): string | undefined {
        const data = R.isObjectType(args.at(-1)) ? (args.pop() as LocalizeData) : undefined;

        for (const applicationPath of [this.localizePath, BuiltInApplication.localizePath]) {
            const path = joinStr(".", applicationPath, ...args);
            if (!game.i18n.has(path, true)) continue;
            return R.isObjectType(data) ? game.i18n.format(path, data) : game.i18n.localize(path);
        }
    }

    async openMenu(arg?: TriggerDataInput): Promise<BlueprintApplication | undefined> {
        if (this instanceof BuiltInApplication) return;

        const menuId = BlueprintApplication.APPLICATION_ID;
        const exist = foundry.applications.instances.get(menuId) as Maybe<BlueprintApplication>;

        if (exist?.application === this && (!arg || this.isSettingApplication)) {
            return exist.expandWindow();
        } else {
            await exist?.close();
        }

        const MenuCls = this.isFreeApplication ? this.#getFreeApplication(arg) : this.#getSettingApplication();

        if (MenuCls) {
            return new MenuCls().render(true);
        }
    }

    createTrigger(source: TriggerDataInput, open: true): OpenTrigger | null;
    createTrigger(source: TriggerDataInput, open: false): Trigger | null;
    createTrigger(source: TriggerDataInput, open: boolean): OpenTrigger | Trigger | null {
        try {
            const data = new TriggerData(source);
            return open ? new OpenTrigger(this, data) : new Trigger(this, data);
        } catch (error: any) {
            MODULE.error(`an error concurred while trying to create a Trigger.`, error);
            return null;
        }
    }

    getConvertor(output: string, input: string): EntryConvertor | undefined {
        const key = createConvertorKey(output, input);
        return this.#convertors.get(key);
    }

    getTriggersSetting(): TriggersSetting | undefined {
        if (!this.isSettingApplication) return;

        const setting = game.settings.get<Partial<TriggersSetting>>(this.moduleId, this.settingKey);

        return {
            enabled: setting.enabled?.slice() ?? [],
            sources: utils.deepClone(setting?.sources ?? []),
        };
    }

    #getSettingApplication(): typeof BlueprintApplication | undefined {
        const menuKey = `${this.moduleId}.${this.settingMenuKey}`;
        return game.settings.menus.get(menuKey)?.type as typeof BlueprintApplication;
    }

    #getFreeApplication(source: unknown): typeof BlueprintApplication | null {
        const self = this;
        const test = this.createTrigger(R.isPlainObject(source) ? source : {}, true);
        if (!test || test.invalid) return null;

        return class FreeBlueprintApplication extends BlueprintApplication {
            get application() {
                return self;
            }

            getTriggersSetting(): TriggersSetting {
                return {
                    enabled: [test.id],
                    sources: [test.toObject()],
                };
            }
        };
    }

    #setupSettings({ hint, icon, label, name }: ApplicationMenuOptions = {}) {
        const self = this;
        const moduleId = this.moduleId;
        const applicationId = this.applicationId;
        const settingKey = this.settingKey;

        game.settings.register(moduleId, settingKey, {
            type: Object,
            default: {},
            scope: "world",
            config: false,
            name: settingKey,
            onChange: () => {
                TriggerApplication.prepareApplications();
            },
        });

        class SettingBlueprintApplication extends BlueprintApplication {
            get application(): TriggerApplication {
                return self;
            }

            getTriggersSetting(): TriggersSetting {
                return self.getTriggersSetting()!;
            }
        }

        const settingPath = (...path: string[]): string => {
            return `${moduleId}.${applicationId}.setting.${path.join(".")}`;
        };

        game.settings.registerMenu(moduleId, this.settingMenuKey, {
            name: name ?? settingPath("name"),
            label: label ?? settingPath("label"),
            hint: hint ?? settingPath("hint"),
            icon: icon ?? "fas fa-cogs",
            restricted: true,
            type: SettingBlueprintApplication,
        });
    }
}

type ApplicationParentType = "setting" | "document";

type TriggerApplicationOptions = TriggerApplicationCollections & {
    builtins?: BuiltInOptions | true;
    mode?: TriggerApplicationMode;
    setting?: ApplicationMenuOptions;
};

type BuiltInOptions = {
    [k in TriggerApplicationCollection]?: true | (typeof BuiltInApplication)[k][number][0][];
};

type ApplicationMenuOptions = {
    hint?: string;
    icon?: string;
    label?: string;
    name?: string;
};

type TriggersSetting = {
    enabled: string[];
    sources: TriggerDataInput[];
};

type TriggerApplicationMode = (typeof APPLICATION_MODES)[number] | "builtin";

export { TriggerApplication };
export type { ApplicationParentType, TriggerApplicationOptions, TriggersSetting };
