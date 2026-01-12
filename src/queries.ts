import { ApplicationKey, TriggerApplication, TriggerPath, createConfirmDialog } from "engine";

function onUserQuery(data: UserQueryOptions) {
    if (data._type === "confirm-dialog") {
        return createConfirmDialog(data);
    }

    if (data._type === "execute-event") {
        const { applicationKey, args, eventName, userId } = data;
        return TriggerApplication.executeEvent(userId, applicationKey, eventName, args);
    }

    if (data._type === "execute-trigger") {
        const { args, eventName, triggerPath, userId } = data;
        return TriggerApplication.executeTriggerEvent(userId, triggerPath, eventName, args);
    }
}

type UserQueryOptions = ConfirmDialogQueryOptions | ExecuteEventQueryOptions | ExecuteTriggerQueryOptions;

type ExecuteTriggerQueryOptions = {
    _type: "execute-trigger";
    args: Record<string, any>;
    eventName: string;
    triggerPath: TriggerPath;
    userId: string;
};

type ExecuteEventQueryOptions = {
    _type: "execute-event";
    args: Record<string, any>;
    applicationKey: ApplicationKey;
    eventName: string;
    userId: string;
};

type ConfirmDialogQueryOptions = {
    _type: "confirm-dialog";
    content: string | undefined;
    key: string | undefined;
    timeout: number;
    title: string;
};

export { onUserQuery };
export type { ConfirmDialogQueryOptions, ExecuteEventQueryOptions, ExecuteTriggerQueryOptions };
