import {
    ApplicationParentType,
    NodeEntry,
    TriggerApplication,
    TriggerApplicationOptions,
    TriggerHook,
    TriggerNode,
} from "engine";
import { R } from "module-helpers";
import { BlueprintApplication } from "triggers-menu";
import abstract = foundry.abstract;

const APPLICATIONS: { [applicationKey: string]: TriggerApplication } = {};

function registerApplication(
    moduleId: string,
    applicationId: string,
    options?: TriggerApplicationOptions
) {
    const applicationKey = getApplicationKey(moduleId, applicationId);
    if (!applicationKey || applicationKey in APPLICATIONS) return;

    const parentType: ApplicationParentType = options?.setting ? "setting" : "document";
    const app = new TriggerApplication(parentType, moduleId, applicationId, options);

    APPLICATIONS[applicationKey] = app;

    // if (registered.nodes) {
    //     registerNodes(moduleId, applicationId, ...registered.nodes);
    // }

    // prepareTriggers(R.values(APPLICATIONS));

    console.log(APPLICATIONS);
}

function registerNodes(moduleId: string, applicationId: string, ...Nodes: (typeof TriggerNode)[]) {
    const app = getApplication(moduleId, applicationId);
    app?.registerNodes(...Nodes);
}

function registerEntries(
    moduleId: string,
    applicationId: string,
    ...Entries: (typeof NodeEntry)[]
) {
    const app = getApplication(moduleId, applicationId);
    app?.registerEntries(...Entries);
}

function registerHooks(moduleId: string, applicationId: string, ...Hooks: (typeof TriggerHook)[]) {
    const app = getApplication(moduleId, applicationId);
    app?.registerHooks(...Hooks);
}

function openBlueprintMenu(moduleId: string, applicationId: string, document?: abstract.Document) {
    const app = getApplication(moduleId, applicationId);
    if (!app) return;

    if (app.isSetting) {
        app.openSettingMenu();
    } else if (document instanceof abstract.Document) {
        app.openDocumentMenu(document);
    }
}

function getApplication(moduleId: string, applicationId: string): TriggerApplication | undefined {
    const applicationKey = getApplicationKey(moduleId, applicationId);
    return applicationKey ? APPLICATIONS[`${moduleId}:${applicationId}`] : undefined;
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

export {
    getApplication,
    getApplicationKey,
    openBlueprintMenu,
    registerApplication,
    registerEntries,
    registerHooks,
    registerNodes,
};
export type { RegisteredApplication };
