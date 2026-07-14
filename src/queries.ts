import {
    ApplicationKey,
    AwaitConfirmActionNode,
    AwaitSelectActionNode,
    AwaitSelectQueryArgs,
    DescriptionInputsData,
    QueryUserArgs,
    TriggerApplication,
    TriggerPath,
} from "engine";

function onUserQuery(data: UserQueryOptions) {
    if (data._type === "await-confirm") {
        return AwaitConfirmActionNode.createDialog(data);
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
    ConfirmDialogQueryOptions | ExecuteEventQueryOptions | ExecuteTriggerQueryOptions | SelectDialogQueryOptions;

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

type ConfirmDialogQueryOptions = QueryUserArgs<"await-confirm"> & DescriptionInputsData;

type SelectDialogQueryOptions = QueryUserArgs<"await-select"> & AwaitSelectQueryArgs;

export { onUserQuery };
export type {
    ConfirmDialogQueryOptions,
    ExecuteEventQueryOptions,
    ExecuteTriggerQueryOptions,
    QueryUserArgs,
    SelectDialogQueryOptions,
    UserQueryOptions,
};
