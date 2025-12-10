import {
    BuiltInApplication,
    createCollection,
    NodeEntry,
    Trigger,
    TriggerApplicationCollection,
    TriggerApplicationCollections,
    TriggerData,
    TriggerDataSource,
    TriggerHook,
    TriggerNode,
} from "engine";
import { MODULE, R } from "module-helpers";
import { BlueprintApplication } from "triggers-menu";
import utils = foundry.utils;

const APPLICATION_MODES = ["setting", "free"] as const;

class TriggerApplication {
    #applicationId: string;
    #applicationKey: string;
    #entries: Collection<typeof NodeEntry>;
    #hooks: Collection<typeof TriggerHook>;
    #mode: TriggerApplicationMode;
    #moduleId: string;
    #nodes: Collection<typeof TriggerNode>;
    #triggers: Collection<Trigger>;

    constructor(moduleId: string, applicationId: string, options: TriggerApplicationOptions = {}) {
        this.#mode = R.isIncludedIn(options.mode, APPLICATION_MODES) ? options.mode : "setting";
        this.#moduleId = moduleId;
        this.#applicationId = applicationId;
        this.#applicationKey = `${moduleId}:${applicationId}`;

        this.#entries = createCollection(options, "entries");
        this.#hooks = new Collection();
        this.#nodes = createCollection(options, "nodes");
        this.#triggers = new Collection();

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

    get triggers(): Collection<Trigger> {
        return this.#triggers;
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

    initialize(triggers?: TriggerData[]) {
        this.#triggers.clear();

        // TODO
    }

    async openMenu(arg?: TriggerDataSource): Promise<BlueprintApplication | undefined> {
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

    createTrigger(source: DeepPartial<TriggerDataSource>, open: boolean): Trigger | null {
        try {
            const data = new TriggerData({ ...source, applicationKey: this.applicationKey });
            return new Trigger(this, data, true);
        } catch (error) {
            MODULE.error(`an error ocurred while trying to create a Trigger.`, error);
            return null;
        }
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

            getTriggersSources(): TriggerDataSource[] {
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
                // prepareTriggers(R.values(APPLICATIONS));
            },
        });

        class SettingBlueprintApplication extends BlueprintApplication {
            get application(): TriggerApplication {
                return self;
            }

            getTriggersSources(): TriggerDataSource[] {
                const settings = game.settings.get<TriggerDataSource[]>(moduleId, settingKey);
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
    builtins?: Record<TriggerApplicationCollection, string[] | boolean>;
    mode?: TriggerApplicationMode;
    setting?: ApplicationMenuOptions;
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
