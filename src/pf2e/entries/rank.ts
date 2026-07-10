import { BaseInputEntrySchema, NodeEntry } from "engine";
import { R, ZeroToFour } from "foundry-helpers";
import { RankField, RankFieldSchema } from ".";

class RankEntry extends NodeEntry<ZeroToFour, RankFieldSchema> {
    static options: RankOption[] = R.times(5, (rank) => {
        return {
            value: String(rank) as RankEntryType,
            label: `PF2E.ProficiencyLevel${rank}`,
        };
    });

    static get type(): "rank" {
        return "rank";
    }

    static get FieldClass(): typeof RankField {
        return RankField;
    }

    static get default(): ZeroToFour {
        return 0;
    }

    static get color(): ColorSource {
        return 0x07b88f;
    }

    static isValidType(value: unknown): value is ZeroToFour {
        return R.isNumber(value) && value >= 0 && value <= 4;
    }

    static toJSON(value: ZeroToFour): ZeroToFour {
        return value;
    }

    static fromJSON(value: ZeroToFour): ZeroToFour {
        return value;
    }

    get options(): RankOption[] {
        return RankEntry.options;
    }

    generateTooltip(): undefined {
        return undefined;
    }
}

type InputRankEntry = BaseInputEntrySchema<"rank", Partial<RankFieldSchema>>;

type RankEntryType = `${ZeroToFour}`;

type RankOption = {
    value: RankEntryType;
    label: string;
};

export { RankEntry };
export type { InputRankEntry, RankEntryType };
