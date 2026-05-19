import { BuiltinsOutputEntry, RegionEvent, RegionEventOutputs } from "engine";
import { ItemPF2e } from "foundry-helpers";
import { PF2eRegionEventOptions } from "pf2e";

class PF2eRegionEvent extends RegionEvent<Outputs> {
    static get defineOutputs(): BuiltinsOutputEntry[] {
        return [
            ...super.defineOutputs,
            { key: "origin", type: "target" },
            { key: "item", type: "item" },
            { key: "options", type: "text", isArray: true },
        ];
    }

    _setOutputs(options: Required<PF2eRegionEventOptions>) {
        super._setOutputs(options);
        this.setOutputValue("item", options.item);
        this.setOutputValue("options", options.options);
        this.setOutputValue("origin", options.origin);
    }
}

type Outputs = RegionEventOutputs & {
    item?: ItemPF2e;
    options: string[];
    origin: TargetDocuments;
};

export { PF2eRegionEvent };
