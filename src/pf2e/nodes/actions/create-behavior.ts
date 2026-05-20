import { BuiltinsInputEntry, CreateBehaviorActionNode, CreateBehaviorState } from "engine";
import { MovementType, R, RegionBehaviorPF2e } from "foundry-helpers";

class PF2eCreateBehaviorActionNode extends CreateBehaviorActionNode<State> {
    static #moves?: MovementType[];

    static get states(): string[] {
        return [...super.states, "terrain"];
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

    static get defineInputs(): BuiltinsInputEntry[] {
        return [
            ...super.defineInputs,
            ...this.moves.map((move): BuiltinsInputEntry => {
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

    async _getSystemSource(): Promise<PreCreate<RegionBehaviorPF2e["_source"]>["system"]> {
        if (this.state === "terrain") {
            const moves = await Promise.all(
                PF2eCreateBehaviorActionNode.moves.map(async (move) => {
                    const value: string = await this.getInputValue(move);
                    return [move, Number(value)] as const;
                }),
            );
            return { difficulties: R.fromEntries(moves) };
        }

        return super._getSystemSource();
    }

    async _getType(): Promise<string> {
        return this.state === "terrain" ? "modifyMovementCost" : super._getType();
    }
}

type State = CreateBehaviorState | "terrain";

export { PF2eCreateBehaviorActionNode };
