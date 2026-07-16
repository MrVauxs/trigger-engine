import {
    ApplicationKey,
    AwaitConfirmActionNode,
    AwaitInputActionNode,
    AwaitSelectActionNode,
    ConfirmDialogQueryOptions,
    InputDialogQueryOptions,
    QueryUserArgs,
    SelectDialogQueryOptions,
    TriggerApplication,
    TriggerPath,
} from "engine";

function onUserQuery(data: UserQueryOptions) {
    if (data._type === "await-confirm") {
        return AwaitConfirmActionNode.createDialog(data);
    }

    if (data._type === "await-input") {
        return AwaitInputActionNode.createDialog(data);
    }

    if (data._type === "await-select") {
        return AwaitSelectActionNode.createDialog(data);
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

type UserQueryOptions =
    | ConfirmDialogQueryOptions
    | ExecuteEventQueryOptions
    | ExecuteTriggerQueryOptions
    | InputDialogQueryOptions
    | SelectDialogQueryOptions;

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

export { onUserQuery };
export type { ExecuteEventQueryOptions, ExecuteTriggerQueryOptions, QueryUserArgs, UserQueryOptions };
