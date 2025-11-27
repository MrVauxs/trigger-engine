import {
    NodeEntry,
    Trigger,
    TriggerData,
    TriggerDataSource,
    TriggerHook,
    TriggerNode,
} from "engine";
import { ApplicationConfiguration, getFlag, MODULE, R } from "module-helpers";
import { BlueprintApplication } from "triggers-menu";
import abstract = foundry.abstract;
import utils = foundry.utils;

class TriggerApplication {
    #applicationId: string;
    #applicationKey: string;
    #entries: Collection<typeof NodeEntry>;
    #hooks: Collection<typeof TriggerHook>;
    #moduleId: string;
    #nodes: Collection<typeof TriggerNode>;
    #parentType: ApplicationParentType;
    #triggers: Collection<Trigger>;

    constructor(
        parentType: ApplicationParentType,
        moduleId: string,
        applicationId: string,
        { nodes, setting }: TriggerApplicationOptions = {}
    ) {
        this.#applicationId = applicationId;
        this.#applicationKey = `${moduleId}:${applicationId}`;
        this.#moduleId = moduleId;
        this.#parentType = parentType;

        this.#entries = new Collection();
        this.#hooks = new Collection();
        this.#nodes = new Collection();
        this.#triggers = new Collection();

        if (this.isSetting) {
            this.#setupSetting(moduleId, applicationId, R.isBoolean(setting) ? {} : setting);
        }
    }

    get applicationId(): string {
        return this.#applicationId;
    }

    get applicationKey(): string {
        return this.#applicationKey;
    }

    get isSetting(): boolean {
        return this.parentType === "setting";
    }

    get moduleId(): string {
        return this.#moduleId;
    }

    get parentType(): ApplicationParentType {
        return this.#parentType;
    }

    get triggers(): Collection<Trigger> {
        return this.#triggers;
    }

    initialize(triggers?: TriggerData[]) {
        this.#triggers.clear();

        // TODO
    }

    openSettingMenu(): Promise<BlueprintApplication> | undefined {
        if (!this.isSetting || !this.#openExistingMenu()) return;

        const menuKey = `${this.moduleId}.${getMenuKey(this.applicationId)}`;
        const MenuCls = game.settings.menus.get(menuKey);
        if (!MenuCls) return;

        const app = new MenuCls.type() as BlueprintApplication;
        return app.render(true);
    }

    openDocumentMenu(document: abstract.Document) {
        if (this.isSetting || !(document instanceof abstract.Document)) return;

        const menuId = this.#openExistingMenu(document);
        if (!menuId) return;

        const self = this;

        class DocumentBlueprintApplication extends BlueprintApplication {
            #document: abstract.Document = document;

            static DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
                id: menuId,
            };

            get application(): TriggerApplication {
                return self;
            }

            save(): Promise<void> {
                throw new Error("Method not implemented.");
            }
        }

        try {
            const flag = getFlag<TriggerDataSource[]>(document, "triggers") ?? [];
            const triggers = utils.deepClone(flag);
            const app = new DocumentBlueprintApplication(triggers);

            app.render(true);
        } catch (error) {}
    }

    registerNodes(...Nodes: (typeof TriggerNode)[]) {
        // const applicationKey = getApplicationKey(moduleId, applicationId);
        // if (!applicationKey) return;
        // for (const Node of Nodes) {
        //     if (R.isFunction(Node) && Node.prototype instanceof TriggerNode) {
        //         const application = (TRIGGER_NODES[applicationKey] ??= new Collection());
        //         application.set(Node.type, Node);
        //     }
        // }
    }

    registerEntries(...Entries: (typeof NodeEntry)[]) {}

    registerHooks(...Entries: (typeof TriggerHook)[]) {}

    getNodeClass(type: string): typeof TriggerNode | undefined {
        return this.#nodes.get(type);
    }

    createTrigger(source: DeepPartial<TriggerDataSource>): Trigger | undefined {
        try {
            const data = new TriggerData({
                ...source,
                applicationKey: this.applicationKey,
            });
            return new Trigger(this, data);
        } catch (error) {
            MODULE.error(`an error ocurred while trying to create a Trigger.`, error);
        }
    }

    #openExistingMenu(document?: abstract.Document): string | undefined {
        const menuId = R.pipe([getMenuId(this), document?.uuid], R.filter(R.isTruthy), R.join("-"));
        const exist = foundry.applications.instances.get(menuId);

        if (exist) {
            (exist as BlueprintApplication).expand();
        } else {
            return menuId;
        }
    }

    // we need those because at that point, it hasn't been defined by the child
    #setupSetting(
        moduleId: string,
        applicationId: string,
        { hint, icon, label, name }: ApplicationMenuOptions = {}
    ) {
        const self = this;
        const settingKey = `${applicationId}-triggers`;

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
            static DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
                id: getMenuId({ moduleId, applicationId }),
            };

            constructor(options?: DeepPartial<ApplicationConfiguration>) {
                const setting = game.settings.get<TriggerDataSource[]>(moduleId, settingKey) ?? [];
                const triggers = utils.deepClone(setting);

                super(triggers, options);
            }

            get application(): TriggerApplication {
                return self;
            }

            save(): Promise<void> {
                throw new Error("Method not implemented.");
            }
        }

        const settingPath = (...path: string[]): string => {
            return `${moduleId}.${applicationId}.${path.join(".")}`;
        };

        game.settings.registerMenu(moduleId, getMenuKey(applicationId), {
            name: name ?? settingPath(applicationId, "name"),
            label: label ?? settingPath(applicationId, "label"),
            hint: hint ?? settingPath(applicationId, "hint"),
            icon: icon ?? "fas fa-cogs",
            restricted: true,
            type: SettingBlueprintApplication,
        });
    }
}

function getMenuKey(applicationId: string) {
    return `${applicationId}-menu`;
}

function getMenuId({ moduleId, applicationId }: { moduleId: string; applicationId: string }) {
    return `trigger-engine-blueprint-${moduleId}:${applicationId}`;
}

type ApplicationParentType = "setting" | "document";

type TriggerApplicationOptions = {
    nodes?: (typeof TriggerNode)[];
    setting?: boolean | ApplicationMenuOptions;
};

type ApplicationMenuOptions = {
    hint?: string;
    icon?: string;
    label?: string;
    name?: string;
};

export { TriggerApplication };
export type { ApplicationParentType, TriggerApplicationOptions };
