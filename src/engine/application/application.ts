import {
    BuiltInApplication,
    createCollection,
    createConvertorKey,
    EntryConvertor,
    NodeEntry,
    OpenTrigger,
    TriggerApplicationCollection,
    TriggerApplicationCollections,
    TriggerData,
    TriggerDataInput,
    TriggerGateEntry,
    TriggerGateExit,
    TriggerHook,
    TriggerNode,
} from "engine";
import { joinStr, LocalizeArgs, LocalizeData, MODULE, R } from "module-helpers";
import { BlueprintApplication } from "triggers-menu";
import utils = foundry.utils;

const APPLICATION_MODES = ["setting", "free"] as const;

class TriggerApplication {
    #applicationId: string;
    #applicationKey: string;
    #convertors: Collection<EntryConvertor>;
    #entries: Collection<typeof NodeEntry>;
    #hooks: Collection<typeof TriggerHook>;
    #mode: TriggerApplicationMode;
    #moduleId: string;
    #nodes: Collection<typeof TriggerNode>;

    constructor(moduleId: string, applicationId: string, options: TriggerApplicationOptions = {}) {
        this.#mode = R.isIncludedIn(options.mode, APPLICATION_MODES) ? options.mode : "setting";
        this.#moduleId = moduleId;
        this.#applicationId = applicationId;
        this.#applicationKey = `${moduleId}:${applicationId}`;

        this.#convertors = createCollection(options, "convertors");
        this.#entries = createCollection(options, "entries");
        this.#hooks = new Collection();
        this.#nodes = createCollection(options, "nodes");

        // add mandatory stuff
        this.#nodes.set(TriggerGateEntry.type, TriggerGateEntry);
        this.#nodes.set(TriggerGateExit.type, TriggerGateExit);

        // setup settings
        if (this.isSettingApplication) {
            this.#setupSetting(options.setting);
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

        const MenuCls = this.isFreeApplication
            ? this.#getFreeApplication(arg)
            : this.#getSettingApplication();

        if (MenuCls) {
            return new MenuCls().render(true);
        }
    }

    createTrigger(source: TriggerDataInput, open: boolean): OpenTrigger | null {
        try {
            const data = new TriggerData(source);
            return new OpenTrigger(this, data);
        } catch (error: any) {
            MODULE.error(`an error ocurred while trying to create a Trigger.`, error);
            return null;
        }
    }

    getConvertor(output: string, input: string): EntryConvertor | undefined {
        const key = createConvertorKey(output, input);
        return this.#convertors.get(key);
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

            getTriggersSources(): TriggerDataInput[] {
                return [test.toObject()];
            }
        };
    }

    #setupSetting({ hint, icon, label, name }: ApplicationMenuOptions = {}) {
        const self = this;
        const moduleId = this.moduleId;
        const applicationId = this.applicationId;
        const settingKey = this.settingKey;

        game.settings.register(moduleId, settingKey, {
            type: Array,
            default: [],
            scope: "world",
            config: false,
            name: settingKey,
            onChange: () => {
                // TODO prepareTriggers(R.values(APPLICATIONS));
            },
        });

        class SettingBlueprintApplication extends BlueprintApplication {
            get application(): TriggerApplication {
                return self;
            }

            getTriggersSources(): TriggerDataInput[] {
                const settings = game.settings.get<TriggerDataInput[]>(moduleId, settingKey);
                return utils.deepClone(settings) ?? [];
            }
        }

        const settingPath = (...path: string[]): string => {
            return `${moduleId}.${applicationId}.${path.join(".")}`;
        };

        game.settings.registerMenu(moduleId, this.settingMenuKey, {
            name: name ?? settingPath(applicationId, "name"),
            label: label ?? settingPath(applicationId, "label"),
            hint: hint ?? settingPath(applicationId, "hint"),
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
    [k in TriggerApplicationCollection]: true | (typeof BuiltInApplication)[k][number][0][];
};

type ApplicationMenuOptions = {
    hint?: string;
    icon?: string;
    label?: string;
    name?: string;
};

type TriggerApplicationMode = (typeof APPLICATION_MODES)[number] | "builtin";

export { TriggerApplication };
export type { ApplicationParentType, TriggerApplicationOptions };
