import {
    _StartEventNode,
    BuiltInApplication,
    createCollection,
    createConvertorKey,
    ENTRY_GATE_TYPE,
    EntryConvertor,
    EXIT_GATE_TYPE,
    GATE_CATEGORY,
    getBuiltins,
    GETTER_VARIABLE_TYPE,
    getTriggerPathData,
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
    TriggerPath,
    TriggerVariableGetter,
    VARIABLE_CATEGORY,
} from "engine";
import { includesAny, joinStr, LocalizeArgs, LocalizeData, MODULE, R } from "module-helpers";
import { ExecuteEventQueryOptions, ExecuteTriggerQueryOptions } from "queries";
import { BlueprintApplication } from "triggers-menu";
import utils = foundry.utils;

const APPLICATION_MODES = ["setting", "free"] as const;
const FORBIDDEN_NODE_CATEGORIES = [GATE_CATEGORY, VARIABLE_CATEGORY];
const FORBIDDEN_NODE_TYPE = [EXIT_GATE_TYPE, ENTRY_GATE_TYPE, GETTER_VARIABLE_TYPE];

class TriggerApplication {
    static #instances: Collection<TriggerApplication> = new Collection();

    #applicationId: string;
    #applicationKey: ApplicationKey;
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
        this.#nodes.set(ENTRY_GATE_TYPE, TriggerGateEntry as any);
        this.#nodes.set(EXIT_GATE_TYPE, TriggerGateExit as any);
        this.#nodes.set(GETTER_VARIABLE_TYPE, TriggerVariableGetter as any);

