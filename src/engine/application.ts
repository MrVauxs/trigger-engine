import { ApplicationConfiguration, R } from "module-helpers";
import { BlueprintApplication } from "triggers-menu";
import { prepareTriggers } from "./trigger";
import { registerNodes, TriggerNode } from ".";

const APPLICATIONS: { [applicationKey: string]: RegisteredApplication } = {};

function registerApplication(
    moduleId: string,
    applicationId: string,
    setting: {
        hint?: string;
        icon?: string;
        label?: string;
        name?: string;
    },
    registered: {
        nodes?: (typeof TriggerNode)[];
    } = {}
) {
    const applicationKey = getApplicationKey(moduleId, applicationId);
    if (!applicationKey || applicationKey in APPLICATIONS) return;

    class ModuleBlueprintApplication extends BlueprintApplication {
        static DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
            id: `trigger-engine-blueprint-${applicationKey}`,
        };

        get moduleId(): string {
            return moduleId;
        }

        get applicationId(): string {
            return applicationId;
        }
    }

    const settingPath = (...path: string[]): string => {
        return `${moduleId}.${applicationId}.${path.join(".")}`;
    };

    game.settings.register(moduleId, `${applicationId}-triggers`, {
        type: Array,
        default: [],
        scope: "world",
        config: false,
        name: `${applicationId}-triggers`,
        onChange: () => {
            prepareTriggers(R.values(APPLICATIONS));
        },
    });

    game.settings.registerMenu(moduleId, `${applicationId}-menu`, {
        name: setting.name ?? settingPath(applicationId, "name"),
        label: setting.label ?? settingPath(applicationId, "label"),
        hint: setting.hint ?? settingPath(applicationId, "hint"),
        icon: setting.icon ?? "fas fa-cogs",
        restricted: true,
        type: ModuleBlueprintApplication,
    });

    APPLICATIONS[applicationKey] = {
        applicationId,
        menu: ModuleBlueprintApplication,
        moduleId,
    };

    if (registered.nodes) {
        registerNodes(moduleId, applicationId, ...registered.nodes);
    }

    prepareTriggers(R.values(APPLICATIONS));
}

function openBlueprintMenu(moduleId: string, applicationId: string) {
    const MenuCls = APPLICATIONS[`${moduleId}:${applicationId}`]?.menu;
    if (!MenuCls) return;

    new MenuCls().render(true);
}

function getApplicationKey(moduleId: string, applicationId: string): string | undefined {
    if (!R.isString(moduleId) || !R.isString(applicationId) || !game.modules.get(moduleId)?.active)
        return;

    return `${moduleId}:${applicationId}`;
}

type RegisteredApplication = {
    applicationId: string;
    menu: ConstructorOf<BlueprintApplication>;
    moduleId: string;
};

export { openBlueprintMenu, registerApplication, getApplicationKey };
export type { RegisteredApplication };
