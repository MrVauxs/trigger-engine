import { TriggerNode } from "engine";
import { ActorPF2e, ResourceData } from "module-helpers";
import { PF2eInputEntry } from "pf2e";

function resourceSchemas(): PF2eInputEntry[] {
    return [
        { key: "target", type: "target" },
        { key: "resource", type: "text" },
        {
            key: "value",
            type: "number",
            field: { default: 1, min: 0 },
        },
    ];
}

async function getResourceData(this: TriggerNode<any, ResourceInputs>): Promise<ResourceInputsData | undefined> {
    const actor = (await this.getInputValue("target"))?.actor;
    if (!actor) return;

    const slug = await this.getInputValue("resource");
    const resource = actor.getResource(slug);
    if (!resource) return;

    return {
        actor,
        resource,
        value: await this.getInputValue("value"),
    };
}

type ResourceInputs = {
    target?: TargetDocuments;
    resource: string;
    value: number;
};

type ResourceInputsData = {
    actor: ActorPF2e;
    resource: ResourceData;
    value: number;
};

export { getResourceData, resourceSchemas };
export type { ResourceInputs };
