import { InsideRegionConditionNode } from "engine";
import { SYSTEM } from "foundry-helpers";

class InsideTemplateConditionNode extends InsideRegionConditionNode {
    static get type() {
        return "inside-template";
    }

    async _testRegionCallback(): Promise<(region: RegionDocument) => boolean> {
        const name = await this.getInputValue("name");

        return (region: RegionDocument) => {
            const slug = foundry.utils.getProperty(region, `flags.${SYSTEM.id}.origin.slug`) as string | undefined;
            return slug === name;
        };
    }
}

export { InsideTemplateConditionNode };
