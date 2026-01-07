import { TriggerApplication, TriggerPath } from "engine";

function onUserQuery(data: UserQueryOptions) {
    if (data.type === "execute-trigger") {
        const { args, eventName, triggerPath, userId } = data;
        return TriggerApplication.executeTriggerEvent(userId, triggerPath, eventName, args);
    }
}

type UserQueryOptions = ExecuteTriggerQueryOptions;

type ExecuteTriggerQueryOptions = {
    args: Record<string, any>;
    eventName: string;
    triggerPath: TriggerPath;
    type: "execute-trigger";
    userId: string;
};

export { onUserQuery };
export type { ExecuteTriggerQueryOptions };
