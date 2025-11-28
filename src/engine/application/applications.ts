import {
    NodeEntry,
    TriggerApplication,
    TriggerApplicationOptions,
    TriggerDataSource,
    TriggerHook,
    TriggerNode,
} from "engine";
import { MODULE, R } from "module-helpers";
import { BlueprintApplication } from "triggers-menu";

const APPLICATIONS: { [applicationKey: string]: TriggerApplication } = {};

function registerApplication(
    moduleId: string,
    applicationId: string,
    options?: TriggerApplicationOptions
) {
    const applicationKey = getApplicationKey(moduleId, applicationId);
    if (!applicationKey || applicationKey in APPLICATIONS) return;

    const app = new TriggerApplication(moduleId, applicationId, options);
    APPLICATIONS[applicationKey] = app;

    MODULE.debug(app.applicationKey, app);
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

async function openBlueprintMenu(
    moduleId: string,
    applicationId: string,
    source?: TriggerDataSource
): Promise<BlueprintApplication | undefined> {
    const app = getApplication(moduleId, applicationId);
    return app?.openMenu(source);
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
