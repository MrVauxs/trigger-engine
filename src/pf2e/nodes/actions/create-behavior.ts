import { IconObject } from "_zod";
import { BaseActionNode } from "engine";
import { MovementType, R, RegionBehaviorPF2e, splitListString } from "foundry-helpers";
import { PF2eInputEntry } from "pf2e";

class CreateBehaviorActionNode extends BaseActionNode<"out", Inputs, never, never, never, State> {
    static #moves?: MovementType[];

    static get type(): "create-behavior" {
        return "create-behavior";
    }

    static get tags(): string[] {
        return ["region"];
    }

    static get states(): string[] {
        return ["source", "trigger", "terrain"];
    }

    static get moves(): MovementType[] {
        return (this.#moves ??= R.pipe(
            CONFIG.Token.movement.actions,
            R.entries(),
            R.filter(([_, { deriveTerrainDifficulty, terrainAction }]) => {
                return R.isNullish(terrainAction) && R.isNullish(deriveTerrainDifficulty);
            }),
            R.map(([key]) => key as MovementType),
        ));
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            { key: "region", type: "any" },
            { key: "name", type: "text" },
            { key: "type", type: "text", state: "source" },
            {
                key: "events",
                type: "text",
                field: { default: "tokenEnter, tokenExit" },
                state: ["source", "trigger"],
            },
            {
                key: "source",
                type: "text",
                field: { type: "json" },
                state: "source",
            },
            {
                key: "path",
                type: "text",
                state: "trigger",
            },
            ...this.moves.map((move): PF2eInputEntry => {
                const label = CONFIG.Token.movement.actions[move].label;

                return {
                    key: move,
                    type: "text",
                    label,
                    state: "terrain",
                    field: {
                        type: "select",
                        options: [
                            { value: "1", label },
                            { value: "2", label: "PF2E.Region.DifficultTerrain.DifficultTerrain" },
                            { value: "3", label: "PF2E.Region.DifficultTerrain.GreaterDifficultTerrain" },
                        ],
                    },
                };
            }),
        ];
    }

    get icon(): IconObject {
        return { unicode: "\ue59d", fontWeight: "900" };
    }

    get subtitle(): string | null {
        return this.state === "source" ? super.subtitle : (this.localize(`states.${this.state}`) as string);
    }

    async _execute(): Promise<boolean> {
        const region = await this.getInputValue("region");
        const type = await this.#getType();

        if (!(type in CONFIG.RegionBehavior.dataModels) || !(region instanceof RegionDocument)) {
            return this.executeNext("out");
        }

        const source: PreCreate<RegionBehaviorPF2e["_source"]> = {
            name: (await this.getInputValue("name")) || RegionBehavior.defaultName({ type, parent: region }),
            type,
        };

        if (this.state === "source") {
            try {
                const systemStr = await this.getInputValue("source");
                const system = JSON.parse(systemStr);

                if (R.isPlainObject(systemStr)) {
                    source.system = system;
                }
            } catch {}
        } else if (this.state === "terrain") {
            const moves = await Promise.all(
                CreateBehaviorActionNode.moves.map(async (move) => {
                    const value = await this.getInputValue(move);
                    return [move, Number(value)] as const;
                }),
            );

            source.system = { difficulties: R.fromEntries(moves) };
        } else if (this.state === "trigger") {
            const path = (await this.getInputValue("path")) || this.triggerPath;
            source.system = { path };
        }

        if (R.isIncludedIn(this.state, ["source", "trigger"])) {
            const eventsStr = await this.getInputValue("events");
            const events = splitListString(eventsStr);

            if (events.length) {
                foundry.utils.setProperty(source, "system.events", events);
            }
        }

        await region.createEmbeddedDocuments("RegionBehavior", [source]);

        return this.executeNext("out");
    }

    async #getType(): Promise<string> {
        switch (this.state) {
            case "source":
                return this.getInputValue("type");
            case "terrain":
                return "modifyMovementCost";
            case "trigger":
                return "trigger-engine.builtins.region";
            default:
                return "";
        }
    }
}

type Inputs = Record<MovementType, string> & {
    events: string;
    name: string;
    path: string;
    region?: any;
    source: string;
    type: string;
};

type State = "source" | "trigger" | "terrain";

export { CreateBehaviorActionNode };