        // events
        this.#events = new Collection(
            R.map(
                this.#nodes.filter((node) => node.isEvent),
                (node) => [node.type, node] as const,
            ),
        );

        // if no event in the application, we had a default one
        if (!this.#events.size) {
            this.#events.set(_StartEventNode.type, _StartEventNode as typeof TriggerNode);
            this.#nodes.set(_StartEventNode.type, _StartEventNode as typeof TriggerNode);
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

    static async executeEvent(
        userId: string,
        applicationKey: ApplicationKey,
        event: string,
        args: Record<string, any> = {},
    ) {
        const [moduleId, applicationId] = R.split(applicationKey, ":");
        const application = this.getApplication(moduleId, applicationId);
        if (!application) return;

        return application?._executeEvent(userId, event, args);
    }

    static async executeTriggerEvent(
        userId: string,
        triggerPath: TriggerPath,
        event: string,
        args: Record<string, any> = {},
    ) {
        const { applicationId, moduleId, triggerId } = getTriggerPathData(triggerPath);
        const application = this.getApplication(moduleId, applicationId);
        if (!application) return;

        return application?._executeTriggerEvent(userId, triggerId, event, args);
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

    get applicationKey(): ApplicationKey {
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
                } catch (error) {}
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

            const canEnable = !hook.gmOnly || game.user.isGM;

            if (canEnable && R.isArray(wantedEvents) && includesAny(events, wantedEvents)) {
                hook._enable();
                hookData.enabled = true;
                MODULE.debug("[ENABLED]  ", hookName);
            } else if (canEnable && R.isArray(wantedOtherNodes) && includesAny(otherNodes, wantedOtherNodes)) {
                hook._listen();
                hookData.enabled = true;
                MODULE.debug("[LISTENING]", hookName);
            } else {
                MODULE.debug("[DISABLED] ", hookName);
            }
        }
        MODULE.groupEnd();
    }

    convertToEmitable(type: string, value: any): EmitableUserValue | undefined {
        const entry = this.entries.get(type);
        if (!entry) return;

        const convert = (value: unknown) => (entry.isValidType(value) ? entry.toJSON(value) : undefined);
        const converted = R.isArray(value) ? value.map(convert) : convert(value);
        return { type, value: converted };
    }

    convertValuesToEmitable(values: (UserValue | undefined)[]): (EmitableUserValue | undefined)[] {
        return values.map((x) => {
            return x ? this.convertToEmitable(x.type, x.value) : undefined;
        });
    }

    async convertFromEmitable(value: EmitableUserValue | undefined, withType?: boolean): Promise<any> {
        if (!value) return;

        const entry = this.entries.get(value.type);
        if (!entry) return;

        const convertedValue = R.isArray(value.value)
            ? await Promise.all(value.value.map(entry.fromJSON.bind(entry)))
            : await entry.fromJSON(value.value);

        return withType ? { type: value.type, value: convertedValue } : convertedValue;
    }

    async convertValuesFomEmitable(
        values: (EmitableUserValue | undefined)[],
        withType?: boolean,
    ): Promise<(UserValue | undefined)[]> {
        return Promise.all(values.map((value) => this.convertFromEmitable(value, withType)));
    }

    parseUserValue(userValue: UserValue): UserValue | undefined {
        if (!R.isObjectType(userValue) || !R.isString(userValue.type)) return;

        const entry = this.entries.get(userValue.type);
        if (!entry) return;

        const parseValue = (value: any) => {
            const casted = entry.castValue(value);
            return entry.isValidType(casted) ? foundry.utils.deepClone(value) : undefined;
        };

        const value = R.isArray(userValue.value)
            ? R.map(userValue.value, parseValue)
            : (parseValue(userValue.value) ?? entry.default);

        return { type: userValue.type, value };
    }

    parseUserValues(userValues: UserValue[]): (UserValue | undefined)[] {
        return R.isArray(userValues) ? userValues.map((value) => this.parseUserValue(value)) : [];
    }

    async executeEvent(eventName: string, args: Record<string, any>) {
        return await this._executeEvent(game.userId, eventName, args);
    }

    async executeTriggerEvent(triggerId: string, eventName: string, args: Record<string, any>) {
        return await this._executeTriggerEvent(game.userId, triggerId, eventName, args);
    }

    async executeEventAsGM(eventName: string, args: Record<string, any> = {}) {
        const queryArgs: ExecuteEventQueryOptions = {
            _type: "execute-event",
            applicationKey: this.applicationKey,
            args,
            eventName,
            userId: game.userId,
        };

        return await game.users.activeGM?.query(MODULE.path("user-query"), queryArgs);
    }

    async executeTriggerEventAsGM(
        triggerId: string,
        eventName: string,
        args: Record<string, any> = {},
    ): Promise<unknown> {
        const queryArgs: ExecuteTriggerQueryOptions = {
            _type: "execute-trigger",
            args,
            eventName,
            triggerPath: `${this.applicationKey}:${triggerId}`,
            userId: game.userId,
        };

        return game.users.activeGM?.query(MODULE.path("user-query"), queryArgs);
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

    async _executeEvent(userId: string, event: string, args: Record<string, any>) {
        const triggers = this.#triggerEvents[event];
        if (!triggers?.length) return;

        for (const { data, eventId } of triggers) {
            await this.#execute(userId, data, eventId, args);
        }
    }

    async _executeTriggerEvent(userId: string, triggerId: string, event: string, args: Record<string, any>) {
        const trigger = this.#triggerEvents[event]?.find(({ data }) => data.id === triggerId);
        if (!trigger) return;

        const { data, eventId } = trigger;
        await this.#execute(userId, data, eventId, args);
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

    async #execute(userId: string, data: TriggerData, eventId: string, args: Record<string, any>) {
        try {
            const trigger = new Trigger(this, data, userId);
            const node = trigger.getNode(eventId);
            if (!node) return;

            MODULE.debug("Execute Trigger", trigger);

            // we clone the args to avoid miss-handling downstream
            const clonedArgs = foundry.utils.deepClone(args);
            await node._execute(clonedArgs);
        } catch (error: any) {
            const id = `${this.applicationKey}:${data.id}:${eventId}`;
            MODULE.error(`an error occurred while executing the event: ${id}`, error);
        }
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

type ApplicationKey = `${string}:${string}`;

type UserValue = {
    type: string;
    value: any;
};

type EmitableUserValue = {
    type: string;
    value: JSONValue | JSONValue[];
};

export { TriggerApplication };
export type {
    ApplicationKey,
    ApplicationParentType,
    EmitableUserValue,
    TriggerApplicationOptions,
    TriggersSetting,
    UserValue,
};
